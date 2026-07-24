import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { de } from "@/lib/i18n/de";
import {
  formatDate,
  formatDateValue,
  formatFileSize,
  formatIsoDatesInText,
  statusBadgeClass,
  statusLabel,
} from "@/lib/documents";
import { AnalysisLive } from "@/components/documents/analysis-live";
import {
  ConfirmCard,
  type BudgetMergeCandidate,
} from "@/components/documents/confirm-card";
import { currentMonthParam } from "@/lib/budget";
import { DeleteDocumentButton } from "@/components/documents/delete-document-button";
import {
  DocumentChat,
  type ChatQuestion,
} from "@/components/documents/document-chat";
import { RetryAnalysisButton } from "@/components/documents/retry-analysis-button";
import { TaskItem } from "@/components/tasks/task-item";
import type { TaskListItem } from "@/lib/tasks";

export const metadata: Metadata = { title: de.documents.detail.title };

type ExplanationResult = {
  what_is_it?: string;
  why_it_matters?: string;
  what_to_do?: string[];
  possible_consequence?: string | null;
  uncertainties?: string[];
};

type EntityRow = {
  id: string;
  entity_type: string;
  value_text: string | null;
  value_json: unknown;
  corrected_value: string | null;
  confirmed_by_user: boolean;
  source_text: string | null;
  page_number: number | null;
  confidence: number | null;
};

function entityDisplayValue(entity: EntityRow): string {
  const raw = entity.corrected_value ?? entity.value_text ?? "";
  if (entity.entity_type === "due_date" || entity.entity_type === "document_date") {
    return formatDateValue(raw);
  }
  if (entity.entity_type === "amount" && entity.corrected_value) {
    const currency =
      (entity.value_json as { currency?: string } | null)?.currency ?? "CHF";
    const parsed = Number(entity.corrected_value);
    return Number.isFinite(parsed)
      ? `${parsed.toFixed(2)} ${currency}`
      : entity.corrected_value;
  }
  return raw;
}

const ENTITY_ORDER = [
  "amount",
  "due_date",
  "sender",
  "document_date",
  "reference_number",
  "iban",
  "period",
  "required_action",
  "recurrence",
  "phone",
  "email",
  "consequence",
];

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select(
      "id, title, original_filename, mime_type, file_size, page_count, status, category, created_at, storage_path"
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!doc) {
    notFound();
  }

  const isProcessing = doc.status === "processing" || doc.status === "uploaded";

  const [{ data: pages }, { data: analysis }, { data: entities }, { data: tasks }] =
    await Promise.all([
      supabase
        .from("document_pages")
        .select("page_number, image_storage_path")
        .eq("document_id", doc.id)
        .order("page_number"),
      supabase
        .from("document_analyses")
        .select("status, explanation_result, error_code")
        .eq("document_id", doc.id)
        .order("analysis_version", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("document_entities")
        .select(
          "id, entity_type, value_text, value_json, corrected_value, confirmed_by_user, source_text, page_number, confidence"
        )
        .eq("document_id", doc.id)
        .returns<EntityRow[]>(),
      supabase
        .from("tasks")
        .select(
          "id, title, status, priority, action_type, due_at, amount, currency, document_id, completed_at"
        )
        .eq("document_id", doc.id)
        .order("created_at")
        .returns<TaskListItem[]>(),
    ]);

  const { data: questions } = await supabase
    .from("document_questions")
    .select("id, question, answer, cited_pages, cited_entities, created_at")
    .eq("document_id", doc.id)
    .order("created_at")
    .returns<ChatQuestion[]>();

  // Kurzlebige signierte URLs (Spez 20.2) – nie öffentliche Dokument-URLs
  const paths = (pages ?? [])
    .map((p) => p.image_storage_path)
    .filter((p): p is string => !!p);
  const { data: signed } = paths.length
    ? await supabase.storage.from("documents").createSignedUrls(paths, 600)
    : { data: [] };
  const signedByPath = new Map<string, string>(
    (signed ?? [])
      .filter((s) => !s.error && s.path && s.signedUrl)
      .map((s) => [s.path as string, s.signedUrl as string])
  );

  const isPdf = doc.mime_type === "application/pdf";
  const hasResult = ["ready_for_review", "confirmed", "action_open", "completed"].includes(
    doc.status
  );
  const explanation =
    hasResult && analysis?.status === "completed"
      ? (analysis.explanation_result as ExplanationResult | null)
      : null;
  // Unsicherheiten bevorzugt aus der Erklärung (Sprache des Nutzers);
  // die rohen Entity-Hinweise sind nur der Fallback
  const entityUncertainties = (entities ?? [])
    .filter((e) => e.entity_type === "uncertainty")
    .map((e) => e.value_text)
    .filter((v): v is string => !!v);
  const uncertainties = (
    explanation?.uncertainties && explanation.uncertainties.length > 0
      ? explanation.uncertainties
      : entityUncertainties
  ).map(formatIsoDatesInText);
  const factEntities = (entities ?? [])
    .filter((e) => ENTITY_ORDER.includes(e.entity_type))
    .sort(
      (a, b) =>
        ENTITY_ORDER.indexOf(a.entity_type) - ENTITY_ORDER.indexOf(b.entity_type)
    );

  const amountEntity = (entities ?? []).find((e) => e.entity_type === "amount");
  const dueDateEntity = (entities ?? []).find((e) => e.entity_type === "due_date");
  const amountInputValue =
    (amountEntity?.value_json as { value?: number } | null)?.value?.toString() ??
    amountEntity?.value_text?.split(" ")[0] ??
    "";

  // Kandidaten fürs Zusammenführen: bestehende Posten ohne Dokumentbezug im
  // Monat der Frist – verhindert Doppelzählung fixer Kosten (Spez 25.5)
  let budgetCandidates: BudgetMergeCandidate[] = [];
  if (doc.status === "ready_for_review" && amountEntity) {
    const dueIso = dueDateEntity?.corrected_value ?? dueDateEntity?.value_text;
    const monthStart =
      dueIso && /^\d{4}-\d{2}-\d{2}$/.test(dueIso)
        ? `${dueIso.slice(0, 7)}-01`
        : `${currentMonthParam()}-01`;
    const { data: candidates } = await supabase
      .from("budget_items")
      .select("id, title, amount, currency, budget_plans!inner(month)")
      .eq("budget_plans.month", monthStart)
      .is("document_id", null)
      .is("deleted_at", null)
      .in("status", ["planned", "due"]);
    budgetCandidates = (candidates ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      amount: c.amount,
      currency: c.currency,
    }));
  }

  return (
    <div className="flex flex-col gap-5">
      <AnalysisLive documentId={doc.id} isProcessing={isProcessing} />

      <Link href="/documents" className="text-sm font-medium text-accent hover:underline">
        ← {de.documents.title}
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {doc.title ?? doc.original_filename ?? de.documents.detail.title}
        </h1>
        <span
          className={`self-start rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(doc.status)}`}
        >
          {statusLabel(doc.status)}
        </span>
        {(doc.status === "failed" && analysis?.error_code === "daily_limit_reached"
          ? de.documents.analysis.limitReached
          : de.documents.statusHint[doc.status]) && (
          <p className="text-sm leading-relaxed text-muted">
            {doc.status === "failed" && analysis?.error_code === "daily_limit_reached"
              ? de.documents.analysis.limitReached
              : de.documents.statusHint[doc.status]}
          </p>
        )}
      </header>

      {isProcessing && (
        <section className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center gap-3">
            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm font-medium">
              {de.documents.analysis.steps[analysis?.status ?? "pending"] ??
                de.documents.analysis.title}
            </p>
          </div>
        </section>
      )}

      {doc.status === "failed" && <RetryAnalysisButton documentId={doc.id} />}

      {explanation && (
        <section className="flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5">
          {explanation.what_is_it && (
            <div>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">
                {de.documents.analysis.whatIsIt}
              </h2>
              <p className="leading-relaxed">
                {formatIsoDatesInText(explanation.what_is_it)}
              </p>
            </div>
          )}
          {explanation.why_it_matters && (
            <div>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">
                {de.documents.analysis.whyItMatters}
              </h2>
              <p className="leading-relaxed">
                {formatIsoDatesInText(explanation.why_it_matters)}
              </p>
            </div>
          )}
          {explanation.what_to_do && explanation.what_to_do.length > 0 && (
            <div>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">
                {de.documents.analysis.whatToDo}
              </h2>
              <ol className="flex list-decimal flex-col gap-1 pl-5 leading-relaxed">
                {explanation.what_to_do.map((step) => (
                  <li key={step}>{formatIsoDatesInText(step)}</li>
                ))}
              </ol>
            </div>
          )}
          {explanation.possible_consequence && (
            <div>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">
                {de.documents.analysis.possibleConsequence}
              </h2>
              <p className="leading-relaxed">
                {formatIsoDatesInText(explanation.possible_consequence)}
              </p>
            </div>
          )}
          <p className="border-t border-black/5 pt-3 text-xs leading-relaxed text-muted">
            {de.documents.analysis.generatedNote}
          </p>
        </section>
      )}

      {uncertainties.length > 0 && doc.status === "ready_for_review" && (
        <section className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-800">
            {de.documents.analysis.uncertainties}
          </h2>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed text-amber-900">
            {uncertainties.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      {doc.status === "ready_for_review" && (
        <ConfirmCard
          documentId={doc.id}
          category={doc.category}
          amountEntity={
            amountEntity ? { id: amountEntity.id, value: amountInputValue } : null
          }
          dueDateEntity={
            dueDateEntity
              ? { id: dueDateEntity.id, value: dueDateEntity.value_text ?? "" }
              : null
          }
          budgetCandidates={budgetCandidates}
        />
      )}

      {tasks && tasks.length > 0 && (
        <section className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">
            {de.documents.detail.linkedTasks}
          </h2>
          <ul className="flex flex-col divide-y divide-black/5">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        </section>
      )}

      {factEntities.length > 0 && hasResult && (
        <section className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            {de.documents.analysis.extractedTitle}
          </h2>
          <dl className="flex flex-col divide-y divide-black/5">
            {factEntities.map((entity) => (
              <div key={entity.id} className="flex flex-col gap-0.5 py-2.5">
                <dt className="text-xs font-medium text-muted">
                  {de.documents.analysis.entityLabels[entity.entity_type] ??
                    entity.entity_type}
                  {entity.corrected_value && (
                    <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent-strong">
                      {de.documents.analysis.corrected}
                    </span>
                  )}
                </dt>
                <dd className="font-medium">{entityDisplayValue(entity)}</dd>
                {entity.source_text === "Swiss-QR-Code" ? (
                  <span className="text-xs text-accent">
                    {de.documents.analysis.qrBadge}
                  </span>
                ) : (
                  entity.page_number && (
                    <span className="text-xs text-muted">
                      {de.documents.analysis.sourceRef(entity.page_number)}
                      {entity.source_text ? `: «${entity.source_text}»` : ""}
                    </span>
                  )
                )}
              </div>
            ))}
          </dl>
        </section>
      )}

      {hasResult && analysis?.status === "completed" && (
        <DocumentChat documentId={doc.id} initialQuestions={questions ?? []} />
      )}

      <section className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {de.documents.detail.preview}
        </h2>
        {isPdf ? (
          paths[0] && signedByPath.get(paths[0]) ? (
            <a
              href={signedByPath.get(paths[0])}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-soft px-4 py-3 text-sm font-medium text-accent-strong transition hover:bg-accent-soft/70"
            >
              {de.documents.detail.openOriginal}
            </a>
          ) : (
            <p className="text-sm text-muted">–</p>
          )
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {(pages ?? []).map((page) => {
              const url = page.image_storage_path
                ? signedByPath.get(page.image_storage_path)
                : undefined;
              return url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={page.page_number}
                  src={url}
                  alt={`Seite ${page.page_number}`}
                  className="h-48 w-auto shrink-0 rounded-xl object-cover ring-1 ring-black/10"
                />
              ) : null;
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {de.documents.detail.infos}
        </h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{de.documents.detail.filename}</dt>
            <dd className="truncate font-medium">{doc.original_filename ?? "–"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{de.documents.uploadedOn}</dt>
            <dd className="font-medium">{formatDate(doc.created_at)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{de.documents.detail.type}</dt>
            <dd className="font-medium">
              {isPdf ? "PDF" : de.documents.pages(doc.page_count)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{de.documents.detail.fileSize}</dt>
            <dd className="font-medium">{formatFileSize(doc.file_size)}</dd>
          </div>
        </dl>
      </section>

      <DeleteDocumentButton documentId={doc.id} />
    </div>
  );
}
