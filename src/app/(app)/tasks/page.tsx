import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { de } from "@/lib/i18n/de";
import { groupTasks, type TaskGroups, type TaskListItem } from "@/lib/tasks";
import { TaskItem } from "@/components/tasks/task-item";
import { NewTaskForm } from "@/components/tasks/new-task-form";

export const metadata: Metadata = { title: de.tasks.title };

function TaskGroup({
  title,
  tasks,
  tone = "default",
}: {
  title: string;
  tasks: TaskListItem[];
  tone?: "danger" | "default" | "muted";
}) {
  if (tasks.length === 0) return null;
  const chipClass =
    tone === "danger"
      ? "bg-red-100 text-red-800"
      : tone === "muted"
        ? "bg-black/5 text-muted"
        : "bg-accent-soft text-accent-strong";
  return (
    <section className="card-elevated rounded-2xl bg-surface p-4">
      <div className="mb-1 flex items-center justify-between">
        <h2
          className={`text-[15px] font-semibold tracking-tight ${
            tone === "muted" ? "text-muted" : ""
          }`}
        >
          {title}
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${chipClass}`}
        >
          {tasks.length}
        </span>
      </div>
      <ul className="flex flex-col divide-y divide-black/5">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </section>
  );
}

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("tasks")
    .select(
      "id, title, status, priority, action_type, due_at, amount, currency, document_id, completed_at, documents(title, original_filename)"
    )
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  const tasks: TaskListItem[] = (rows ?? []).map(({ documents, ...task }) => ({
    ...task,
    document_title: documents?.title ?? documents?.original_filename ?? null,
  }));
  const groups: TaskGroups<TaskListItem> = groupTasks(tasks);
  const hasAny = tasks.length > 0;
  // Erledigte zuletzt abgeschlossene zuerst, Anzeige begrenzt
  groups.done.sort((a, b) =>
    (b.completed_at ?? "").localeCompare(a.completed_at ?? "")
  );
  const doneVisible = groups.done.slice(0, 20);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="rise text-2xl font-semibold tracking-tight">{de.tasks.title}</h1>

      <div className="rise-2">
        <NewTaskForm />
      </div>

      <div className="rise-3 flex flex-col gap-5">
        {!hasAny && (
          <div className="rounded-2xl bg-surface p-6 text-center card-elevated">
            <p className="text-sm leading-relaxed text-muted">{de.tasks.empty}</p>
          </div>
        )}

        <TaskGroup title={de.tasks.groups.overdue} tasks={groups.overdue} tone="danger" />
        <TaskGroup title={de.tasks.groups.today} tasks={groups.today} />
        <TaskGroup title={de.tasks.groups.thisWeek} tasks={groups.thisWeek} />
        <TaskGroup title={de.tasks.groups.later} tasks={groups.later} />
        <TaskGroup title={de.tasks.groups.noDue} tasks={groups.noDue} tone="muted" />
        <TaskGroup title={de.tasks.groups.done} tasks={doneVisible} tone="muted" />
      </div>
    </div>
  );
}
