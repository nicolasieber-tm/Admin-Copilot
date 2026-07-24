import { de } from "@/lib/i18n/de";
import type { Database } from "@/lib/supabase/database.types";

export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type TaskPriority = Database["public"]["Enums"]["task_priority"];
export type TaskActionType = Database["public"]["Enums"]["task_action_type"];
export type ReminderStatus = Database["public"]["Enums"]["reminder_status"];

/** Statuswerte, in denen eine Aufgabe noch Handlung verlangt (Spez 25.2) */
export const OPEN_TASK_STATUSES: TaskStatus[] = [
  "open",
  "in_progress",
  "waiting",
  "overdue",
];

export const DONE_TASK_STATUSES: TaskStatus[] = ["completed", "not_required"];

export function taskStatusLabel(status: TaskStatus): string {
  return de.tasks.status[status] ?? status;
}

export function taskPriorityLabel(priority: TaskPriority): string {
  return de.tasks.priority[priority] ?? priority;
}

export function taskActionTypeLabel(actionType: TaskActionType): string {
  return de.tasks.actionTypes[actionType] ?? actionType;
}

export function taskPriorityBadgeClass(priority: TaskPriority): string {
  switch (priority) {
    case "critical":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-black/5 text-muted";
  }
}

export function formatTaskAmount(
  amount: number | null,
  currency: string
): string | null {
  if (amount == null) return null;
  return `${currency} ${amount.toFixed(2)}`;
}

/** Kalendertag (YYYY-MM-DD) eines Zeitpunkts in Europe/Zurich – für Datumsfelder und Gruppierung */
export function zurichDateString(iso: string | Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(typeof iso === "string" ? new Date(iso) : iso);
}

/** Anzeige einer Frist als TT.MM.JJJJ (immer Europe/Zurich) */
export function formatDueDate(iso: string): string {
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Zurich",
  }).format(new Date(iso));
}

/**
 * Datumsfeld (YYYY-MM-DD) → Fristzeitpunkt 09:00 Lokalzeit als ISO-String.
 * Nutzt die Zeitzone des Browsers – für Nutzer in der Schweiz Europe/Zurich.
 */
export function dueAtFromDateInput(dateStr: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  return new Date(`${dateStr}T09:00:00`).toISOString();
}

export type TaskListItem = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  action_type: TaskActionType;
  due_at: string | null;
  amount: number | null;
  currency: string;
  document_id: string | null;
  completed_at: string | null;
  /** Titel des verknüpften Dokuments – zeigt, zu welcher Rechnung die Aufgabe gehört */
  document_title?: string | null;
};

export function isTaskOverdue(task: {
  status: TaskStatus;
  due_at: string | null;
}): boolean {
  if (task.status === "overdue") return true;
  if (!OPEN_TASK_STATUSES.includes(task.status) || !task.due_at) return false;
  return new Date(task.due_at).getTime() < Date.now();
}

export type TaskGroups<T> = {
  overdue: T[];
  today: T[];
  thisWeek: T[];
  later: T[];
  noDue: T[];
  done: T[];
};

/** Gruppierung für die Aufgabenliste (Spez 24.8): überfällig / heute / diese Woche / später / erledigt */
export function groupTasks<T extends TaskListItem>(tasks: T[]): TaskGroups<T> {
  const groups: TaskGroups<T> = {
    overdue: [],
    today: [],
    thisWeek: [],
    later: [],
    noDue: [],
    done: [],
  };
  const today = zurichDateString(new Date());
  const weekEnd = zurichDateString(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  for (const task of tasks) {
    if (DONE_TASK_STATUSES.includes(task.status)) {
      groups.done.push(task);
      continue;
    }
    if (!task.due_at) {
      groups.noDue.push(task);
      continue;
    }
    const dueDay = zurichDateString(task.due_at);
    if (isTaskOverdue(task) && dueDay < today) {
      groups.overdue.push(task);
    } else if (dueDay <= today) {
      groups.today.push(task);
    } else if (dueDay <= weekEnd) {
      groups.thisWeek.push(task);
    } else {
      groups.later.push(task);
    }
  }
  return groups;
}
