"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { de } from "@/lib/i18n/de";
import {
  FormError,
  FormNotice,
  buttonPrimaryClass,
  inputClass,
  labelClass,
} from "@/components/common/form";
import type { BudgetItemStatus, BudgetItemType } from "@/lib/budget";

type EditableItem = {
  id: string;
  item_type: BudgetItemType;
  title: string;
  category: string | null;
  amount: number;
  currency: string;
  due_date: string | null;
  status: BudgetItemStatus;
};

// Budgetposten bearbeiten (Spez 24.10). Ändert sich das Fälligkeitsdatum in
// einen anderen Monat, wandert der Posten in den entsprechenden Monatsplan.
export function BudgetItemEditForm({
  item,
  backHref,
}: {
  item: EditableItem;
  backHref: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(item.title);
  const [itemType, setItemType] = useState<BudgetItemType>(item.item_type);
  const [amount, setAmount] = useState(item.amount.toFixed(2));
  const [dueDate, setDueDate] = useState(item.due_date ?? "");
  const [category, setCategory] = useState(item.category ?? "");
  const [status, setStatus] = useState<BudgetItemStatus>(item.status);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError(de.budget.form.titleRequired);
      return;
    }
    const parsedAmount = Number.parseFloat(amount.replace(",", "."));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError(de.budget.form.amountRequired);
      return;
    }
    setPending(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();

    try {
      // Bei Monatswechsel den Zielplan sicherstellen und Posten umhängen
      let planUpdate: { budget_plan_id?: string } = {};
      const newMonth = dueDate ? dueDate.slice(0, 7) : null;
      const oldMonth = item.due_date ? item.due_date.slice(0, 7) : null;
      if (newMonth && newMonth !== oldMonth) {
        const { data: planId, error: planError } = await supabase.rpc(
          "ensure_budget_plan",
          { p_month: `${newMonth}-01` }
        );
        if (planError || !planId) throw planError ?? new Error("no plan");
        planUpdate = { budget_plan_id: planId };
      }

      const { error: updateError } = await supabase
        .from("budget_items")
        .update({
          title: title.trim(),
          item_type: itemType,
          amount: parsedAmount,
          due_date: dueDate || null,
          category: category.trim() || null,
          status,
          ...planUpdate,
        })
        .eq("id", item.id);
      if (updateError) throw updateError;

      setNotice(de.budget.form.saved);
      router.refresh();
    } catch {
      setError(de.budget.form.error);
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!window.confirm(de.budget.detail.deleteConfirm)) return;
    setPending(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("budget_items")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", item.id);
    if (deleteError) {
      setError(de.budget.form.error);
      setPending(false);
      return;
    }
    router.push(backHref);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={save}
        className="flex flex-col gap-4 rounded-2xl bg-surface p-5 card-elevated"
      >
        <FormError message={error} />
        <FormNotice message={notice} />
        <div>
          <label htmlFor="edit-item-type" className={labelClass}>
            {de.budget.form.itemType}
          </label>
          <select
            id="edit-item-type"
            value={itemType}
            onChange={(e) => setItemType(e.target.value as BudgetItemType)}
            className={inputClass}
          >
            {Object.entries(de.budget.itemTypes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="edit-item-title" className={labelClass}>
            {de.budget.form.title}
          </label>
          <input
            id="edit-item-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="edit-item-amount" className={labelClass}>
            {de.budget.form.amount}
          </label>
          <input
            id="edit-item-amount"
            type="number"
            inputMode="decimal"
            step="0.05"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="edit-item-due" className={labelClass}>
            {de.budget.form.dueDate}
          </label>
          <input
            id="edit-item-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="edit-item-category" className={labelClass}>
            {de.budget.form.category}
          </label>
          <input
            id="edit-item-category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={de.budget.form.categoryPlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="edit-item-status" className={labelClass}>
            {de.budget.form.status}
          </label>
          <select
            id="edit-item-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as BudgetItemStatus)}
            className={inputClass}
          >
            {Object.entries(de.budget.status).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={pending} className={buttonPrimaryClass}>
          {pending ? de.budget.form.saving : de.budget.form.save}
        </button>
      </form>

      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="text-sm text-red-700 transition hover:opacity-80 disabled:opacity-50"
      >
        {de.budget.detail.delete}
      </button>
    </div>
  );
}
