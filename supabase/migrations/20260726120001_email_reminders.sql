-- E-Mail-Kanal für Erinnerungen (offener Punkt Nr. 2, Resend-Domain
-- admin-pilot.trendingmedia.ch ist verifiziert):
-- Fällige Erinnerungen erzeugen wie bisher In-App-Benachrichtigungen; neu
-- werden sie zusätzlich als E-Mail-pending markiert (pro Nutzer abschaltbar)
-- und von der Edge Function send-reminders via Resend verschickt.

-- Nutzer-Einstellung: E-Mail-Erinnerungen ein/aus (Standard: ein)
alter table public.users
  add column if not exists email_reminders_enabled boolean not null default true;

-- Zustellstatus des E-Mail-Kanals direkt an der Benachrichtigung
alter table public.notifications
  add column if not exists email_pending boolean not null default false,
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_error text;

create index if not exists notifications_email_pending_idx
  on public.notifications (created_at)
  where email_pending;

-- Worker-Aufruf (Best Effort, wie invoke_analyse_worker): der Legacy-Anon-Key
-- ist öffentlich und dient nur dazu, die JWT-Prüfung der Function zu passieren.
create or replace function private.invoke_send_reminders()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform net.http_post(
    url := 'https://etfkakxetxaustlpvnzo.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Zmtha3hldHhhdXN0bHB2bnpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4ODE0NjMsImV4cCI6MjEwMDQ1NzQ2M30.6sXf4lmqbwqorROL-q--vNVSpRMgPOfbycqJx3sKrvA'
    ),
    body := '{}'::jsonb
  );
exception
  when others then
    raise log 'invoke_send_reminders failed: %', sqlerrm;
end;
$$;

-- Atomare Übergabe an den Worker: markiert pending-Zeilen als übernommen und
-- liefert alles, was für den Versand nötig ist. Nur für den Service Role –
-- Clients haben keinen Zugriff.
create or replace function public.claim_reminder_emails(p_limit integer default 20)
returns table (
  notification_id uuid,
  email text,
  title text,
  message text,
  task_id uuid
)
language sql
security definer
set search_path = ''
as $$
  with claimed as (
    select n.id
      from public.notifications n
      join public.users u on u.id = n.user_id
     where n.email_pending
       and u.email is not null
     order by n.created_at
     limit p_limit
     for update of n skip locked
  ), updated as (
    update public.notifications n
       set email_pending = false
     where n.id in (select id from claimed)
     returning n.id, n.user_id, n.title, n.message,
               case
                 when n.related_entity_type = 'task' then n.related_entity_id
               end as task_id
  )
  select up.id, u.email, up.title, up.message, up.task_id
    from updated up
    join public.users u on u.id = up.user_id;
$$;

revoke execute on function public.claim_reminder_emails(integer) from public;
revoke execute on function public.claim_reminder_emails(integer) from anon;
revoke execute on function public.claim_reminder_emails(integer) from authenticated;
grant execute on function public.claim_reminder_emails(integer) to service_role;

-- Erinnerungs-Verarbeitung: wie bisher, aber Benachrichtigungen tragen neu
-- email_pending gemäss Nutzer-Einstellung; danach Worker anstossen.
create or replace function private.process_due_reminders()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Überfällige offene Aufgaben (Spez 25.2). Kein automatisches Erledigen.
  update public.tasks
     set status = 'overdue'
   where status = 'open' and due_at is not null and due_at < now();

  -- Erledigte Aufgaben lösen keine Erinnerungen mehr aus (Spez 28.5).
  update public.reminders r
     set status = 'cancelled'
    from public.tasks t
   where r.task_id = t.id
     and r.status = 'scheduled'
     and t.status in ('completed', 'not_required');

  -- Fällige Erinnerungen an alle aktiven Workspace-Mitglieder zustellen.
  with due as (
    select r.id, r.task_id, r.workspace_id, t.title, t.due_at, t.amount, t.currency
      from public.reminders r
      join public.tasks t on t.id = r.task_id
     where r.status = 'scheduled'
       and r.channel = 'in_app'
       and r.scheduled_at <= now()
       for update of r skip locked
  ), notified as (
    insert into public.notifications
      (user_id, workspace_id, type, title, message,
       related_entity_type, related_entity_id, email_pending)
    select
      wm.user_id,
      d.workspace_id,
      'task_reminder',
      'Erinnerung: ' || d.title,
      case
        when d.due_at is null then 'Diese Aufgabe wartet auf dich.'
        else 'Fällig am ' || to_char(d.due_at at time zone 'Europe/Zurich', 'DD.MM.YYYY')
      end
      || case
           when d.amount is not null
             then ' – ' || d.currency || ' ' || to_char(d.amount, 'FM999999990.00')
           else ''
         end,
      'task',
      d.task_id,
      u.email_reminders_enabled and u.email is not null
    from due d
    join public.workspace_members wm
      on wm.workspace_id = d.workspace_id and wm.status = 'active'
    join public.users u on u.id = wm.user_id
    returning 1
  )
  update public.reminders r
     set status = 'sent', sent_at = now()
   where r.id in (select id from due);

  -- Offene E-Mails? Worker anstossen (er beendet sich sofort, wenn nichts da ist)
  if exists (select 1 from public.notifications where email_pending) then
    perform private.invoke_send_reminders();
  end if;
end;
$$;
