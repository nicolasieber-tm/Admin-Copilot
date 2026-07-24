"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { de } from "@/lib/i18n/de";
import {
  FormError,
  buttonPrimaryClass,
  inputClass,
  labelClass,
} from "@/components/common/form";
import {
  formatChf,
  type BudgetItemType,
  type RecurrenceFrequency,
} from "@/lib/budget";

export type RecurringRow = {
  id: string;
  item_type: BudgetItemType;
  title: string;
  amount: number;
  currency: string;
  frequency: RecurrenceFrequency;
  day_of_month: number | null;
  active: boolean;
};

// Wiederkehrende Vorlagen (Spez 26.3): jeder Posten ist ein eigener Frame,
// Antippen klappt das Bearbeitungsformular direkt im Posten auf. Änderungen
// übertragen sich per DB-Trigger auf die offenen Monatsinstanzen ab dem
// aktuellen Monat; die Instanzen entstehen beim Öffnen des Monats.
export function RecurringSection({ items }: { items: RecurringRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [itemType, setItemType] = useState<BudgetItemType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<RecurrenceFrequency>("monthly");
  const [dayOfMonth, setDayOfMonth] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function startCreate() {
    setEditingId(null);
    setItemType("expense");
    setTitle("");
    setAmount("");
    setFrequency("monthly");
    setDayOfMonth("");
    setError(null);
    setCreating(true);
  }

  function startEdit(item: RecurringRow) {
    setCreating(false);
    setEditingId(item.id);
    setItemType(item.item_type);
    setTitle(item.title);
    setAmount(item.amount.toFixed(2));
    setFrequency(item.frequency);
    setDayOfMonth(item.day_of_month != null ? String(item.day_of_month) : "");
    setError(null);
  }

  function closeForm() {
    setCreating(false);
    setEditingId(null);
    setError(null);
  }

  async function toggleActive(item: RecurringRow) {
    const supabase = createClient();
    await supabase
      .from("recurring_items")
      .update({ active: !item.active })
      .eq("id", item.id);
    router.refresh();
  }

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
      const parsedDay = Number.parseInt(dayOfMonth, 10);
      const values = {
        item_type: itemType,
        title: title.trim(),
        amount: parsedAmount,
        frequency,
        day_of_month:
          Number.isInteger(parsedDay) && parsedDay >= 1 && parsedDay <= 31
            ? parsedDay
            : null,
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("recurring_items")
          .update(values)
          .eq("id", editingId);
        if (updateError) throw updateError;
      } else {
        const { data: membership } = await supabase
          .from("workspace_members")
          .select("workspace_id")
          .limit(1)
          .single();
        if (!membership) throw new Error("no workspace");
        const { error: insertError } = await supabase.from("recurring_items").insert({
          ...values,
          workspace_id: membership.workspace_id,
          starts_on: new Date().toISOString().slice(0, 10),
        });
        if (insertError) throw insertError;
      }

      closeForm();
      router.refresh();
    } catch {
      setError(de.budget.form.error);
    } finally {
      setPending(false);
    }
  }

  function renderForm(isEdit: boolean) {
    return (
      <form onSubmit={submit} className="mt-3 flex flex-col gap-4 border-t border-black/5 pt-4">
        {isEdit && (
          <p className="text-xs leading-relaxed text-muted">
            {de.budget.recurring.editHint}
          </p>
        )}
        <FormError message={error} />
        <div>
          <label htmlFor="rec-type" className={labelClass}>
            {de.budget.form.itemType}
          </label>
          <select
            id="rec-type"
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
          <label htmlFor="rec-title" className={labelClass}>
            {de.budget.form.title}
          </label>
          <input
            id="rec-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={de.budget.form.titlePlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="rec-amount" className={labelClass}>
            {de.budget.form.amount}
          </label>
          <input
            id="rec-amount"
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
          <label htmlFor="rec-frequency" className={labelClass}>
            {de.budget.recurring.frequency}
          </label>
          <select
            id="rec-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
            className={inputClass}
          >
            {Object.entries(de.budget.recurring.frequencies).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rec-day" className={labelClass}>
            {de.budget.recurring.dayOfMonth}
          </label>
          <input
            id="rec-day"
            type="number"
            inputMode="numeric"
            min="1"
            max="31"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className={inputClass}
          />
        </div>
        <button type="submit" disabled={pending} className={buttonPrimaryClass}>
          {pending
            ? de.budget.form.saving
            : isEdit
              ? de.budget.form.save
              : de.budget.recurring.submit}
        </button>
        <button
          type="button"
          onClick={closeForm}
          className="text-sm text-muted transition hover:opacity-80"
        >
          {de.common.cancel}
        </button>
      </form>
    );
  }

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">
        {de.budget.recurring.title}
      </h2>
      <p className="mb-3 text-xs leading-relaxed text-muted">
        {de.budget.recurring.hint}
      </p>

      {items.length === 0 ? (
        <p className="mb-3 text-sm text-muted">{de.budget.recurring.empty}</p>
      ) : (
        <ul className="mb-3 flex flex-col gap-2">
          {items.map((item) => {
            const isEditing = editingId === item.id;
            return (
              <li
                key={item.id}
                className={`rounded-xl p-3 ring-1 transition ${
                  isEditing ? "ring-accent/40" : "ring-black/5"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => (isEditing ? closeForm() : startEdit(item))}
                    aria-expanded={isEditing}
                    className="min-w-0 flex-1 text-left transition hover:opacity-80"
                  >
                    <span
                      className={`block truncate text-sm font-medium ${item.active ? "" : "text-muted"}`}
                    >
                      {item.title}
                      {!item.active && (
                        <span className="ml-2 text-xs font-normal text-muted">
                          ({de.budget.recurring.inactive})
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-muted">
                      {de.budget.recurring.frequencies[item.frequency] ?? item.frequency}
                      {" · "}
                      {item.item_type === "income" ? "+" : "−"}
                      {formatChf(item.amount, item.currency)}
                    </span>
                  </button>
                  <span className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(item)}
                      className="text-xs text-muted underline transition hover:opacity-80"
                    >
                      {item.active
                        ? de.budget.recurring.deactivate
                        : de.budget.recurring.activate}
                    </button>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                      className={`h-4 w-4 text-muted transition-transform ${
                        isEditing ? "rotate-180" : ""
                      }`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </div>
                {isEditing && renderForm(true)}
              </li>
            );
          })}
        </ul>
      )}

      {creating ? (
        <div className="rounded-xl p-3 ring-1 ring-accent/40">
          <h3 className="text-sm font-semibold">{de.budget.recurring.new}</h3>
          {renderForm(false)}
        </div>
      ) : (
        <button
          type="button"
          onClick={startCreate}
          className="text-sm font-medium text-accent-strong transition hover:opacity-80"
        >
          {de.budget.recurring.new} +
        </button>
      )}
    </section>
  );
}
