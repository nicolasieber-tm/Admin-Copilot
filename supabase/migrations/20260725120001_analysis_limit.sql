-- Analyse-Limit pro Workspace (Kostenkontrolle, offener Punkt 3, vor Pilot):
-- höchstens 20 Analyse-Läufe pro Workspace in 24 Stunden. Durchgesetzt an
-- beiden Startpunkten (Upload-Enqueue und Retry). Beim Upload wird das
-- Dokument sicher gespeichert, aber nicht analysiert – der Nutzer sieht eine
-- Benachrichtigung und kann die Analyse später manuell neu starten.

create or replace function private.analysis_quota_exceeded(p_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select count(*) >= 20
  from public.document_analyses
  where workspace_id = p_workspace_id
    and created_at > now() - interval '24 hours';
$$;

-- Enqueue mit Limit-Prüfung (ersetzt Version aus Migration 13).
create or replace function private.enqueue_document_analysis()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version integer;
begin
  if private.analysis_quota_exceeded(new.workspace_id) then
    select coalesce(max(analysis_version), 0) + 1 into v_version
      from public.document_analyses where document_id = new.id;
    insert into public.document_analyses
      (document_id, workspace_id, analysis_version, status, error_code, error_message)
    values
      (new.id, new.workspace_id, v_version, 'failed', 'daily_limit_reached',
       'Tageslimit für Analysen erreicht');
    update public.documents set status = 'failed' where id = new.id;
    insert into public.notifications
      (user_id, workspace_id, type, title, message, related_entity_type, related_entity_id)
    values
      (new.uploaded_by, new.workspace_id, 'analysis_limit',
       'Tageslimit erreicht',
       'Dein Dokument ist sicher gespeichert, wurde aber noch nicht analysiert: Das Tageslimit an Analysen ist erreicht. Starte die Analyse morgen neu.',
       'document', new.id);
    return new;
  end if;

  perform pgmq.send('analyse_document', jsonb_build_object('document_id', new.id));
  update public.documents set status = 'processing' where id = new.id;
  perform private.invoke_analyse_worker();
  return new;
end;
$$;

-- Retry mit Limit-Prüfung (ersetzt Version aus Migration 13).
create or replace function public.retry_document_analysis(p_document_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workspace_id uuid;
begin
  select d.workspace_id into v_workspace_id
    from public.documents d
   where d.id = p_document_id
     and d.workspace_id in (select private.user_workspace_ids())
     and d.status = 'failed'
     and d.deleted_at is null;
  if v_workspace_id is null then
    raise exception 'Dokument nicht gefunden oder nicht erneut analysierbar';
  end if;

  if private.analysis_quota_exceeded(v_workspace_id) then
    raise exception 'daily_limit_reached';
  end if;

  update public.documents set status = 'processing' where id = p_document_id;
  perform pgmq.send('analyse_document', jsonb_build_object('document_id', p_document_id));
  perform private.invoke_analyse_worker();
end;
$$;
