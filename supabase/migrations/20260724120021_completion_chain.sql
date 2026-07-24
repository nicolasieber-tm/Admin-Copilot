-- Phase 6: Verbindung – durchgängige Abschlusslogik (Spez 11.9, 40.10):
-- 1) Zahlung im Budget abhaken erledigt auch die verknüpfte Aufgabe (und über
--    deren Trigger das Dokument und die Erinnerungen) – Rückrichtung zur
--    bestehenden Kette Aufgabe → Budget.
-- 2) confirm_document kann ein Dokument direkt als "bereits erledigt"
--    abschliessen (Spez 11.6 "als bereits erledigt markieren", 11.9 "nur
--    abgelegt"): Aufgabe wird erledigt erstellt, Budgetposten sofort bezahlt.

-- ---------------------------------------------------------------------------
-- Budget → Aufgabe: Posten auf bezahlt/erhalten → Aufgabe erledigen.
-- Kein Zyklus: der Aufgaben-Trigger setzt nur Posten mit Status planned/due,
-- dieser Trigger nur Aufgaben, die noch nicht erledigt sind.
create or replace function private.task_on_budget_item_done()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.tasks
     set status = 'completed'
   where id = new.task_id
     and status not in ('completed', 'not_required');
  return new;
end;
$$;

create trigger task_on_budget_item_done
after update on public.budget_items
for each row
when (
  new.status in ('paid', 'received')
  and old.status not in ('paid', 'received')
  and new.task_id is not null
)
execute function private.task_on_budget_item_done();

-- ---------------------------------------------------------------------------
-- confirm_document um "bereits erledigt" erweitern (neue Signatur).
drop function if exists public.confirm_document(uuid, text, text, date, text, uuid);

create or replace function public.confirm_document(
  p_document_id uuid,
  p_category text,
  p_amount text default null,
  p_due_date date default null,
  p_budget_action text default 'create',   -- 'create' | 'merge' | 'skip'
  p_budget_item_id uuid default null,
  p_mark_done boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_doc public.documents;
  v_amount_entity public.document_entities;
  v_due_entity public.document_entities;
  v_amount numeric(12, 2);
  v_task_id uuid;
begin
  select * into v_doc
    from public.documents
   where id = p_document_id
     and workspace_id in (select private.user_workspace_ids())
     and deleted_at is null;
  if v_doc.id is null then
    raise exception 'Dokument nicht gefunden';
  end if;
  if v_doc.user_confirmed_at is not null then
    return; -- bereits bestätigt, nichts doppelt auslösen
  end if;

  -- Betrag bestätigen; Korrektur nur, wenn der Wert wirklich abweicht
  select * into v_amount_entity
    from public.document_entities
   where document_id = v_doc.id and entity_type = 'amount'
   order by created_at desc
   limit 1;
  if v_amount_entity.id is not null then
    v_amount := case when p_amount ~ '^\d+(\.\d+)?$' then p_amount::numeric end;
    update public.document_entities
       set confirmed_by_user = true,
           corrected_value = case
             when v_amount is not null
              and v_amount is distinct from (v_amount_entity.value_json ->> 'value')::numeric
             then p_amount
             else null
           end
     where id = v_amount_entity.id;
  end if;

  -- Frist bestätigen
  select * into v_due_entity
    from public.document_entities
   where document_id = v_doc.id and entity_type = 'due_date'
   order by created_at desc
   limit 1;
  if v_due_entity.id is not null then
    update public.document_entities
       set confirmed_by_user = true,
           corrected_value = case
             when p_due_date is not null
              and (v_due_entity.value_text !~ '^\d{4}-\d{2}-\d{2}$'
                   or p_due_date is distinct from to_date(v_due_entity.value_text, 'YYYY-MM-DD'))
             then p_due_date::text
             else null
           end
     where id = v_due_entity.id;
  end if;

  -- Dokument bestätigen – hier läuft der Aufgaben-Trigger
  update public.documents
     set category = p_category,
         status = 'confirmed',
         user_confirmed_at = now()
   where id = v_doc.id;

  -- Budget gemäss Nutzerwahl (Spez 11.8)
  if p_budget_action = 'merge' and p_budget_item_id is not null then
    select t.id into v_task_id
      from public.tasks t
     where t.document_id = v_doc.id
     order by t.created_at
     limit 1;
    update public.budget_items
       set document_id = v_doc.id,
           task_id = coalesce(task_id, v_task_id),
           amount = coalesce(v_amount,
                             (select (e.value_json ->> 'value')::numeric
                                from public.document_entities e
                               where e.document_id = v_doc.id and e.entity_type = 'amount'
                               order by e.created_at desc limit 1),
                             amount),
           due_date = coalesce(p_due_date, due_date),
           confirmed_by_user = true
     where id = p_budget_item_id
       and workspace_id = v_doc.workspace_id
       and deleted_at is null
       and document_id is null;
  elsif p_budget_action <> 'skip' then
    perform private.create_budget_item_for_document(v_doc.id);
  end if;

  -- "Bereits erledigt": Aufgabe abschliessen (erledigt über Trigger auch
  -- Dokument, Erinnerungen und Budgetposten); ohne Aufgabe direkt das Dokument.
  if p_mark_done then
    update public.tasks
       set status = 'completed'
     where document_id = v_doc.id
       and status not in ('completed', 'not_required');
    update public.documents
       set status = 'completed', completed_at = now()
     where id = v_doc.id and status in ('confirmed', 'action_open');
  end if;
end;
$$;

revoke execute on function public.confirm_document(uuid, text, text, date, text, uuid, boolean) from public, anon;
grant execute on function public.confirm_document(uuid, text, text, date, text, uuid, boolean) to authenticated;
