-- Audit für Nutzerbestätigung und Korrekturen (Spez 15.15:
-- amount_confirmed / due_date_corrected). security definer, damit die
-- Inserts die deny-by-default-RLS von audit_events passieren.

create or replace function private.audit_document_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_events (workspace_id, user_id, action, entity_type, entity_id)
  values (new.workspace_id, (select auth.uid()), 'document_confirmed', 'document', new.id);
  return new;
end;
$$;

create trigger audit_document_confirmation
after update on public.documents
for each row
when (old.user_confirmed_at is null and new.user_confirmed_at is not null)
execute function private.audit_document_confirmation();

create or replace function private.audit_entity_correction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_events (workspace_id, user_id, action, entity_type, entity_id, metadata)
  values (
    new.workspace_id, (select auth.uid()), 'entity_corrected', 'document_entity', new.id,
    jsonb_build_object('entity_type', new.entity_type, 'document_id', new.document_id)
  );
  return new;
end;
$$;

create trigger audit_entity_correction
after update on public.document_entities
for each row
when (new.corrected_value is distinct from old.corrected_value and new.corrected_value is not null)
execute function private.audit_entity_correction();
