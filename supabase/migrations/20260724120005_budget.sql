-- Budget: Monatspläne, Posten, wiederkehrende Vorlagen
-- Referenz: Spez 15.11–15.13, 26; ARCHITECTURE.md §4

create table public.budget_plans (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  -- immer der Monatserste, z. B. 2026-07-01
  month date not null check (extract(day from month) = 1),
  currency char(3) not null default 'CHF',
  -- im MVP optional (Standard null), siehe ARCHITECTURE.md §4 Budgetformel
  opening_balance numeric(12,2),
  expected_income numeric(12,2) not null default 0,
  expected_expenses numeric(12,2) not null default 0,
  projected_balance numeric(12,2),
  data_completeness jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, month)
);

create trigger set_budget_plans_updated_at
before update on public.budget_plans
for each row execute function private.set_updated_at();

create table public.recurring_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  item_type public.budget_item_type not null,
  category text,
  title text not null,
  amount numeric(12,2) not null,
  currency char(3) not null default 'CHF',
  frequency public.recurrence_frequency not null default 'monthly',
  day_of_month integer check (day_of_month between 1 and 31),
  starts_on date,
  ends_on date,
  source_document_id uuid references public.documents (id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recurring_items_workspace_idx on public.recurring_items (workspace_id)
  where active;
create index recurring_items_source_document_idx on public.recurring_items (source_document_id);

create trigger set_recurring_items_updated_at
before update on public.recurring_items
for each row execute function private.set_updated_at();

create table public.budget_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  budget_plan_id uuid not null references public.budget_plans (id) on delete cascade,
  document_id uuid references public.documents (id) on delete set null,
  task_id uuid references public.tasks (id) on delete set null,
  item_type public.budget_item_type not null,
  category text,
  title text not null,
  amount numeric(12,2) not null,
  currency char(3) not null default 'CHF',
  due_date date,
  expected_date date,
  status public.budget_item_status not null default 'planned',
  source public.budget_item_source not null default 'manual',
  is_recurring boolean not null default false,
  recurrence_rule text,
  recurrence_parent_id uuid references public.recurring_items (id) on delete set null,
  confirmed_by_user boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index budget_items_workspace_idx on public.budget_items (workspace_id);
create index budget_items_plan_idx on public.budget_items (budget_plan_id);
create index budget_items_document_idx on public.budget_items (document_id);
create index budget_items_task_idx on public.budget_items (task_id);

-- Idempotente Monatsinstanzen: pro Vorlage und Monatsplan höchstens ein Posten
-- (ARCHITECTURE.md §4, Spez 26.3)
create unique index budget_items_recurrence_unique_idx
  on public.budget_items (recurrence_parent_id, budget_plan_id)
  where recurrence_parent_id is not null and deleted_at is null;

create trigger set_budget_items_updated_at
before update on public.budget_items
for each row execute function private.set_updated_at();
