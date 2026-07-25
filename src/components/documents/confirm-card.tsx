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
import { formatChf } from "@/lib/budget";

export type BudgetMergeCandidate = {
  id: string;
  title: string;
  amount: number;
  currency: string;
};

// Bestätigung der kritischen Felder (Spez 11.6): Dokumenttyp, Betrag, Frist –
// plus Budget-Wahl (Spez 11.8): neuer Posten, Zusammenführen mit einem
// bestehenden fixen Posten (verhindert Doppelzählung) oder überspringen.
// Läuft atomar über die RPC confirm_document.
export function ConfirmCard({
  documentId,
  category,
  amountEntity,
  dueDateEntity,
  budgetCandidates,
}: {
  documentId: string;
  category: string | null;
  amountEntity: { id: string; value: string } | null;
  dueDateEntity: { id: string; value: string } | null;
  budgetCandidates: BudgetMergeCandidate[];
}) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(category ?? "general");
  const [amount, setAmount] = useState(amountEntity?.value ?? "");
  const [dueDate, setDueDate] = useState(dueDateEntity?.value ?? "");
  const [budgetChoice, setBudgetChoice] = useState("create");
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function confirm(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const supabase = createClient();

    const isMerge = budgetChoice.startsWith("merge:");
    const { error: rpcError } = await supabase.rpc("confirm_document", {
      p_document_id: documentId,
      p_category: selectedCategory,
      p_amount: amountEntity && amount.trim() ? amount.trim() : null,
      p_due_date: dueDateEntity && dueDate ? dueDate : null,
      p_budget_action: isMerge ? "merge" : budgetChoice,
      p_budget_item_id: isMerge ? budgetChoice.slice("merge:".length) : null,
      p_mark_done: alreadyDone,
    });

    if (rpcError) {
      setError(de.documents.confirm.error);
      setPending(false);
      return;
    }
    router.refresh();
  }

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-sm ring-2 ring-accent/30">
      <h2 className="mb-1 text-[15px] font-semibold tracking-tight text-accent-strong">
        {de.documents.confirm.title}
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-muted">
        {de.documents.confirm.hint}
      </p>
      <form onSubmit={confirm} className="flex flex-col gap-4">
        <FormError message={error} />
        <div>
          <label htmlFor="confirm-category" className={labelClass}>
            {de.documents.confirm.category}
          </label>
          <select
            id="confirm-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={inputClass}
          >
            {Object.entries(de.documents.categories).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="confirm-amount" className={labelClass}>
            {de.documents.confirm.amount}
          </label>
          {amountEntity ? (
            <input
              id="confirm-amount"
              type="number"
              inputMode="decimal"
              step="0.05"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
          ) : (
            <p className="text-sm text-muted">{de.documents.confirm.noValue}</p>
          )}
        </div>
        <div>
          <label htmlFor="confirm-due-date" className={labelClass}>
            {de.documents.confirm.dueDate}
          </label>
          {dueDateEntity ? (
            <input
              id="confirm-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          ) : (
            <p className="text-sm text-muted">{de.documents.confirm.noValue}</p>
          )}
        </div>
        {amountEntity && (
          <div>
            <label htmlFor="confirm-budget" className={labelClass}>
              {de.documents.confirm.budget}
            </label>
            <select
              id="confirm-budget"
              value={budgetChoice}
              onChange={(e) => setBudgetChoice(e.target.value)}
              className={inputClass}
            >
              <option value="create">{de.documents.confirm.budgetCreate}</option>
              {budgetCandidates.map((candidate) => (
                <option key={candidate.id} value={`merge:${candidate.id}`}>
                  {de.documents.confirm.budgetMerge(
                    candidate.title,
                    formatChf(candidate.amount, candidate.currency)
                  )}
                </option>
              ))}
              <option value="skip">{de.documents.confirm.budgetSkip}</option>
            </select>
            {budgetCandidates.length > 0 && (
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {de.documents.confirm.budgetHint}
              </p>
            )}
          </div>
        )}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-black/[0.03] px-4 py-3">
          <input
            type="checkbox"
            checked={alreadyDone}
            onChange={(e) => setAlreadyDone(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-current"
          />
          <span>
            <span className="block text-sm font-medium">
              {de.documents.confirm.alreadyDone}
            </span>
            <span className="block text-xs leading-relaxed text-muted">
              {de.documents.confirm.alreadyDoneHint}
            </span>
          </span>
        </label>
        <button type="submit" disabled={pending} className={buttonPrimaryClass}>
          {pending ? de.documents.confirm.submitting : de.documents.confirm.submit}
        </button>
      </form>
    </section>
  );
}
