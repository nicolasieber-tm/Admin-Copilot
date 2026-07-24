// Analyse-Pipeline (Spez 14.4, 30.1): jeder Schritt persistiert seinen
// Zustand in document_analyses, damit Läufe nachvollziehbar und
// wiederaufnehmbar sind. Erneute Analyse = neue analysis_version.

import { encodeBase64 } from "jsr:@std/encoding/base64";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { AiProvider, DocumentInput } from "../_shared/ai/provider.ts";
import { ProviderError } from "../_shared/ai/provider.ts";
import type { Extraction } from "../_shared/ai/schemas.ts";
import { log } from "../_shared/log.ts";
import { parseSwissQr, type SwissQrData } from "../_shared/qr.ts";
import { validate } from "../_shared/validation.ts";

const MAX_PAGES = 10;
const MAX_PDF_BYTES = 15 * 1024 * 1024;

type DocumentRow = {
  id: string;
  workspace_id: string;
  uploaded_by: string;
  title: string | null;
  original_filename: string | null;
  mime_type: string | null;
  file_size: number | null;
  deleted_at: string | null;
};

type PageRow = {
  page_number: number;
  image_storage_path: string | null;
  extraction_metadata: { qr_raw?: string } | null;
};

export async function processDocument(
  supabase: SupabaseClient,
  provider: AiProvider,
  documentId: string
): Promise<void> {
  const startedAt = Date.now();

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select(
      "id, workspace_id, uploaded_by, title, original_filename, mime_type, file_size, deleted_at"
    )
    .eq("id", documentId)
    .maybeSingle<DocumentRow>();

  if (docError) throw docError;
  if (!doc || doc.deleted_at) {
    log("analysis_skipped", { document_id: documentId, reason: "missing_or_deleted" });
    return;
  }

  // Neue Analyse-Version anlegen (Spez 25.5: nie doppelte Ergebnisse)
  const { data: previous } = await supabase
    .from("document_analyses")
    .select("analysis_version")
    .eq("document_id", doc.id)
    .order("analysis_version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const version = (previous?.analysis_version ?? 0) + 1;

  const { data: analysis, error: analysisError } = await supabase
    .from("document_analyses")
    .insert({
      document_id: doc.id,
      workspace_id: doc.workspace_id,
      analysis_version: version,
      provider: provider.name,
      model: provider.model,
      prompt_version: provider.promptVersion,
      status: "preprocessing",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (analysisError) throw analysisError;

  const setStatus = async (status: string, extra: Record<string, unknown> = {}) => {
    await supabase
      .from("document_analyses")
      .update({ status, ...extra })
      .eq("id", analysis.id);
  };

  try {
    // Vorverarbeitung: Seiten laden, QR-Payload einsammeln
    const { data: pages, error: pagesError } = await supabase
      .from("document_pages")
      .select("page_number, image_storage_path, extraction_metadata")
      .eq("document_id", doc.id)
      .order("page_number")
      .returns<PageRow[]>();
    if (pagesError) throw pagesError;
    if (!pages || pages.length === 0) {
      throw new ProviderError("no_pages", "Dokument hat keine Seiten", false);
    }
    if (pages.length > MAX_PAGES) {
      throw new ProviderError("too_many_pages", `${pages.length} Seiten`, false);
    }

    let qr: SwissQrData | null = null;
    for (const page of pages) {
      const raw = page.extraction_metadata?.qr_raw;
      if (raw) {
        qr = parseSwissQr(raw);
        if (qr) break;
      }
    }

    const input = await buildDocumentInput(supabase, doc, pages);

    // Texterkennung + Klassifikation (multimodal in einem Modellaufruf –
    // die Statusstufen bleiben zur Nachvollziehbarkeit erhalten)
    await setStatus("text_extraction");
    await setStatus("classification");
    const classification = await provider.classify(input);
    await setStatus("structured_extraction", {
      classification_result: classification,
    });

    const extraction = await provider.extract(input, classification);

    await setStatus("validation", { extraction_result: extraction });
    const merged = applyQrOverride(extraction, qr);
    const validation = validate(merged, qr);

    await setStatus("explanation_generation", { validation_result: validation });
    const { data: prefs } = await supabase
      .from("users")
      .select("preferred_language, explanation_mode")
      .eq("id", doc.uploaded_by)
      .maybeSingle();
    const explanation = await provider.explain({
      classification,
      extraction: merged,
      validationNotes: validation.uncertainties,
      language: prefs?.preferred_language ?? "de",
      mode: (prefs?.explanation_mode as "normal" | "simple") ?? "normal",
    });

    // Ergebnis persistieren: Entities ersetzen die des letzten Laufs,
    // vom Nutzer bestätigte Werte bleiben unangetastet (Spez 21.5)
    await supabase
      .from("document_entities")
      .delete()
      .eq("document_id", doc.id)
      .eq("confirmed_by_user", false);
    const entities = buildEntities(doc, merged, qr, validation.uncertainties);
    if (entities.length > 0) {
      const { error: entitiesError } = await supabase
        .from("document_entities")
        .insert(entities);
      if (entitiesError) throw entitiesError;
    }

    await setStatus("completed", {
      explanation_result: explanation,
      completed_at: new Date().toISOString(),
    });

    await supabase
      .from("documents")
      .update({
        status: "ready_for_review",
        category: classification.category,
        subcategory: classification.subcategory,
        detected_language: classification.language,
        sender_name: merged.sender_name.value,
        recipient_name: merged.recipient_name.value,
        document_date: merged.document_date.value,
        requires_action: classification.requires_action,
        contains_financial_impact: classification.potential_financial_impact,
        analysis_confidence: classification.confidence,
        title: doc.title ?? merged.document_title,
      })
      .eq("id", doc.id);

    await supabase.from("notifications").insert({
      user_id: doc.uploaded_by,
      workspace_id: doc.workspace_id,
      type: "analysis_completed",
      title: "Dokument analysiert",
      message: "Bitte prüfe und bestätige die erkannten Angaben.",
      related_entity_type: "document",
      related_entity_id: doc.id,
    });

    await supabase.from("audit_events").insert({
      workspace_id: doc.workspace_id,
      user_id: null,
      action: "analysis_completed",
      entity_type: "document",
      entity_id: doc.id,
      metadata: {
        analysis_version: version,
        model: provider.model,
        duration_ms: Date.now() - startedAt,
      },
    });

    log("analysis_completed", {
      document_id: doc.id,
      analysis_version: version,
      model: provider.model,
      duration_ms: Date.now() - startedAt,
    });
  } catch (error) {
    const code = error instanceof ProviderError ? error.code : "internal_error";
    const message =
      error instanceof Error ? error.message.slice(0, 500) : String(error);
    await setStatus("failed", {
      error_code: code,
      error_message: message,
      completed_at: new Date().toISOString(),
    });
    await supabase
      .from("documents")
      .update({ status: "failed" })
      .eq("id", doc.id);
    await supabase.from("audit_events").insert({
      workspace_id: doc.workspace_id,
      user_id: null,
      action: "analysis_failed",
      entity_type: "document",
      entity_id: doc.id,
      metadata: { analysis_version: version, error_code: code },
    });
    throw error;
  }
}

async function buildDocumentInput(
  supabase: SupabaseClient,
  doc: DocumentRow,
  pages: PageRow[]
): Promise<DocumentInput> {
  if (doc.mime_type === "application/pdf") {
    if ((doc.file_size ?? 0) > MAX_PDF_BYTES) {
      throw new ProviderError("pdf_too_large", `${doc.file_size} Bytes`, false);
    }
    const path = pages[0].image_storage_path;
    if (!path) throw new ProviderError("missing_file", "PDF-Pfad fehlt", false);
    const base64 = await downloadBase64(supabase, path);
    return {
      kind: "pdf",
      filename: doc.original_filename ?? "dokument.pdf",
      base64,
    };
  }

  const images = [];
  for (const page of pages) {
    if (!page.image_storage_path) continue;
    images.push({
      pageNumber: page.page_number,
      base64: await downloadBase64(supabase, page.image_storage_path),
      mimeType: page.image_storage_path.endsWith(".png")
        ? "image/png"
        : "image/jpeg",
    });
  }
  if (images.length === 0) {
    throw new ProviderError("missing_file", "Keine Seitenbilder gefunden", false);
  }
  return { kind: "images", pages: images };
}

async function downloadBase64(
  supabase: SupabaseClient,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage.from("documents").download(path);
  if (error || !data) {
    throw new ProviderError("storage_download_failed", path, true);
  }
  return encodeBase64(new Uint8Array(await data.arrayBuffer()));
}

/** Deterministische QR-Werte überschreiben die Modell-Extraktion. */
function applyQrOverride(extraction: Extraction, qr: SwissQrData | null): Extraction {
  if (!qr) return extraction;
  const merged = structuredClone(extraction);
  if (qr.amount != null) {
    merged.amount = {
      value: qr.amount,
      currency: qr.currency ?? merged.amount.currency,
      amount_type: merged.amount.amount_type ?? "payment_due",
      source_text: "Swiss-QR-Code",
      page_number: merged.amount.page_number,
      confidence: 1,
    };
  }
  merged.account_or_iban = {
    value: qr.iban,
    source_text: "Swiss-QR-Code",
    page_number: merged.account_or_iban.page_number,
    confidence: 1,
  };
  if (qr.reference && qr.referenceType !== "NON") {
    merged.reference_number = {
      value: qr.reference,
      source_text: "Swiss-QR-Code",
      page_number: merged.reference_number.page_number,
      confidence: 1,
    };
  }
  return merged;
}

function buildEntities(
  doc: DocumentRow,
  extraction: Extraction,
  qr: SwissQrData | null,
  uncertainties: string[]
) {
  const base = { document_id: doc.id, workspace_id: doc.workspace_id };
  const rows: Record<string, unknown>[] = [];

  const simple = (
    entityType: string,
    field: {
      value: string | null;
      source_text: string | null;
      page_number: number | null;
      confidence: number;
    }
  ) => {
    if (field.value == null) return;
    rows.push({
      ...base,
      entity_type: entityType,
      value_text: field.value,
      source_text: field.source_text,
      page_number: field.page_number,
      confidence: field.confidence,
    });
  };

  simple("sender", extraction.sender_name);
  simple("recipient", extraction.recipient_name);
  simple("document_date", extraction.document_date);
  simple("due_date", extraction.due_date);
  simple("reference_number", extraction.reference_number);
  simple("iban", extraction.account_or_iban);
  simple("period", extraction.period);
  simple("consequence", extraction.possible_consequence);

  if (extraction.amount.value != null) {
    rows.push({
      ...base,
      entity_type: "amount",
      value_text: `${extraction.amount.value.toFixed(2)} ${extraction.amount.currency ?? "CHF"}`,
      value_json: extraction.amount,
      source_text: extraction.amount.source_text,
      page_number: extraction.amount.page_number,
      confidence: extraction.amount.confidence,
    });
  }
  if (extraction.contact.phone) {
    rows.push({ ...base, entity_type: "phone", value_text: extraction.contact.phone, confidence: 0.9 });
  }
  if (extraction.contact.email) {
    rows.push({ ...base, entity_type: "email", value_text: extraction.contact.email, confidence: 0.9 });
  }
  for (const action of extraction.required_actions) {
    rows.push({
      ...base,
      entity_type: "required_action",
      value_text: action.description,
      value_json: action,
      confidence: 0.8,
    });
  }
  if (extraction.recurrence.is_recurring != null) {
    rows.push({
      ...base,
      entity_type: "recurrence",
      value_text: extraction.recurrence.is_recurring
        ? `wiederkehrend (${extraction.recurrence.frequency ?? "unbekannt"})`
        : "einmalig",
      value_json: extraction.recurrence,
      confidence: 0.8,
    });
  }
  if (qr) {
    rows.push({
      ...base,
      entity_type: "swiss_qr",
      value_text: qr.iban,
      value_json: qr,
      confidence: 1,
    });
  }
  for (const note of uncertainties) {
    rows.push({ ...base, entity_type: "uncertainty", value_text: note, confidence: 1 });
  }
  return rows;
}
