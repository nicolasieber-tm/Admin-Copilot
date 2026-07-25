import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { de } from "@/lib/i18n/de";
import { TaskEditForm } from "@/components/tasks/task-edit-form";

export const metadata: Metadata = { title: de.tasks.detail.title };

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: task }, { data: reminders }] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        "id, title, status, priority, action_type, due_at, amount, currency, source, document_id, documents(id, title, original_filename)"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("reminders")
      .select("id, channel, scheduled_at, status, sent_at")
      .eq("task_id", id)
      .order("scheduled_at", { ascending: true }),
  ]);

  if (!task) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-2xl font-semibold tracking-tight">
          {de.tasks.detail.title}
        </h1>
        <div className="rounded-2xl bg-surface p-6 text-center card-elevated">
          <p className="text-sm text-muted">{de.tasks.detail.notFound}</p>
        </div>
        <Link href="/tasks" className="text-sm text-accent-strong transition hover:opacity-80">
          ← {de.common.back}
        </Link>
      </div>
    );
  }

  const documentLabel =
    task.documents?.title ?? task.documents?.original_filename ?? null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/tasks"
          className="text-sm text-muted transition hover:opacity-80"
        >
          ← {de.tasks.title}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {de.tasks.detail.title}
        </h1>
      </div>

      {task.document_id && (
        <Link
          href={`/documents/${task.document_id}`}
          className="flex items-center justify-between rounded-2xl bg-accent-soft px-5 py-4 text-sm font-medium text-accent-strong transition hover:opacity-90"
        >
          <span className="min-w-0">
            <span className="block text-xs font-normal">{de.tasks.fromDocument}</span>
            <span className="block truncate">
              {documentLabel ?? de.documents.detail.title}
            </span>
          </span>
          <span aria-hidden>→</span>
        </Link>
      )}

      <TaskEditForm
        task={{
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          action_type: task.action_type,
          due_at: task.due_at,
          amount: task.amount,
          currency: task.currency,
        }}
        reminders={reminders ?? []}
      />
    </div>
  );
}
