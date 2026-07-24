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
import { dueAtFromDateInput, type TaskPriority } from "@/lib/tasks";

// Manuelles Anlegen einer Aufgabe (Aufgaben-CRUD, Spez 12.8).
// Die Standard-Erinnerungen entstehen automatisch über den DB-Trigger.
export function NewTaskForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError(de.tasks.form.titleRequired);
      return;
    }
    setPending(true);
    setError(null);
    const supabase = createClient();

    try {
      const [{ data: membership }, { data: auth }] = await Promise.all([
        supabase.from("workspace_members").select("workspace_id").limit(1).single(),
        supabase.auth.getUser(),
      ]);
      if (!membership) throw new Error("no workspace");

      const parsedAmount = Number.parseFloat(amount.replace(",", "."));
      const { error: insertError } = await supabase.from("tasks").insert({
        workspace_id: membership.workspace_id,
        title: title.trim(),
        priority,
        due_at: dueDate ? dueAtFromDateInput(dueDate) : null,
        amount: Number.isFinite(parsedAmount) ? parsedAmount : null,
        created_by: auth.user?.id ?? null,
        source: "manual",
      });
      if (insertError) throw insertError;

      setTitle("");
      setDueDate("");
      setPriority("medium");
      setAmount("");
      setOpen(false);
      router.refresh();
    } catch {
      setError(de.tasks.form.error);
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonSecondaryClass}>
        {de.tasks.new}
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
        {de.tasks.new}
      </h2>
      <FormError message={error} />
      <div>
        <label htmlFor="task-title" className={labelClass}>
          {de.tasks.form.title}
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={de.tasks.form.titlePlaceholder}
          className={inputClass}
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="task-due" className={labelClass}>
          {de.tasks.form.dueDate}
        </label>
        <input
          id="task-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="task-priority" className={labelClass}>
          {de.tasks.form.priority}
        </label>
        <select
          id="task-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          className={inputClass}
        >
          {Object.entries(de.tasks.priority).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="task-amount" className={labelClass}>
          {de.tasks.form.amount}
        </label>
        <input
          id="task-amount"
          type="number"
          inputMode="decimal"
          step="0.05"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
        />
      </div>
      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {pending ? de.tasks.form.submitting : de.tasks.form.submit}
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
