-- Aufgaben, Erinnerungen, Benachrichtigungen
-- Referenz: Spez 15.8–15.10, 12.8, 12.9

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  document_id uuid references public.documents (id) on delete set null,
  title text not null,
  description text,
  action_type public.task_action_type not null default 'other',
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'open',
  due_at timestamptz,
  amount numeric(12,2),
  currency char(3) not null default 'CHF',
  created_by uuid references public.users (id),
  source public.task_source not null default 'manual',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_workspace_status_idx on public.tasks (workspace_id, status);
create index tasks_workspace_due_idx on public.tasks (workspace_id, due_at);
create index tasks_document_idx on public.tasks (document_id);
create index tasks_created_by_idx on public.tasks (created_by);

create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function private.set_updated_at();

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  channel public.reminder_channel not null default 'in_app',
  scheduled_at timestamptz not null,
  status public.reminder_status not null default 'scheduled',
  sent_at timestamptz,
  failure_reason text,
  retry_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reminders_task_idx on public.reminders (task_id);
create index reminders_workspace_idx on public.reminders (workspace_id);
-- für den Erinnerungs-Job: fällige, noch nicht gesendete Erinnerungen
create index reminders_due_idx on public.reminders (scheduled_at)
  where status = 'scheduled';

create trigger set_reminders_updated_at
before update on public.reminders
for each row execute function private.set_updated_at();

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  related_entity_type text,
  related_entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index notifications_workspace_idx on public.notifications (workspace_id);
