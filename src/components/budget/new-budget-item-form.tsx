"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { de } from "@/lib/i18n/de";
import {
  FormError,
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
  labelClass,
} from "@/components/common/form";
import type { BudgetItemType } from "@/lib/budget";

// Manueller Budgetposten (Spez 12.10). Der Posten landet im Monatsplan des
// Fälligkeitsdatums bzw. – ohne Datum – im gerade angezeigten Monat.
export function NewBudgetItemForm({ month }: { month: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [itemType, setItemType] = useState<BudgetItemType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
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
    const supabase = createClient();

    try {
      const targetMonth = dueDate ? dueDate.slice(0, 7) : month;
      const { data: planId, error: planError } = await supabase.rpc(
        "ensure_budget_plan",
        { p_month: `${targetMonth}-01` }
      );
      if (planError || !planId) throw planError ?? new Error("no plan");

      const { data: membership } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .limit(1)
        .single();
      if (!membership) throw new Error("no workspace");

      const { error: insertError } = await supabase.from("budget_items").insert({
        workspace_id: membership.workspace_id,
        budget_plan_id: planId,
        item_type: itemType,
        title: title.trim(),
        amount: parsedAmount,
        due_date: dueDate || null,
        category: category.trim() || null,
        source: "manual",
        confirmed_by_user: true,
      });
      if (insertError) throw insertError;

      setTitle("");
      setAmount("");
      setDueDate("");
      setCategory("");
      setOpen(false);
      router.refresh();
    } catch {
      setError(de.budget.form.error);
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonSecondaryClass}>
        {de.budget.newItem}
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-2xl bg-surface p-5 card-elevated"
    >
      <h2 className="text-[15px] font-semibold tracking-tight">
        {de.budget.newItem}
      </h2>
      <FormError message={error} />
      <div>
        <label htmlFor="item-type" className={labelClass}>
          {de.budget.form.itemType}
        </label>
        <select
          id="item-type"
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
        <label htmlFor="item-title" className={labelClass}>
          {de.budget.form.title}
        </label>
        <input
          id="item-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={de.budget.form.titlePlaceholder}
          className={inputClass}
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="item-amount" className={labelClass}>
          {de.budget.form.amount}
        </label>
        <input
          id="item-amount"
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
        <label htmlFor="item-due" className={labelClass}>
          {de.budget.form.dueDate}
        </label>
        <input
          id="item-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="item-category" className={labelClass}>
          {de.budget.form.category}
        </label>
        <input
          id="item-category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder={de.budget.form.categoryPlaceholder}
          className={inputClass}
        />
      </div>
      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {pending ? de.budget.form.submitting : de.budget.form.submit}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm text-muted transition hover:opacity-80"
      >
        {de.common.cancel}
      </button>
    </form>
  );
}
