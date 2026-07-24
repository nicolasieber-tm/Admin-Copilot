import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { de } from "@/lib/i18n/de";
import { BudgetItemEditForm } from "@/components/budget/budget-item-edit-form";

export const metadata: Metadata = { title: de.budget.detail.title };

export default async function BudgetItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("budget_items")
    .select(
      "id, item_type, title, category, amount, currency, due_date, status, document_id, task_id, budget_plans(month), documents(title, original_filename)"
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!item) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-2xl font-semibold tracking-tight">
          {de.budget.detail.title}
        </h1>
        <div className="rounded-2xl bg-surface p-6 text-center shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-muted">{de.budget.detail.notFound}</p>
        </div>
        <Link href="/budget" className="text-sm text-accent-strong transition hover:opacity-80">
          ← {de.common.back}
        </Link>
      </div>
    );
  }

  const monthParam = item.budget_plans?.month?.slice(0, 7);
  const documentLabel =
    item.documents?.title ?? item.documents?.original_filename ?? null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href={monthParam ? `/budget?m=${monthParam}` : "/budget"}
          className="text-sm text-muted transition hover:opacity-80"
        >
          ← {de.budget.title}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {de.budget.detail.title}
        </h1>
      </div>

      {item.document_id && (
        <Link
          href={`/documents/${item.document_id}`}
          className="flex items-center justify-between rounded-2xl bg-accent-soft px-5 py-4 text-sm font-medium text-accent-strong transition hover:opacity-90"
        >
          <span className="min-w-0">
            <span className="block text-xs font-normal">{de.budget.fromDocument}</span>
            <span className="block truncate">
              {documentLabel ?? de.documents.detail.title}
            </span>
          </span>
          <span aria-hidden>→</span>
        </Link>
      )}

      <BudgetItemEditForm
        item={{
          id: item.id,
          item_type: item.item_type,
          title: item.title,
          category: item.category,
          amount: item.amount,
          currency: item.currency,
          due_date: item.due_date,
          status: item.status,
        }}
        backHref={monthParam ? `/budget?m=${monthParam}` : "/budget"}
      />
    </div>
  );
}
