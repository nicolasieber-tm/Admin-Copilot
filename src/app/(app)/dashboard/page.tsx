import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { de } from "@/lib/i18n/de";
import { formatDate, statusBadgeClass, statusLabel } from "@/lib/documents";
import { OPEN_TASK_STATUSES } from "@/lib/tasks";
import { currentMonthParam } from "@/lib/budget";
import { NotificationList } from "@/components/common/notification-list";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import {
  DeadlineCard,
  type DeadlineTask,
} from "@/components/dashboard/deadline-card";

export const metadata: Metadata = { title: de.dashboard.title };

// Dunkler Tiefsee-Kopf: Browser-Chrome auf dem Start-Tab passend einfärben
export const viewport: Viewport = { themeColor: "#051e28" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentMonth = currentMonthParam();

  const [
    { data: profile },
    { data: recentDocuments },
    { data: taskRows },
    { count: openTaskCount },
    { data: notifications },
    { data: plan },
    { data: reviewDocs },
  ] = await Promise.all([
    supabase.from("users").select("display_name").eq("id", user!.id).single(),
    supabase
      .from("documents")
      .select("id, title, original_filename, status, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("tasks")
      .select(
        "id, title, status, due_at, amount, currency, documents(title, original_filename)"
      )
      .in("status", OPEN_TASK_STATUSES)
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(5),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .in("status", OPEN_TASK_STATUSES),
    supabase
      .from("notifications")
      .select("id, title, message, related_entity_type, related_entity_id")
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("budget_plans")
      .select("expected_income, expected_expenses, projected_balance")
      .eq("month", `${currentMonth}-01`)
      .maybeSingle(),
    supabase
      .from("documents")
      .select("id, title, original_filename, created_at")
      .eq("status", "ready_for_review")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const deadlineTasks: DeadlineTask[] = (taskRows ?? []).map(
    ({ documents, ...task }) => ({
      ...task,
      document_title: documents?.title ?? documents?.original_filename ?? null,
    })
  );

  return (
    <div>
      <DashboardHero
        name={profile?.display_name ?? null}
        email={user?.email ?? null}
        hasPlan={plan != null}
        projected={plan?.projected_balance ?? 0}
        income={plan?.expected_income ?? 0}
        expenses={plan?.expected_expenses ?? 0}
        openTasks={openTaskCount ?? 0}
      />

      {/* Helle Inhalts-Fläche, die den dunklen Kopf mit grossem Radius überlappt */}
      <div className="relative -mx-4 -mt-7 rounded-t-[28px] bg-background px-4 pt-5">
        <div className="flex flex-col gap-5">
          <NotificationList items={notifications ?? []} />

          {reviewDocs && reviewDocs.length > 0 && (
            <section className="rounded-2xl bg-amber-50 p-4 ring-1 ring-inset ring-amber-200">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-sm font-bold text-amber-900">
                  {reviewDocs.length}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-900">
                    {de.dashboard.reviewCount(reviewDocs.length)}
                  </p>
                  <p className="text-xs text-amber-800/75">
                    {de.dashboard.reviewHint}
                  </p>
                </div>
              </div>
              <ul className="mt-2 flex flex-col divide-y divide-amber-200/60">
                {reviewDocs.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="flex items-center justify-between gap-3 py-2.5 transition hover:opacity-80"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-amber-900">
                          {doc.title ??
                            doc.original_filename ??
                            de.documents.detail.title}
                        </span>
                        <span className="block text-xs text-amber-800/70">
                          {formatDate(doc.created_at)}
                        </span>
                      </span>
                      <span aria-hidden className="shrink-0 text-amber-800">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <DeadlineCard tasks={deadlineTasks} />

          <section className="card-elevated rounded-2xl bg-surface p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px] font-semibold tracking-tight">
                {de.dashboard.openDocuments}
              </h2>
              <Link
                href="/documents"
                className="text-xs font-semibold text-accent-strong transition hover:opacity-80"
              >
                {de.dashboard.all} →
              </Link>
            </div>
            {recentDocuments && recentDocuments.length > 0 ? (
              <ul className="mt-1 flex flex-col divide-y divide-black/5">
                {recentDocuments.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="flex items-center justify-between gap-3 py-2.5 transition hover:opacity-80"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {doc.title ??
                            doc.original_filename ??
                            de.documents.detail.title}
                        </span>
                        <span className="block text-xs text-muted">
                          {formatDate(doc.created_at)}
                        </span>
                      </span>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(doc.status)}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                        {statusLabel(doc.status)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">
                {de.dashboard.noDocuments}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
