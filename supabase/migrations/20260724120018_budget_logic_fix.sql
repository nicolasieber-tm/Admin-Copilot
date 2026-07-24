-- Fix: Enum-Cast im Task-Abschluss-Trigger (CASE lieferte text statt
-- public.budget_item_status).
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
