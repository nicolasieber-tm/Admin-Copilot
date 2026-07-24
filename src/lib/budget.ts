import { de } from "@/lib/i18n/de";
import type { Database } from "@/lib/supabase/database.types";
import { zurichDateString } from "@/lib/tasks";

export type BudgetItemStatus = Database["public"]["Enums"]["budget_item_status"];
export type BudgetItemType = Database["public"]["Enums"]["budget_item_type"];
export type RecurrenceFrequency =
  Database["public"]["Enums"]["recurrence_frequency"];

export type BudgetItemRowData = {
  id: string;
  item_type: BudgetItemType;
  title: string;
  category: string | null;
  amount: number;
  currency: string;
  due_date: string | null;
  status: BudgetItemStatus;
  source: Database["public"]["Enums"]["budget_item_source"];
  is_recurring: boolean;
  recurrence_parent_id: string | null;
  document_id: string | null;
};

export function budgetStatusLabel(status: BudgetItemStatus): string {
  return de.budget.status[status] ?? status;
}

export function budgetStatusBadgeClass(status: BudgetItemStatus): string {
  switch (status) {
    case "paid":
    case "received":
      return "bg-emerald-100 text-emerald-800";
    case "due":
      return "bg-amber-100 text-amber-800";
    case "postponed":
    case "cancelled":
      return "bg-black/5 text-muted";
    default:
      return "bg-accent-soft text-accent-strong";
  }
}

// Bewusst ohne toLocaleString: Server (Node-ICU) und Browser trennen Tausender
// in de-CH unterschiedlich (’ vs. ') – das ergäbe Hydration-Fehler.
export function formatChf(amount: number, currency = "CHF"): string {
  const sign = amount < 0 ? "−" : "";
  const [integer, fraction] = Math.abs(amount).toFixed(2).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${sign}${currency} ${grouped}.${fraction}`;
}

/** Aktueller Monat als "YYYY-MM" (Europe/Zurich) */
export function currentMonthParam(): string {
  return zurichDateString(new Date()).slice(0, 7);
}

/** "YYYY-MM" validieren; ungültige Werte fallen auf den aktuellen Monat zurück */
export function normalizeMonthParam(value: string | undefined): string {
  if (value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return value;
  return currentMonthParam();
}

/** Monat verschieben: "2026-07" + 1 → "2026-08" */
export function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split("-").map(Number);
  const total = year * 12 + (m - 1) + delta;
  const newYear = Math.floor(total / 12);
  const newMonth = (total % 12) + 1;
  return `${newYear}-${String(newMonth).padStart(2, "0")}`;
}

/** Anzeige "Juli 2026" */
export function formatMonth(month: string): string {
  return new Intl.DateTimeFormat("de-CH", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Zurich",
  }).format(new Date(`${month}-01T12:00:00Z`));
}

export type DataCompleteness = {
  is_estimate?: boolean;
  has_income?: boolean;
  has_expenses?: boolean;
} | null;
