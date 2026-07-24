-- Wiederkehrende Vorlagen bearbeitbar machen (Spez 26.3, MVP-vereinfacht:
-- Änderungen gelten ab dem aktuellen Monat): Wert-Änderungen an der Vorlage
-- übertragen sich auf geplante, nicht dokumentverknüpfte Instanzen ab dem
-- aktuellen Monat; Deaktivieren entfernt diese Instanzen (Soft Delete).
-- Vergangene Monate und bereits bezahlte/verknüpfte Posten bleiben unberührt.

create or replace function private.propagate_recurring_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_month date :=
    date_trunc('month', (now() at time zone 'Europe/Zurich')::date)::date;
begin
  -- Deaktivierung: offene Instanzen ab aktuellem Monat entfernen
  if old.active and not new.active then
    update public.budget_items b
       set deleted_at = now()
      from public.budget_plans p
     where b.budget_plan_id = p.id
       and b.recurrence_parent_id = new.id
       and b.deleted_at is null
       and b.document_id is null
       and b.status = 'planned'
       and p.month >= v_current_month;
    return new;
  end if;

  -- Wertänderungen auf offene Instanzen ab aktuellem Monat übertragen
  if (new.amount, new.title, new.category, new.item_type, new.day_of_month)
     is distinct from
     (old.amount, old.title, old.category, old.item_type, old.day_of_month) then
    update public.budget_items b
       set amount = new.amount,
           title = new.title,
           category = new.category,
           item_type = new.item_type,
           due_date = case
             when new.day_of_month is null then null
             else p.month + (least(
               new.day_of_month,
               extract(day from (p.month + interval '1 month - 1 day'))::integer
             ) - 1)
           end
      from public.budget_plans p
     where b.budget_plan_id = p.id
       and b.recurrence_parent_id = new.id
       and b.deleted_at is null
       and b.document_id is null
       and b.status = 'planned'
       and p.month >= v_current_month;
  end if;

  return new;
end;
$$;

create trigger propagate_recurring_changes
after update on public.recurring_items
for each row execute function private.propagate_recurring_changes();
