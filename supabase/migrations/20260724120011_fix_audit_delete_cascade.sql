-- Fix: Beim Kaskaden-Delete eines Workspace (z. B. delete-account) feuert der
-- AFTER-DELETE-Trigger auf documents, während der Workspace bereits gelöscht
-- ist. Das Audit-Event darf dann nicht mehr auf den Workspace zeigen, sonst
-- verletzt der Insert den Foreign Key. Der Subselect liefert in diesem Fall
-- null; die Workspace-Referenz bleibt in metadata erhalten.

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
    insert into public.audit_events (workspace_id, user_id, action, entity_type, entity_id, metadata)
    values (
      (select w.id from public.workspaces w where w.id = old.workspace_id),
      (select auth.uid()),
      'document_deleted',
      'document',
      old.id,
      jsonb_build_object('workspace_id', old.workspace_id)
    );
    return old;
  end if;
  return new;
end;
$$;
