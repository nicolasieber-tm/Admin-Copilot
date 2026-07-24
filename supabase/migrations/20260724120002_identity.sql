-- Identität: Profile, Workspaces, Mitgliedschaften, Signup-Trigger
-- Referenz: Spez 15.1–15.3, 7.3; ARCHITECTURE.md §4

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  preferred_language text not null default 'de',
  explanation_mode public.explanation_mode not null default 'normal',
  timezone text not null default 'Europe/Zurich',
  currency char(3) not null default 'CHF',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger set_users_updated_at
before update on public.users
for each row execute function private.set_updated_at();

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  type public.workspace_type not null default 'personal',
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_workspaces_updated_at
before update on public.workspaces
for each row execute function private.set_updated_at();

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role public.workspace_role not null default 'owner',
  status public.member_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index workspace_members_user_id_idx on public.workspace_members (user_id);

-- RLS-Helper: alle Workspace-IDs des eingeloggten Nutzers.
-- security definer, damit Policies ohne Rekursion auf workspace_members prüfen können.
create or replace function private.user_workspace_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select workspace_id
  from public.workspace_members
  where user_id = (select auth.uid())
    and status = 'active';
$$;

revoke all on function private.user_workspace_ids() from public;
grant execute on function private.user_workspace_ids() to authenticated;
