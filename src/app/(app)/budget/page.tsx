import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { de } from "@/lib/i18n/de";
import {
  formatChf,
  formatMonth,
  normalizeMonthParam,
  shiftMonth,
  type BudgetItemRowData,
  type DataCompleteness,
} from "@/lib/budget";
import { BudgetItemRow } from "@/components/budget/budget-item-row";
import { NewBudgetItemForm } from "@/components/budget/new-budget-item-form";
import {
  RecurringSection,
  type RecurringRow,
} from "@/components/budget/recurring-section";

export const metadata: Metadata = { title: de.budget.title };

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const month = normalizeMonthParam(m);
  const supabase = await createClient();

  // Monatsplan öffnen: legt ihn bei Bedarf an, materialisiert wiederkehrende
  // Posten und berechnet die Summen neu.
  const { data: planId } = await supabase.rpc("ensure_budget_plan", {
    p_month: `${month}-01`,
  });

  const [{ data: plan }, { data: items }, { data: recurring }] =
    await Promise.all([
      supabase
        .from("budget_plans")
        .select(
          "id, month, expected_income, expected_expenses, projected_balance, opening_balance, data_completeness"
        )
        .eq("id", planId ?? "")
        .maybeSingle(),
      supabase
        .from("budget_items")
        .select(
          "id, item_type, title, category, amount, currency, due_date, status, source, is_recurring, recurrence_parent_id, document_id"
        )
        .eq("budget_plan_id", planId ?? "")
        .is("deleted_at", null)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at")
        .returns<BudgetItemRowData[]>(),
      supabase
        .from("recurring_items")
        .select("id, item_type, title, amount, currency, frequency, day_of_month, active")
        .order("created_at")
        .returns<RecurringRow[]>(),
    ]);

  const incomeItems = (items ?? []).filter((i) => i.item_type === "income");
  const expenseItems = (items ?? []).filter((i) => i.item_type === "expense");
  const completeness = (plan?.data_completeness ?? null) as DataCompleteness;
  const projected = plan?.projected_balance ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="rise flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{de.budget.title}</h1>
      </div>

      <div className="rise-2 flex items-center justify-between rounded-2xl bg-surface px-3 py-2 card-elevated">
        <Link
          href={`/budget?m=${shiftMonth(month, -1)}`}
          aria-label={de.budget.prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-black/5"
        >
          ←
        </Link>
        <span className="text-base font-semibold">{formatMonth(month)}</span>
        <Link
          href={`/budget?m=${shiftMonth(month, 1)}`}
          aria-label={de.budget.nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-black/5"
        >
          →
        </Link>
      </div>

      <section className="rise-3 rounded-2xl bg-surface p-5 card-elevated">
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{de.budget.summary.income}</dt>
            <dd className="font-medium text-emerald-700">
              +{formatChf(plan?.expected_income ?? 0)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{de.budget.summary.expenses}</dt>
            <dd className="font-medium">−{formatChf(plan?.expected_expenses ?? 0)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-black/10 pt-2">
            <dt className="font-semibold">{de.budget.summary.projected}</dt>
            <dd
              className={`text-lg font-bold ${projected < 0 ? "text-red-700" : "text-emerald-700"}`}
            >
              {formatChf(projected)}
            </dd>
          </div>
        </dl>
        {projected < 0 && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800">
            {de.budget.summary.negative}
          </p>
        )}
        {completeness?.is_estimate && (
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
            {de.budget.summary.estimate}
          </p>
        )}
      </section>

      <div className="rise-4 flex flex-col gap-5">
      <NewBudgetItemForm month={month} />

      {(items ?? []).length === 0 && (
        <div className="rounded-2xl bg-surface p-6 text-center card-elevated">
          <p className="text-sm leading-relaxed text-muted">{de.budget.empty}</p>
        </div>
      )}

      {incomeItems.length > 0 && (
        <section className="rounded-2xl bg-surface p-5 card-elevated">
          <h2 className="mb-1 text-[15px] font-semibold tracking-tight">
            {de.budget.sections.income}
          </h2>
          <ul className="flex flex-col divide-y divide-black/5">
            {incomeItems.map((item) => (
              <BudgetItemRow key={item.id} item={item} />
            ))}
          </ul>
        </section>
      )}

      {expenseItems.length > 0 && (
        <section className="rounded-2xl bg-surface p-5 card-elevated">
          <h2 className="mb-1 text-[15px] font-semibold tracking-tight">
            {de.budget.sections.expenses}
          </h2>
          <ul className="flex flex-col divide-y divide-black/5">
            {expenseItems.map((item) => (
              <BudgetItemRow key={item.id} item={item} />
            ))}
          </ul>
        </section>
      )}

      <RecurringSection items={recurring ?? []} />
      </div>
    </div>
  );
}
