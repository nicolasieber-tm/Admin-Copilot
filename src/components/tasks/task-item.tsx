"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { de } from "@/lib/i18n/de";
import {
  DONE_TASK_STATUSES,
  formatDueDate,
  formatTaskAmount,
  isTaskOverdue,
  taskPriorityBadgeClass,
  taskPriorityLabel,
  type TaskListItem,
} from "@/lib/tasks";

// Eine Zeile der Aufgabenliste: Abhaken links, Details rechts.
// Erledigen/Wiederöffnen aktualisiert über die DB-Trigger auch Erinnerungen
// und den Status des verknüpften Dokuments.
export function TaskItem({ task }: { task: TaskListItem }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  // Optimistischer Zustand: die Abhak-Animation läuft sofort, das
  // Neuladen (und damit der Gruppenwechsel) folgt erst danach.
  const [optimisticDone, setOptimisticDone] = useState<boolean | null>(null);
  const done = optimisticDone ?? DONE_TASK_STATUSES.includes(task.status);
  const justChecked = optimisticDone === true;
  const overdue = isTaskOverdue(task);
  const amount = formatTaskAmount(task.amount, task.currency);

  async function toggle() {
    const next = !done;
    setOptimisticDone(next);
    setPending(true);
    const supabase = createClient();
    await supabase
      .from("tasks")
      .update({ status: next ? "completed" : "open" })
      .eq("id", task.id);
    await new Promise((resolve) => setTimeout(resolve, next ? 450 : 150));
    router.refresh();
    setPending(false);
  }

  return (
    <li className={`flex items-center gap-3 py-3 ${done ? "is-done" : ""}`}>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-label={done ? de.tasks.reopen : de.tasks.complete}
        title={done ? de.tasks.reopen : de.tasks.complete}
        className={`check-anim ${justChecked ? "check-pop" : ""} flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-90 disabled:opacity-50 ${
          done
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-black/20 bg-white text-white/0 hover:border-accent"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-4 w-4">
          <path className="check-path" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </button>

      <Link href={`/tasks/${task.id}`} className="pressable min-w-0 flex-1 hover:opacity-80">
        <span
          className={`task-title block w-fit max-w-full truncate text-sm font-medium transition-colors ${done ? "text-muted" : ""}`}
        >
          {task.title}
        </span>
        {task.document_title && (
          <span className="block truncate text-xs text-muted">
            {task.document_title}
          </span>
        )}
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          {task.due_at && !done && (
            <span className={overdue ? "font-medium text-red-700" : ""}>
              {de.tasks.dueOn(formatDueDate(task.due_at))}
            </span>
          )}
          {done && task.completed_at && (
            <span>{de.tasks.completedOn(formatDueDate(task.completed_at))}</span>
          )}
          {amount && <span>{amount}</span>}
          {!done && (task.priority === "high" || task.priority === "critical") && (
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${taskPriorityBadgeClass(task.priority)}`}
            >
              {taskPriorityLabel(task.priority)}
            </span>
          )}
        </span>
      </Link>

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4 shrink-0 text-muted"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </li>
  );
}
