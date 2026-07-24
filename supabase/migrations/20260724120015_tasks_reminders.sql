-- Phase 4: Aufgaben + Erinnerungen
-- Referenz: Spez 11.7 (Aufgabe nach Bestätigung), 12.9 (Erinnerungslogik 7/2/0),
-- 25.5 (keine doppelten Aufgaben, Friständerung aktualisiert Erinnerungen),
-- 28.5 (erledigte Aufgaben lösen keine Erinnerungen mehr aus), 11.9 (Abschluss).

-- ---------------------------------------------------------------------------
-- Standard-Erinnerungen: 7 Tage vorher, 2 Tage vorher, am Fälligkeitstag.
-- Vergangene Zeitpunkte werden übersprungen (kurzfristige Fristen erzeugen
-- entsprechend weniger Erinnerungen).
create or replace function private.schedule_default_reminders(
  p_task_id uuid,
  p_workspace_id uuid,
  p_due_at timestamptz
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.reminders (task_id, workspace_id, channel, scheduled_at)
  select p_task_id, p_workspace_id, 'in_app', p_due_at - o.offs
  from (values
    (interval '7 days'),
    (interval '2 days'),
    (interval '0 days')
  ) as o(offs)
  where p_due_at is not null
    and p_due_at - o.offs > now();
$$;

-- ---------------------------------------------------------------------------
-- Neue Aufgabe: Standard-Erinnerungen anlegen + Audit (gilt für manuelle und
-- dokumentbasierte Aufgaben gleichermassen).
create or replace function private.task_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.schedule_default_reminders(new.id, new.workspace_id, new.due_at);
  insert into public.audit_events (workspace_id, user_id, action, entity_type, entity_id, metadata)
  values (
    new.workspace_id, (select auth.uid()), 'task_created', 'task', new.id,
    jsonb_build_object('source', new.source, 'document_id', new.document_id)
  );
  return new;
end;
$$;

create trigger task_after_insert
after insert on public.tasks
for each row execute function private.task_after_insert();

-- ---------------------------------------------------------------------------
-- Aufgaben-Update: Abschluss-, Wiedereröffnungs- und Fristlogik.
create or replace function private.task_before_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Abschluss: Erinnerungen stoppen (Spez 28.5), verknüpftes Dokument
  -- abschliessen, wenn keine weitere offene Aufgabe daran hängt (Spez 11.9).
  if new.status in ('completed', 'not_required')
     and old.status not in ('completed', 'not_required') then
    new.completed_at := coalesce(new.completed_at, now());
    update public.reminders
       set status = 'cancelled'
     where task_id = new.id and status = 'scheduled';
    if new.document_id is not null and not exists (
      select 1 from public.tasks t
      where t.document_id = new.document_id
        and t.id <> new.id
        and t.status not in ('completed', 'not_required')
    ) then
      update public.documents
         set status = 'completed', completed_at = now()
       where id = new.document_id and status in ('confirmed', 'action_open');
    end if;
    insert into public.audit_events (workspace_id, user_id, action, entity_type, entity_id)
    values (new.workspace_id, (select auth.uid()), 'task_completed', 'task', new.id);
  end if;

  -- Wiedereröffnung: Dokument zurück auf "Handlung offen".
  if old.status in ('completed', 'not_required')
     and new.status not in ('completed', 'not_required') then
    new.completed_at := null;
    if new.document_id is not null then
      update public.documents
         set status = 'action_open', completed_at = null
       where id = new.document_id and status = 'completed';
    end if;
  end if;

  -- Friständerung: offene Erinnerungen neu planen (Spez 25.5).
  if new.due_at is distinct from old.due_at then
    delete from public.reminders
     where task_id = new.id and status = 'scheduled';
    if new.status not in ('completed', 'not_required') then
      perform private.schedule_default_reminders(new.id, new.workspace_id, new.due_at);
    end if;
    if new.status = 'overdue' and (new.due_at is null or new.due_at > now()) then
      new.status := 'open';
    end if;
  end if;

  return new;
end;
$$;

create trigger task_before_update
before update on public.tasks
for each row execute function private.task_before_update();

-- ---------------------------------------------------------------------------
-- Bestätigung eines Dokuments erzeugt die Aufgabe (Spez 11.7). Nutzt den
-- Aufgabenvorschlag der Analyse sowie die bestätigten/korrigierten Werte
-- der Entities. Keine Duplikate bei erneuter Analyse/Bestätigung (Spez 25.5).
create or replace function private.create_task_on_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_explanation jsonb;
  v_extraction jsonb;
  v_rec jsonb;
  v_action_raw text;
  v_due date;
  v_amount numeric(12, 2);
  v_tz text;
  v_due_at timestamptz;
  v_title text;
  v_priority public.task_priority;
  v_action public.task_action_type;
begin
  if exists (select 1 from public.tasks t where t.document_id = new.id) then
    return new;
  end if;

  select da.explanation_result, da.extraction_result
    into v_explanation, v_extraction
    from public.document_analyses da
   where da.document_id = new.id and da.status = 'completed'
   order by da.analysis_version desc
   limit 1;

  v_rec := nullif(v_explanation -> 'recommended_task', 'null'::jsonb);

  -- Bestätigte bzw. korrigierte Frist (nur gültige ISO-Daten).
  select to_date(coalesce(nullif(e.corrected_value, ''), e.value_text), 'YYYY-MM-DD')
    into v_due
    from public.document_entities e
   where e.document_id = new.id
     and e.entity_type = 'due_date'
     and coalesce(nullif(e.corrected_value, ''), e.value_text) ~ '^\d{4}-\d{2}-\d{2}$'
   order by e.created_at desc
   limit 1;

  -- Bestätigter bzw. korrigierter Betrag.
  select coalesce(
           case when e.corrected_value ~ '^\d+(\.\d+)?$' then e.corrected_value::numeric end,
           (e.value_json ->> 'value')::numeric
         )
    into v_amount
    from public.document_entities e
   where e.document_id = new.id and e.entity_type = 'amount'
   order by e.created_at desc
   limit 1;

  -- Ohne Handlungssignal entsteht keine Aufgabe (Dokument bleibt "confirmed").
  if v_rec is null and v_due is null and coalesce(new.requires_action, false) = false then
    return new;
  end if;

  v_title := coalesce(
    v_rec ->> 'title',
    case when new.title is not null then 'Erledigen: ' || new.title else 'Dokument bearbeiten' end
  );
  v_priority := case
    when v_rec ->> 'priority' in ('low', 'medium', 'high', 'critical')
      then (v_rec ->> 'priority')::public.task_priority
    else 'medium'
  end;
  v_action_raw := v_extraction -> 'required_actions' -> 0 ->> 'action_type';
  v_action := case
    when v_action_raw in ('pay', 'check', 'respond', 'call', 'fill_form',
                          'send_documents', 'schedule_appointment', 'file', 'other')
      then v_action_raw::public.task_action_type
    when v_amount is not null then 'pay'
    else 'other'
  end;

  -- Frist um 09:00 Lokalzeit des Nutzers (Spez 12.9 Nutzerzeitzone, Default Europe/Zurich).
  select coalesce(u.timezone, 'Europe/Zurich') into v_tz
    from public.users u where u.id = new.uploaded_by;
  if v_due is not null then
    v_due_at := (v_due::text || ' 09:00:00')::timestamp
                at time zone coalesce(v_tz, 'Europe/Zurich');
  end if;

  insert into public.tasks (
    workspace_id, document_id, title, action_type, priority, status,
    due_at, amount, currency, created_by, source
  ) values (
    new.workspace_id, new.id, v_title, v_action, v_priority, 'open',
    v_due_at, v_amount, 'CHF', (select auth.uid()), 'document'
  );

  new.status := 'action_open';
  return new;
end;
$$;

create trigger create_task_on_confirmation
before update on public.documents
for each row
when (old.user_confirmed_at is null and new.user_confirmed_at is not null)
execute function private.create_task_on_confirmation();

-- ---------------------------------------------------------------------------
-- Erinnerungs-Verarbeitung (pg_cron, jede Minute): markiert überfällige
-- Aufgaben, storniert Erinnerungen erledigter Aufgaben und stellt fällige
-- In-App-Erinnerungen als Benachrichtigung zu. E-Mail-Kanal folgt, sobald
-- eine Resend-Domain verifiziert ist (offener Punkt Nr. 2).
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

  -- Fällige In-App-Erinnerungen an alle aktiven Workspace-Mitglieder zustellen.
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
      (user_id, workspace_id, type, title, message, related_entity_type, related_entity_id)
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
      d.task_id
    from due d
    join public.workspace_members wm
      on wm.workspace_id = d.workspace_id and wm.status = 'active'
    returning 1
  )
  update public.reminders r
     set status = 'sent', sent_at = now()
   where r.id in (select id from due);
end;
$$;

select cron.schedule(
  'process-reminders',
  '* * * * *',
  $$select private.process_due_reminders()$$
);
