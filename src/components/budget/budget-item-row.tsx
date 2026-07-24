"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { de } from "@/lib/i18n/de";
import {
  budgetStatusBadgeClass,
  budgetStatusLabel,
  formatChf,
  type BudgetItemRowData,
} from "@/lib/budget";
import { formatDateValue } from "@/lib/documents";

// Eine Zeile der Budgetliste. Reine wiederkehrende Instanzen (Lohn, Miete)
// sind Übersicht, kein To-do: kein Abhaken, kein Statuschip. Der Haken
// erscheint nur bei einmaligen Posten und dokumentverknüpften Rechnungen.
export function BudgetItemRow({ item }: { item: BudgetItemRowData }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const settled = item.status === "paid" || item.status === "received";
  const isOverviewOnly = !!item.recurrence_parent_id && !item.document_id;
  const doneLabel =
    item.item_type === "income" ? de.budget.markReceived : de.budget.markPaid;

  async function toggle() {
    setPending(true);
    const supabase = createClient();
    await supabase
      .from("budget_items")
      .update({
        status: settled
          ? "planned"
          : item.item_type === "income"
            ? "received"
            : "paid",
      })
      .eq("id", item.id);
    router.refresh();
    setPending(false);
  }

  return (
    <li className="flex items-center gap-3 py-3">
      {isOverviewOnly ? (
        <span
          aria-hidden
          className="flex h-7 w-7 shrink-0 items-center justify-center text-muted"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 9a8 8 0 0114-3m2 0v4h-4M20 15a8 8 0 01-14 3m-2 0v-4h4"
            />
          </svg>
        </span>
      ) : (
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-label={settled ? de.budget.markPlanned : doneLabel}
          title={settled ? de.budget.markPlanned : doneLabel}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-95 disabled:opacity-50 ${
            settled
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-black/20 bg-white text-transparent hover:border-accent"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      )}

      <Link href={`/budget/${item.id}`} className="min-w-0 flex-1 transition hover:opacity-80">
        <span
          className={`block truncate text-sm font-medium ${settled ? "text-muted line-through" : ""}`}
        >
          {item.title}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          {item.due_date && <span>{de.budget.dueOn(formatDateValue(item.due_date))}</span>}
          {item.category && <span>{item.category}</span>}
          {item.document_id && <span>{de.budget.fromDocument}</span>}
          {(item.is_recurring || item.recurrence_parent_id) && (
            <span>{de.budget.recurringBadge}</span>
          )}
        </span>
      </Link>

      <span className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={`text-sm font-semibold ${
            item.item_type === "income" ? "text-emerald-700" : ""
          }`}
        >
          {item.item_type === "income" ? "+" : "−"}
          {formatChf(item.amount, item.currency)}
        </span>
        {!isOverviewOnly && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${budgetStatusBadgeClass(item.status)}`}
          >
            {budgetStatusLabel(item.status)}
          </span>
        )}
      </span>
    </li>
  );
}
