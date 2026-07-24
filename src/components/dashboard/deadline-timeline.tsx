import Link from "next/link";
import { de } from "@/lib/i18n/de";
import {
  formatDueDate,
  formatTaskAmount,
  isTaskOverdue,
  zurichDateString,
  type TaskStatus,
} from "@/lib/tasks";

export type TimelineTask = {
  id: string;
  title: string;
  status: TaskStatus;
  due_at: string | null;
  amount: number | null;
  currency: string;
  document_title?: string | null;
};

const WINDOW_DAYS = 30;

function daysFromToday(dueAt: string): number {
  const today = new Date(`${zurichDateString(new Date())}T00:00:00Z`).getTime();
  const due = new Date(`${zurichDateString(dueAt)}T00:00:00Z`).getTime();
  return Math.round((due - today) / 86_400_000);
}

// Fristen-Zeitleiste (Start-Tab): die nächsten 30 Tage als Linie mit Punkten,
// darunter die zugehörigen Aufgaben. Überfälliges sammelt sich rot am Anfang.
export function DeadlineTimeline({ tasks }: { tasks: TimelineTask[] }) {
  const dated = tasks.filter((t) => t.due_at != null);
  const dots = dated
    .map((task) => {
      const days = daysFromToday(task.due_at!);
      return {
        task,
        days,
        percent: Math.min(Math.max((days / WINDOW_DAYS) * 100, 0), 100),
        overdue: isTaskOverdue(task),
        soon: days >= 0 && days <= 7,
      };
    })
    .filter((d) => d.days <= WINDOW_DAYS);

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">
        {de.dashboard.nextTasks}
      </h2>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted">{de.dashboard.noTasks}</p>
      ) : (
        <>
          {dots.length > 0 && (
            <div className="mb-1 mt-4">
              <div className="relative h-6">
                <span className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-black/10" />
                {dots.map((dot) => (
                  <Link
                    key={dot.task.id}
                    href={`/tasks/${dot.task.id}`}
                    title={`${dot.task.title}${
                      dot.task.due_at ? ` – ${formatDueDate(dot.task.due_at)}` : ""
                    }`}
                    className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface transition hover:scale-125 ${
                      dot.overdue
                        ? "bg-red-500"
                        : dot.soon
                          ? "bg-amber-500"
                          : "bg-accent"
                    }`}
                    style={{ left: `${dot.percent}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted">
                <span>▲ {de.dashboard.today}</span>
                <span>{de.dashboard.timeline}</span>
              </div>
            </div>
          )}

          <ul className="flex flex-col divide-y divide-black/5">
            {tasks.map((task) => {
              const overdue = isTaskOverdue(task);
              const amount = formatTaskAmount(task.amount, task.currency);
              return (
                <li key={task.id}>
                  <Link
                    href={`/tasks/${task.id}`}
                    className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {task.title}
                      </span>
                      {task.document_title && (
                        <span className="block truncate text-xs text-muted">
                          {task.document_title}
                        </span>
                      )}
                      <span
                        className={`block text-xs ${
                          overdue ? "font-medium text-red-700" : "text-muted"
                        }`}
                      >
                        {task.due_at
                          ? de.tasks.dueOn(formatDueDate(task.due_at))
                          : de.tasks.groups.noDue}
                        {amount ? ` · ${amount}` : ""}
                      </span>
                    </span>
                    {overdue && (
                      <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
                        {de.tasks.groups.overdue}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/tasks"
            className="mt-2 block text-sm font-medium text-accent-strong transition hover:opacity-80"
          >
            {de.dashboard.allTasks} →
          </Link>
        </>
      )}
    </section>
  );
}
