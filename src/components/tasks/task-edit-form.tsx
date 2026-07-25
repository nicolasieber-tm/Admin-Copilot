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
import {
  dueAtFromDateInput,
  formatDueDate,
  zurichDateString,
  type ReminderStatus,
  type TaskActionType,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks";

type EditableTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  action_type: TaskActionType;
  due_at: string | null;
  amount: number | null;
  currency: string;
};

type ReminderRow = {
  id: string;
  channel: string;
  scheduled_at: string;
  status: ReminderStatus;
  sent_at: string | null;
};

// Bearbeiten einer Aufgabe (Spez 11.7: "Der Nutzer kann diese Angaben ändern").
// Friständerungen planen die Erinnerungen automatisch neu (DB-Trigger).
export function TaskEditForm({
  task,
  reminders,
}: {
  task: EditableTask;
  reminders: ReminderRow[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [actionType, setActionType] = useState<TaskActionType>(task.action_type);
  const [dueDate, setDueDate] = useState(
    task.due_at ? zurichDateString(task.due_at) : ""
  );
  const [amount, setAmount] = useState(
    task.amount != null ? task.amount.toFixed(2) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError(de.tasks.form.titleRequired);
      return;
    }
    setPending(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();

    const parsedAmount = Number.parseFloat(amount.replace(",", "."));
    // Frist nur anfassen, wenn sich der Kalendertag wirklich ändert –
    // sonst würden die Erinnerungen unnötig neu geplant.
    const dayUnchanged =
      (task.due_at ? zurichDateString(task.due_at) : "") === dueDate;
    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        title: title.trim(),
        status,
        priority,
        action_type: actionType,
        due_at: dayUnchanged
          ? task.due_at
          : dueDate
            ? dueAtFromDateInput(dueDate)
            : null,
        amount: Number.isFinite(parsedAmount) ? parsedAmount : null,
      })
      .eq("id", task.id);

    if (updateError) {
      setError(de.tasks.form.error);
    } else {
      setNotice(de.tasks.form.saved);
      router.refresh();
    }
    setPending(false);
  }

  async function remove() {
    if (!window.confirm(de.tasks.detail.deleteConfirm)) return;
    setPending(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", task.id);
    if (deleteError) {
      setError(de.tasks.form.error);
      setPending(false);
      return;
    }
    router.push("/tasks");
    router.refresh();
  }

  async function cancelReminder(reminderId: string) {
    const supabase = createClient();
    await supabase
      .from("reminders")
      .update({ status: "cancelled" })
      .eq("id", reminderId);
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
          <label htmlFor="edit-title" className={labelClass}>
            {de.tasks.form.title}
          </label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="edit-status" className={labelClass}>
            {de.tasks.form.status}
          </label>
          <select
            id="edit-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className={inputClass}
          >
            {Object.entries(de.tasks.status).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="edit-due" className={labelClass}>
            {de.tasks.form.dueDate}
          </label>
          <input
            id="edit-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="edit-priority" className={labelClass}>
            {de.tasks.form.priority}
          </label>
          <select
            id="edit-priority"
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
          <label htmlFor="edit-action" className={labelClass}>
            {de.tasks.form.actionType}
          </label>
          <select
            id="edit-action"
            value={actionType}
            onChange={(e) => setActionType(e.target.value as TaskActionType)}
            className={inputClass}
          >
            {Object.entries(de.tasks.actionTypes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="edit-amount" className={labelClass}>
            {de.tasks.form.amount}
          </label>
          <input
            id="edit-amount"
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
          {pending ? de.tasks.form.saving : de.tasks.form.save}
        </button>
      </form>

      <section className="rounded-2xl bg-surface p-5 card-elevated">
        <h2 className="mb-1 text-[15px] font-semibold tracking-tight">
          {de.tasks.reminders.title}
        </h2>
        <p className="mb-3 text-xs leading-relaxed text-muted">
          {de.tasks.reminders.hint}
        </p>
        {reminders.length === 0 ? (
          <p className="text-sm text-muted">{de.tasks.reminders.none}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-black/5">
            {reminders.map((reminder) => (
              <li
                key={reminder.id}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <span>
                  {de.tasks.reminders.at(formatDueDate(reminder.scheduled_at))}
                  <span className="ml-2 text-xs text-muted">
                    {de.tasks.reminders.status[reminder.status] ?? reminder.status}
                  </span>
                </span>
                {reminder.status === "scheduled" && (
                  <button
                    type="button"
                    onClick={() => cancelReminder(reminder.id)}
                    className="text-xs text-muted underline transition hover:opacity-80"
                  >
                    {de.tasks.reminders.cancel}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="text-sm text-red-700 transition hover:opacity-80 disabled:opacity-50"
      >
        {de.tasks.detail.delete}
      </button>
    </div>
  );
}
