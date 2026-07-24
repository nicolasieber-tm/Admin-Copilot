-- Phase 5: Budget – Monatspläne, Dokumentübernahme, wiederkehrende Instanzen,
-- Neuberechnung. Referenz: Spez 11.8, 12.10, 26; ARCHITECTURE.md §4/§7.

-- ---------------------------------------------------------------------------
-- Monatsplan holen oder anlegen (immer Monatserster).
create or replace function private.ensure_budget_plan(
  p_workspace_id uuid,
  p_month date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_month date := date_trunc('month', p_month)::date;
  v_id uuid;
begin
  insert into public.budget_plans (workspace_id, month)
  values (p_workspace_id, v_month)
  on conflict (workspace_id, month) do nothing;

  select id into v_id
    from public.budget_plans
   where workspace_id = p_workspace_id and month = v_month;
  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Neuberechnung eines Monatsplans (ARCHITECTURE.md §4: synchron, kein Job).
-- projizierter_rest = eröffnungsbestand (optional) + einnahmen − ausgaben;
-- data_completeness kennzeichnet das Ergebnis als Schätzung (Spez 26.2).
create or replace function private.recalculate_budget(p_plan_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_income numeric(12, 2);
  v_expenses numeric(12, 2);
  v_opening numeric(12, 2);
  v_unconfirmed integer;
begin
  select
    coalesce(sum(amount) filter (where item_type = 'income'), 0),
    coalesce(sum(amount) filter (where item_type = 'expense'), 0),
    count(*) filter (where source = 'document' and not confirmed_by_user)
    into v_income, v_expenses, v_unconfirmed
    from public.budget_items
   where budget_plan_id = p_plan_id
     and deleted_at is null
     and status not in ('cancelled', 'postponed');

  select opening_balance into v_opening
    from public.budget_plans where id = p_plan_id;

  update public.budget_plans
     set expected_income = v_income,
         expected_expenses = v_expenses,
         projected_balance = coalesce(v_opening, 0) + v_income - v_expenses,
         data_completeness = jsonb_build_object(
           'has_income', v_income > 0,
           'has_expenses', v_expenses > 0,
           'has_opening_balance', v_opening is not null,
           'unconfirmed_document_items', v_unconfirmed,
           'is_estimate', v_income = 0 or v_expenses = 0
         )
   where id = p_plan_id;
end;
$$;

-- Jede Posten-Änderung berechnet den betroffenen Plan sofort neu.
create or replace function private.budget_item_recalculate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    perform private.recalculate_budget(new.budget_plan_id);
  end if;
  if tg_op = 'UPDATE' and old.budget_plan_id <> new.budget_plan_id then
    perform private.recalculate_budget(old.budget_plan_id);
  end if;
  if tg_op = 'DELETE' then
    perform private.recalculate_budget(old.budget_plan_id);
    return old;
  end if;
  return new;
end;
$$;

create trigger budget_item_recalculate
after insert or update or delete on public.budget_items
for each row execute function private.budget_item_recalculate();

-- ---------------------------------------------------------------------------
-- Monatsinstanzen aktiver wiederkehrender Vorlagen idempotent erzeugen
-- (Spez 26.3; Unique-Index budget_items_recurrence_unique_idx).
-- MVP: monatlich/vierteljährlich/halbjährlich/jährlich; 'weekly' wird bewusst
-- nicht materialisiert (UI bietet es nicht an).
create or replace function private.materialize_recurring_items(
  p_workspace_id uuid,
  p_month date
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_month date := date_trunc('month', p_month)::date;
  v_plan_id uuid;
  v_days_in_month integer := extract(day from (v_month + interval '1 month - 1 day'))::integer;
begin
  v_plan_id := private.ensure_budget_plan(p_workspace_id, v_month);

  insert into public.budget_items (
    workspace_id, budget_plan_id, item_type, category, title, amount, currency,
    due_date, status, source, is_recurring, recurrence_parent_id, confirmed_by_user
  )
  select
    r.workspace_id, v_plan_id, r.item_type, r.category, r.title, r.amount, r.currency,
    case when r.day_of_month is null then null
         else v_month + (least(r.day_of_month, v_days_in_month) - 1) end,
    'planned', 'manual', true, r.id, true
  from public.recurring_items r
  where r.workspace_id = p_workspace_id
    and r.active
    and r.frequency <> 'weekly'
    and (r.starts_on is null or date_trunc('month', r.starts_on)::date <= v_month)
    and (r.ends_on is null or r.ends_on >= v_month)
    and (
      (extract(year from v_month) * 12 + extract(month from v_month))
      - (extract(year from coalesce(date_trunc('month', r.starts_on)::date, v_month)) * 12
         + extract(month from coalesce(date_trunc('month', r.starts_on)::date, v_month)))
    )::integer % case r.frequency
                   when 'monthly' then 1
                   when 'quarterly' then 3
                   when 'semiannual' then 6
                   else 12
                 end = 0
  on conflict (recurrence_parent_id, budget_plan_id)
    where recurrence_parent_id is not null and deleted_at is null
  do nothing;

  perform private.recalculate_budget(v_plan_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC fürs Frontend: Monatsplan öffnen (anlegen falls nötig, wiederkehrende
-- Instanzen materialisieren, neu berechnen) und Plan-ID zurückgeben.
create or replace function public.ensure_budget_plan(p_month date)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workspace_id uuid;
begin
  select workspace_id into v_workspace_id
    from public.workspace_members
   where user_id = (select auth.uid()) and status = 'active'
   order by created_at
   limit 1;
  if v_workspace_id is null then
    raise exception 'kein Workspace für diesen Nutzer';
  end if;

  perform private.materialize_recurring_items(v_workspace_id, p_month);
  return private.ensure_budget_plan(v_workspace_id, p_month);
end;
$$;

revoke execute on function public.ensure_budget_plan(date) from public, anon;
grant execute on function public.ensure_budget_plan(date) to authenticated;

-- ---------------------------------------------------------------------------
-- Budgetübernahme bei Dokumentbestätigung (Spez 11.8, ARCHITECTURE.md §7
-- Schritt 5): Vorschlag der Analyse + bestätigte Werte → Budgetposten im
-- Monat der Frist. Keine Duplikate bei erneuter Bestätigung.
create or replace function private.create_budget_item_on_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rec jsonb;
  v_due date;
  v_amount numeric(12, 2);
  v_month date;
  v_plan_id uuid;
  v_task_id uuid;
  v_item_type public.budget_item_type;
begin
  if exists (
    select 1 from public.budget_items b
    where b.document_id = new.id and b.deleted_at is null
  ) then
    return new;
  end if;

  select nullif(da.explanation_result -> 'recommended_budget_item', 'null'::jsonb)
    into v_rec
    from public.document_analyses da
   where da.document_id = new.id and da.status = 'completed'
   order by da.analysis_version desc
   limit 1;
  if v_rec is null then
    return new;
  end if;

  -- Bestätigte bzw. korrigierte Werte haben Vorrang vor dem Vorschlag.
  select to_date(coalesce(nullif(e.corrected_value, ''), e.value_text), 'YYYY-MM-DD')
    into v_due
    from public.document_entities e
   where e.document_id = new.id
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
   where e.document_id = new.id and e.entity_type = 'amount'
   order by e.created_at desc
   limit 1;

  v_due := coalesce(
    v_due,
    case when v_rec ->> 'due_date' ~ '^\d{4}-\d{2}-\d{2}$'
         then to_date(v_rec ->> 'due_date', 'YYYY-MM-DD') end
  );
  v_amount := coalesce(v_amount, (v_rec ->> 'amount')::numeric);
  if v_amount is null then
    return new;
  end if;

  v_item_type := case
    when v_rec ->> 'item_type' = 'income' then 'income'
    else 'expense'
  end;
  -- Ohne Datum landet der Posten im aktuellen Monat (Spez 26.5, MVP-Vereinfachung)
  v_month := date_trunc('month', coalesce(v_due, (now() at time zone 'Europe/Zurich')::date))::date;
  v_plan_id := private.ensure_budget_plan(new.workspace_id, v_month);

  select t.id into v_task_id
    from public.tasks t
   where t.document_id = new.id
   order by t.created_at
   limit 1;

  insert into public.budget_items (
    workspace_id, budget_plan_id, document_id, task_id, item_type, category,
    title, amount, currency, due_date, status, source, is_recurring, confirmed_by_user
  ) values (
    new.workspace_id, v_plan_id, new.id, v_task_id, v_item_type,
    nullif(v_rec ->> 'category', ''),
    coalesce(nullif(v_rec ->> 'title', ''), new.title, 'Dokumentbetrag'),
    v_amount,
    coalesce(nullif(v_rec ->> 'currency', ''), 'CHF'),
    v_due, 'planned', 'document',
    coalesce((v_rec ->> 'is_recurring')::boolean, false),
    true
  );

  return new;
end;
$$;

create trigger create_budget_item_on_confirmation
after update on public.documents
for each row
when (old.user_confirmed_at is null and new.user_confirmed_at is not null)
execute function private.create_budget_item_on_confirmation();

-- ---------------------------------------------------------------------------
-- Aufgabenabschluss markiert den verknüpften Budgetposten (Spez 11.9:
-- Abschluss aktualisiert auch den Budgetstatus).
create or replace function private.budget_item_on_task_done()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.budget_items
     set status = case when item_type = 'income'
                       then 'received'::public.budget_item_status
                       else 'paid'::public.budget_item_status end
   where task_id = new.id
     and deleted_at is null
     and status in ('planned', 'due');
  return new;
end;
$$;

create trigger budget_item_on_task_done
after update on public.tasks
for each row
when (
  new.status in ('completed', 'not_required')
  and old.status not in ('completed', 'not_required')
)
execute function private.budget_item_on_task_done();
