-- Phase 2: asynchrone Dokumentverarbeitung
-- pgmq-Queue + Enqueue-Trigger + Worker-RPCs + pg_cron-Sweeper + Realtime
-- (ARCHITECTURE.md §6/§7, Spez 14.4, 30.1)

create extension if not exists pgmq;
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

select pgmq.create('analyse_document');

-- Sofortaufruf des Workers nach dem Enqueue (Best Effort – der pg_cron-Sweeper
-- holt liegengebliebene Nachrichten spätestens nach einer Minute ab).
-- Der Legacy-Anon-Key ist öffentlich (steckt in jedem Client-Bundle) und dient
-- hier nur dazu, die JWT-Prüfung der Edge Function zu passieren.
create or replace function private.invoke_analyse_worker()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform net.http_post(
    url := 'https://etfkakxetxaustlpvnzo.supabase.co/functions/v1/analyse-document',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Zmtha3hldHhhdXN0bHB2bnpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4ODE0NjMsImV4cCI6MjEwMDQ1NzQ2M30.6sXf4lmqbwqorROL-q--vNVSpRMgPOfbycqJx3sKrvA'
    ),
    body := '{}'::jsonb
  );
exception
  when others then
    -- Ein fehlgeschlagener Sofortaufruf darf den Upload nie blockieren
    raise log 'invoke_analyse_worker failed: %', sqlerrm;
end;
$$;

-- Enqueue, sobald der Upload abgeschlossen ist (Frontend setzt storage_path
-- als letzten Schritt). Status: uploaded → processing (Spez 25.1).
create or replace function private.enqueue_document_analysis()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pgmq.send('analyse_document', jsonb_build_object('document_id', new.id));
  update public.documents set status = 'processing' where id = new.id;
  perform private.invoke_analyse_worker();
  return new;
end;
$$;

create trigger enqueue_analysis_on_upload_complete
after update on public.documents
for each row
when (old.storage_path is null and new.storage_path is not null and new.status = 'uploaded')
execute function private.enqueue_document_analysis();

-- Worker-RPCs: nur für die Edge Function (service_role) --------------------

create or replace function public.queue_read_analyse(batch integer default 5, vt integer default 300)
returns table (msg_id bigint, read_ct integer, message jsonb)
language sql
security definer
set search_path = ''
as $$
  select msg_id, read_ct, message
  from pgmq.read('analyse_document', vt, batch);
$$;

create or replace function public.queue_archive_analyse(p_msg_id bigint)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select pgmq.archive('analyse_document', p_msg_id);
$$;

revoke all on function public.queue_read_analyse(integer, integer) from public, anon, authenticated;
revoke all on function public.queue_archive_analyse(bigint) from public, anon, authenticated;
grant execute on function public.queue_read_analyse(integer, integer) to service_role;
grant execute on function public.queue_archive_analyse(bigint) to service_role;

-- Erneute Analyse durch den Nutzer (Spez 21.5): erzeugt keinen doppelten
-- Zustand – die Edge Function legt pro Lauf einen neuen document_analyses-
-- Datensatz mit analysis_version + 1 an.
create or replace function public.retry_document_analysis(p_document_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.documents d
    where d.id = p_document_id
      and d.workspace_id in (select private.user_workspace_ids())
      and d.status = 'failed'
      and d.deleted_at is null
  ) then
    raise exception 'Dokument nicht gefunden oder nicht erneut analysierbar';
  end if;

  update public.documents set status = 'processing' where id = p_document_id;
  perform pgmq.send('analyse_document', jsonb_build_object('document_id', p_document_id));
  perform private.invoke_analyse_worker();
end;
$$;

revoke all on function public.retry_document_analysis(uuid) from public, anon;
grant execute on function public.retry_document_analysis(uuid) to authenticated;

-- Sweeper: holt Nachrichten ab, deren Sofortaufruf verloren ging oder deren
-- Visibility-Timeout nach einem Worker-Absturz abgelaufen ist.
select cron.schedule(
  'analyse-document-sweeper',
  '30 seconds',
  $$select private.invoke_analyse_worker()$$
);

-- Realtime: Statusänderungen an Dokumenten live ins UI (ARCHITECTURE.md §1)
alter publication supabase_realtime add table public.documents;
