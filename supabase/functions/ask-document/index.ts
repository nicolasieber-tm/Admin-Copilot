// Dokumentchat (Spez 24.11): synchrone Edge Function. Läuft im RLS-Kontext
// des aufrufenden Nutzers (JWT wird durchgereicht) – kein Service Role nötig,
// der Nutzer kann nur eigene Dokumente befragen. Antwort mit Quellenbezug
// und Unsicherheitshinweis, gespeichert in document_questions.

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { encodeBase64 } from "jsr:@std/encoding/base64";
import { ProviderError, type DocumentInput } from "../_shared/ai/provider.ts";
import { OpenAiProvider } from "../_shared/ai/providers/openai.ts";
import { log, logError } from "../_shared/log.ts";

const MAX_QUESTION_LENGTH = 500;
// Kostenschutz (Spez, offener Punkt Kostenkontrolle): Fragen pro Nutzer/Tag
const MAX_QUESTIONS_PER_DAY = 30;
const MAX_PDF_BYTES = 15 * 1024 * 1024;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed" });
  }

  // Client im Kontext des Nutzers: alle Zugriffe laufen durch RLS
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      auth: { persistSession: false },
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return jsonResponse(401, { error: "unauthorized" });
  }

  let body: { document_id?: string; question?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: "invalid_json" });
  }
  const documentId = body.document_id;
  const question = (body.question ?? "").trim();
  if (!documentId || question.length < 3) {
    return jsonResponse(400, { error: "invalid_request" });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return jsonResponse(400, { error: "question_too_long" });
  }

  try {
    // Tageslimit des Nutzers (RLS zeigt nur eigene Fragen)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("document_questions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since);
    if ((count ?? 0) >= MAX_QUESTIONS_PER_DAY) {
      return jsonResponse(429, { error: "daily_limit_reached" });
    }

    const { data: doc } = await supabase
      .from("documents")
      .select(
        "id, workspace_id, original_filename, mime_type, file_size, status"
      )
      .eq("id", documentId)
      .is("deleted_at", null)
      .maybeSingle();
    if (!doc) {
      return jsonResponse(404, { error: "document_not_found" });
    }

    const [{ data: pages }, { data: analysis }, { data: prefs }] =
      await Promise.all([
        supabase
          .from("document_pages")
          .select("page_number, image_storage_path")
          .eq("document_id", doc.id)
          .order("page_number"),
        supabase
          .from("document_analyses")
          .select("classification_result, extraction_result, explanation_result")
          .eq("document_id", doc.id)
          .eq("status", "completed")
          .order("analysis_version", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("users")
          .select("preferred_language, explanation_mode")
          .eq("id", user.id)
          .maybeSingle(),
      ]);
    if (!analysis) {
      return jsonResponse(409, { error: "analysis_not_ready" });
    }

    const input = await buildDocumentInput(supabase, doc, pages ?? []);
    const provider = new OpenAiProvider();
    const answer = await provider.ask(input, {
      question,
      analysisContext: {
        classification: analysis.classification_result,
        extraction: analysis.extraction_result,
        explanation: analysis.explanation_result,
      },
      language: prefs?.preferred_language ?? "de",
      mode: (prefs?.explanation_mode as "normal" | "simple") ?? "normal",
    });

    const { data: saved, error: insertError } = await supabase
      .from("document_questions")
      .insert({
        document_id: doc.id,
        workspace_id: doc.workspace_id,
        user_id: user.id,
        question,
        answer: answer.answer,
        cited_pages: answer.cited_pages,
        cited_entities: answer.uncertainty_note
          ? { uncertainty_note: answer.uncertainty_note }
          : null,
        provider: provider.name,
        model: provider.model,
      })
      .select("id, question, answer, cited_pages, cited_entities, created_at")
      .single();
    if (insertError) throw insertError;

    log("question_answered", {
      document_id: doc.id,
      question_length: question.length,
      cited_pages: answer.cited_pages.length,
      model: provider.model,
    });
    return jsonResponse(200, { question: saved });
  } catch (err) {
    const code = err instanceof ProviderError ? err.code : "internal_error";
    logError("question_failed", {
      document_id: documentId,
      code,
      message: err instanceof Error ? err.message.slice(0, 300) : String(err),
    });
    return jsonResponse(500, { error: code });
  }
});

// Bewusst lokale Kopie der kleinen Ladelogik aus analyse-document/pipeline.ts –
// hält die Funktionen unabhängig deploybar.
async function buildDocumentInput(
  supabase: SupabaseClient,
  doc: {
    mime_type: string | null;
    file_size: number | null;
    original_filename: string | null;
  },
  pages: { page_number: number; image_storage_path: string | null }[]
): Promise<DocumentInput> {
  if (doc.mime_type === "application/pdf") {
    if ((doc.file_size ?? 0) > MAX_PDF_BYTES) {
      throw new ProviderError("pdf_too_large", `${doc.file_size} Bytes`, false);
    }
    const path = pages[0]?.image_storage_path;
    if (!path) throw new ProviderError("missing_file", "PDF-Pfad fehlt", false);
    return {
      kind: "pdf",
      filename: doc.original_filename ?? "dokument.pdf",
      base64: await downloadBase64(supabase, path),
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
