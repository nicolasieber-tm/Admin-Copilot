import Link from "next/link";
import { de } from "@/lib/i18n/de";
import {
  formatTaskAmount,
  isTaskOverdue,
  zurichDateString,
  type TaskStatus,
} from "@/lib/tasks";

export type DeadlineTask = {
  id: string;
  title: string;
  status: TaskStatus;
  due_at: string | null;
  amount: number | null;
  currency: string;
  document_title?: string | null;
};

function daysFromToday(dueAt: string): number {
  const today = new Date(`${zurichDateString(new Date())}T00:00:00Z`).getTime();
  const due = new Date(`${zurichDateString(dueAt)}T00:00:00Z`).getTime();
  return Math.round((due - today) / 86_400_000);
}

function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Zurich",
  }).format(new Date(iso));
}

function dueChip(task: DeadlineTask): { label: string; cls: string } | null {
  if (!task.due_at) return null;
  const days = daysFromToday(task.due_at);
  if (isTaskOverdue(task) && days < 0) {
    return { label: de.dashboard.due.overdue, cls: "bg-red-100 text-red-800" };
  }
  if (days <= 7) {
    const label =
      days <= 0
        ? de.dashboard.due.today
        : days === 1
          ? de.dashboard.due.tomorrow
          : de.dashboard.due.inDays(days);
    return { label, cls: "bg-amber-100 text-amber-800" };
  }
  return {
    label: shortDate(task.due_at),
    cls: "bg-accent-soft text-accent-strong",
  };
}

// Fristen-Karte (Start-Tab, Design-Entscheid D2): kompakte Liste der nächsten
// Aufgaben mit Fälligkeits-Chip rechts – ersetzt die frühere 30-Tage-Zeitleiste.
export function DeadlineCard({ tasks }: { tasks: DeadlineTask[] }) {
  return (
    <section className="card-elevated rounded-2xl bg-surface p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[15px] font-semibold tracking-tight">
          {de.dashboard.deadlines}
        </h2>
        <Link
          href="/tasks"
          className="text-xs font-semibold text-accent-strong transition hover:opacity-80"
        >
          {de.dashboard.all} →
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{de.dashboard.noTasks}</p>
      ) : (
        <ul className="mt-1 flex flex-col divide-y divide-black/5">
          {tasks.map((task) => {
            const chip = dueChip(task);
            const amount = formatTaskAmount(task.amount, task.currency);
            const subline = [task.document_title, amount]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={task.id}>
                <Link
                  href={`/tasks/${task.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 transition hover:opacity-80"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {task.title}
                    </span>
                    {subline && (
                      <span className="block truncate text-xs text-muted">
                        {subline}
                      </span>
                    )}
                  </span>
                  {chip && (
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${chip.cls}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                      {chip.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
