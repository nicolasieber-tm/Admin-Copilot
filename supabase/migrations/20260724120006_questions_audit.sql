-- Dokumentfragen (Chat) und Audit-Grundlage
-- Referenz: Spez 15.14, 15.15; ARCHITECTURE.md §5

create table public.document_questions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  question text not null,
  answer text,
  cited_entities jsonb,
  cited_pages jsonb,
  provider text,
  model text,
  created_at timestamptz not null default now()
);

create index document_questions_document_idx on public.document_questions (document_id);
create index document_questions_workspace_idx on public.document_questions (workspace_id);
create index document_questions_user_idx on public.document_questions (user_id);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete set null,
  user_id uuid references public.users (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_workspace_created_idx on public.audit_events (workspace_id, created_at desc);
create index audit_events_user_idx on public.audit_events (user_id);

-- Audit-Trigger für Dokumente (Spez 15.15: document_uploaded / document_deleted).
-- security definer, damit der Insert die deny-by-default-RLS von audit_events passiert.
create or replace function private.audit_document_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_events (workspace_id, user_id, action, entity_type, entity_id, metadata)
    values (
      new.workspace_id, (select auth.uid()), 'document_uploaded', 'document', new.id,
      jsonb_build_object('filename', new.original_filename, 'mime_type', new.mime_type, 'page_count', new.page_count)
    );
    return new;
  elsif tg_op = 'UPDATE' and new.deleted_at is not null and old.deleted_at is null then
    insert into public.audit_events (workspace_id, user_id, action, entity_type, entity_id)
    values (new.workspace_id, (select auth.uid()), 'document_deleted', 'document', new.id);
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.audit_events (workspace_id, user_id, action, entity_type, entity_id)
    values (old.workspace_id, (select auth.uid()), 'document_deleted', 'document', old.id);
    return old;
  end if;
  return new;
end;
$$;

create trigger audit_documents
after insert or update or delete on public.documents
for each row execute function private.audit_document_changes();
