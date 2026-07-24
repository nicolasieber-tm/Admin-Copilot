import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { de } from "@/lib/i18n/de";
import { formatDate, statusBadgeClass, statusLabel } from "@/lib/documents";
import { OPEN_TASK_STATUSES } from "@/lib/tasks";
import { currentMonthParam, shiftMonth } from "@/lib/budget";
import { NotificationList } from "@/components/common/notification-list";
import {
  BudgetOverviewCard,
  type MonthOverview,
} from "@/components/dashboard/budget-overview-card";
import {
  DeadlineTimeline,
  type TimelineTask,
} from "@/components/dashboard/deadline-timeline";

export const metadata: Metadata = { title: de.dashboard.title };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentMonth = currentMonthParam();
  // Monatsverlauf: 2 Monate zurück bis 2 Monate voraus
  const trendMonths = [-2, -1, 0, 1, 2].map((d) => shiftMonth(currentMonth, d));

  const [
    { data: profile },
    { data: recentDocuments },
    { data: taskRows },
    { data: notifications },
    { data: budgetPlans },
    { data: reviewDocs },
  ] = await Promise.all([
    supabase.from("users").select("display_name").eq("id", user!.id).single(),
    supabase
      .from("documents")
      .select("id, title, original_filename, status, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("tasks")
      .select(
        "id, title, status, due_at, amount, currency, documents(title, original_filename)"
      )
      .in("status", OPEN_TASK_STATUSES)
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(8),
    supabase
      .from("notifications")
      .select("id, title, message, related_entity_type, related_entity_id")
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("budget_plans")
      .select("month, expected_income, expected_expenses, projected_balance")
      .in(
        "month",
        trendMonths.map((m) => `${m}-01`)
      ),
    supabase
      .from("documents")
      .select("id, title, original_filename, created_at")
      .eq("status", "ready_for_review")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const months: MonthOverview[] = trendMonths.map((month) => {
    const plan = (budgetPlans ?? []).find((p) => p.month === `${month}-01`);
    return {
      month,
      income: plan?.expected_income ?? 0,
      expenses: plan?.expected_expenses ?? 0,
      projected: plan ? (plan.projected_balance ?? 0) : null,
      isCurrent: month === currentMonth,
    };
  });

  const timelineTasks: TimelineTask[] = (taskRows ?? []).map(
    ({ documents, ...task }) => ({
      ...task,
      document_title: documents?.title ?? documents?.original_filename ?? null,
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {profile?.display_name
            ? `Hallo ${profile.display_name}`
            : de.dashboard.title}
        </h1>
      </header>

      <NotificationList items={notifications ?? []} />

      {reviewDocs && reviewDocs.length > 0 && (
        <section className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-amber-800">
            {de.dashboard.review}
          </h2>
          <p className="mb-2 text-xs leading-relaxed text-amber-800/80">
            {de.dashboard.reviewHint}
          </p>
          <ul className="flex flex-col divide-y divide-amber-200/60">
            {reviewDocs.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/documents/${doc.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 transition hover:opacity-80"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-amber-900">
                      {doc.title ?? doc.original_filename ?? de.documents.detail.title}
                    </span>
                    <span className="block text-xs text-amber-800/70">
                      {formatDate(doc.created_at)}
                    </span>
                  </span>
                  <span aria-hidden className="shrink-0 text-amber-800">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/documents/upload"
        className="flex items-center gap-4 rounded-2xl bg-accent p-5 text-white shadow-sm transition hover:bg-accent-strong active:scale-[0.99]"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <span>
          <span className="block text-base font-semibold">
            {de.dashboard.addDocument}
          </span>
          <span className="block text-sm text-white/80">
            {de.dashboard.addDocumentHint}
          </span>
        </span>
      </Link>

      <DeadlineTimeline tasks={timelineTasks} />

      <BudgetOverviewCard months={months} />

      <section className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {de.dashboard.openDocuments}
        </h2>
        {recentDocuments && recentDocuments.length > 0 ? (
          <ul className="flex flex-col divide-y divide-black/5">
            {recentDocuments.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/documents/${doc.id}`}
                  className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {doc.title ?? doc.original_filename ?? de.documents.detail.title}
                    </span>
                    <span className="block text-xs text-muted">
                      {formatDate(doc.created_at)}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(doc.status)}`}
                  >
                    {statusLabel(doc.status)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{de.dashboard.noDocuments}</p>
        )}
      </section>
    </div>
  );
}
