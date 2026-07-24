-- Bestätigung als atomare RPC mit Budget-Wahl (Spez 11.6/11.8, 25.5):
-- Der Nutzer entscheidet, ob der Dokumentbetrag einen neuen Budgetposten
-- erzeugt, mit einem bestehenden (fixen/wiederkehrenden) Posten zusammen-
-- geführt wird oder nicht ins Budget übernommen wird. Damit werden fixe
-- Posten wie "Heizkosten" nicht doppelt gezählt, wenn die echte Rechnung
-- eingescannt wird. Ersetzt den automatischen Budget-Trigger aus Migration 17.

drop trigger if exists create_budget_item_on_confirmation on public.documents;
drop function if exists private.create_budget_item_on_confirmation();

-- Budgetposten aus einem bestätigten Dokument erzeugen (nur bei Nutzerwahl
-- "neu erstellen"). Bestätigte/korrigierte Entity-Werte haben Vorrang.
create or replace function private.create_budget_item_for_document(p_document_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_doc public.documents;
  v_rec jsonb;
  v_due date;
  v_amount numeric(12, 2);
  v_month date;
  v_plan_id uuid;
  v_task_id uuid;
begin
  if exists (
    select 1 from public.budget_items b
    where b.document_id = p_document_id and b.deleted_at is null
  ) then
    return;
  end if;

  select * into v_doc from public.documents where id = p_document_id;
  if v_doc.id is null then return; end if;

  select nullif(da.explanation_result -> 'recommended_budget_item', 'null'::jsonb)
    into v_rec
    from public.document_analyses da
   where da.document_id = v_doc.id and da.status = 'completed'
   order by da.analysis_version desc
   limit 1;

  select to_date(coalesce(nullif(e.corrected_value, ''), e.value_text), 'YYYY-MM-DD')
    into v_due
    from public.document_entities e
   where e.document_id = v_doc.id
     and e.entity_type = 'due_date'
     and coalesce(nullif(e.corrected_value, ''), e.value_text) ~ '^\d{4}-\d{2}-\d{2}$'
   order by e.created_at desc
   limit 1;

  select coalesce(
           case when e.corrected_value ~ '^\d+(\.\d+)?$' then e.corrected_value::numeric end,
           (e.value_json ->> 'value')::numeric
         )
    into v_amount
    from public.document_entities e
   where e.document_id = v_doc.id and e.entity_type = 'amount'
   order by e.created_at desc
   limit 1;

  v_due := coalesce(
    v_due,
    case when v_rec ->> 'due_date' ~ '^\d{4}-\d{2}-\d{2}$'
         then to_date(v_rec ->> 'due_date', 'YYYY-MM-DD') end
  );
  v_amount := coalesce(v_amount, (v_rec ->> 'amount')::numeric);
  if v_amount is null then
    return;
  end if;

  v_month := date_trunc('month', coalesce(v_due, (now() at time zone 'Europe/Zurich')::date))::date;
  v_plan_id := private.ensure_budget_plan(v_doc.workspace_id, v_month);

  select t.id into v_task_id
    from public.tasks t
   where t.document_id = v_doc.id
   order by t.created_at
   limit 1;

  insert into public.budget_items (
    workspace_id, budget_plan_id, document_id, task_id, item_type, category,
    title, amount, currency, due_date, status, source, is_recurring, confirmed_by_user
  ) values (
    v_doc.workspace_id, v_plan_id, v_doc.id, v_task_id,
    case when v_rec ->> 'item_type' = 'income'
         then 'income'::public.budget_item_type
         else 'expense'::public.budget_item_type end,
    nullif(v_rec ->> 'category', ''),
    coalesce(nullif(v_rec ->> 'title', ''), v_doc.title, 'Dokumentbetrag'),
    v_amount,
    coalesce(nullif(v_rec ->> 'currency', ''), 'CHF'),
    v_due, 'planned', 'document',
    coalesce((v_rec ->> 'is_recurring')::boolean, false),
    true
  );
end;
$$;

-- Atomare Bestätigung: Entities korrigieren/bestätigen, Dokument bestätigen
-- (löst den Aufgaben-Trigger aus), Budget gemäss Nutzerwahl.
create or replace function public.confirm_document(
  p_document_id uuid,
  p_category text,
  p_amount text default null,
  p_due_date date default null,
  p_budget_action text default 'create',   -- 'create' | 'merge' | 'skip'
  p_budget_item_id uuid default null
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
  if p_budget_action = 'skip' then
    return;
  end if;

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
    return;
  end if;

  perform private.create_budget_item_for_document(v_doc.id);
end;
$$;

revoke execute on function public.confirm_document(uuid, text, text, date, text, uuid) from public, anon;
grant execute on function public.confirm_document(uuid, text, text, date, text, uuid) to authenticated;
