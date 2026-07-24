-- Row Level Security: deny by default auf allen Tabellen,
-- Standardmuster: Zugriff nur innerhalb der eigenen Workspaces
-- (ARCHITECTURE.md §5, Spez 20.3)

-- users ---------------------------------------------------------------------
alter table public.users enable row level security;

create policy "users_select_own" on public.users
for select to authenticated
using (id = (select auth.uid()));

create policy "users_update_own" on public.users
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Insert/Delete nur über Signup-Trigger bzw. delete-account (Service Role)

-- workspaces ----------------------------------------------------------------
alter table public.workspaces enable row level security;

create policy "workspaces_select_member" on public.workspaces
for select to authenticated
using (id in (select private.user_workspace_ids()));

create policy "workspaces_update_member" on public.workspaces
for update to authenticated
using (id in (select private.user_workspace_ids()))
with check (id in (select private.user_workspace_ids()));

-- workspace_members ---------------------------------------------------------
alter table public.workspace_members enable row level security;

create policy "workspace_members_select_member" on public.workspace_members
for select to authenticated
using (workspace_id in (select private.user_workspace_ids()));

-- Verwaltung von Mitgliedschaften erst mit Organisations-Workspaces (Phase später)

-- documents -----------------------------------------------------------------
alter table public.documents enable row level security;

create policy "documents_select_member" on public.documents
for select to authenticated
using (workspace_id in (select private.user_workspace_ids()));

create policy "documents_insert_member" on public.documents
for insert to authenticated
with check (
  workspace_id in (select private.user_workspace_ids())
  and uploaded_by = (select auth.uid())
);

create policy "documents_update_member" on public.documents
for update to authenticated
using (workspace_id in (select private.user_workspace_ids()))
with check (workspace_id in (select private.user_workspace_ids()));

create policy "documents_delete_member" on public.documents
for delete to authenticated
using (workspace_id in (select private.user_workspace_ids()));

-- document_pages ------------------------------------------------------------
alter table public.document_pages enable row level security;

create policy "document_pages_select_member" on public.document_pages
for select to authenticated
using (workspace_id in (select private.user_workspace_ids()));

create policy "document_pages_insert_member" on public.document_pages
for insert to authenticated
with check (workspace_id in (select private.user_workspace_ids()));

create policy "document_pages_update_member" on public.document_pages
for update to authenticated
using (workspace_id in (select private.user_workspace_ids()))
with check (workspace_id in (select private.user_workspace_ids()));

create policy "document_pages_delete_member" on public.document_pages
for delete to authenticated
using (workspace_id in (select private.user_workspace_ids()));

-- document_analyses: nur lesen – geschrieben wird ausschliesslich durch die
-- Pipeline (Edge Functions mit Service Role, Phase 2)
alter table public.document_analyses enable row level security;

create policy "document_analyses_select_member" on public.document_analyses
for select to authenticated
using (workspace_id in (select private.user_workspace_ids()));

-- document_entities: lesen + bestätigen/korrigieren durch den Nutzer
alter table public.document_entities enable row level security;

create policy "document_entities_select_member" on public.document_entities
for select to authenticated
using (workspace_id in (select private.user_workspace_ids()));

create policy "document_entities_update_member" on public.document_entities
for update to authenticated
using (workspace_id in (select private.user_workspace_ids()))
with check (workspace_id in (select private.user_workspace_ids()));

-- tasks ---------------------------------------------------------------------
alter table public.tasks enable row level security;

create policy "tasks_select_member" on public.tasks
for select to authenticated
using (workspace_id in (select private.user_workspace_ids()));

create policy "tasks_insert_member" on public.tasks
for insert to authenticated
with check (workspace_id in (select private.user_workspace_ids()));

create policy "tasks_update_member" on public.tasks
for update to authenticated
using (workspace_id in (select private.user_workspace_ids()))
with check (workspace_id in (select private.user_workspace_ids()));

create policy "tasks_delete_member" on public.tasks
for delete to authenticated
using (workspace_id in (select private.user_workspace_ids()));

-- reminders -----------------------------------------------------------------
alter table public.reminders enable row level security;

create policy "reminders_select_member" on public.reminders
for select to authenticated
using (workspace_id in (select private.user_workspace_ids()));

create policy "reminders_insert_member" on public.reminders
for insert to authenticated
with check (workspace_id in (select private.user_workspace_ids()));

create policy "reminders_update_member" on public.reminders
for update to authenticated
using (workspace_id in (select private.user_workspace_ids()))
with check (workspace_id in (select private.user_workspace_ids()));

create policy "reminders_delete_member" on public.reminders
for delete to authenticated
using (workspace_id in (select private.user_workspace_ids()));

-- notifications: strikt persönlich ------------------------------------------
alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
for select to authenticated
using (user_id = (select auth.uid()));

create policy "notifications_update_own" on public.notifications
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- budget_plans --------------------------------------------------------------
alter table public.budget_plans enable row level security;

create policy "budget_plans_select_member" on public.budget_plans
for select to authenticated
using (workspace_id in (select private.user_workspace_ids()));

create policy "budget_plans_insert_member" on public.budget_plans
for insert to authenticated
with check (workspace_id in (select private.user_workspace_ids()));

create policy "budget_plans_update_member" on public.budget_plans
for update to authenticated
using (workspace_id in (select private.user_workspace_ids()))
with check (workspace_id in (select private.user_workspace_ids()));

-- budget_items --------------------------------------------------------------
alter table public.budget_items enable row level security;

create policy "budget_items_select_member" on public.budget_items
for select to authenticated
using (workspace_id in (select private.user_workspace_ids()));

create policy "budget_items_insert_member" on public.budget_items
for insert to authenticated
with check (workspace_id in (select private.user_workspace_ids()));

create policy "budget_items_update_member" on public.budget_items
for update to authenticated
using (workspace_id in (select private.user_workspace_ids()))
with check (workspace_id in (select private.user_workspace_ids()));

create policy "budget_items_delete_member" on public.budget_items
for delete to authenticated
using (workspace_id in (select private.user_workspace_ids()));

-- recurring_items -----------------------------------------------------------
alter table public.recurring_items enable row level security;

create policy "recurring_items_select_member" on public.recurring_items
for select to authenticated
using (workspace_id in (select private.user_workspace_ids()));

create policy "recurring_items_insert_member" on public.recurring_items
for insert to authenticated
with check (workspace_id in (select private.user_workspace_ids()));

create policy "recurring_items_update_member" on public.recurring_items
for update to authenticated
using (workspace_id in (select private.user_workspace_ids()))
with check (workspace_id in (select private.user_workspace_ids()));

create policy "recurring_items_delete_member" on public.recurring_items
for delete to authenticated
using (workspace_id in (select private.user_workspace_ids()));

-- document_questions --------------------------------------------------------
alter table public.document_questions enable row level security;

create policy "document_questions_select_member" on public.document_questions
for select to authenticated
using (workspace_id in (select private.user_workspace_ids()));

create policy "document_questions_insert_member" on public.document_questions
for insert to authenticated
with check (
  workspace_id in (select private.user_workspace_ids())
  and user_id = (select auth.uid())
);

-- audit_events: nur lesen – geschrieben wird ausschliesslich über
-- security-definer-Trigger bzw. Edge Functions
alter table public.audit_events enable row level security;

create policy "audit_events_select_member" on public.audit_events
for select to authenticated
using (workspace_id in (select private.user_workspace_ids()));
