-- Benachrichtigungen automatisch als gelesen markieren, sobald ihre Ursache
-- erledigt ist: "Bitte prüfen"-Hinweise nach der Dokumentbestätigung,
-- Erinnerungen nach dem Abschluss der Aufgabe. Sonst bleiben veraltete
-- Einträge auf dem Dashboard liegen.

create or replace function private.mark_document_notifications_read()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.notifications
     set read_at = now()
   where related_entity_type = 'document'
     and related_entity_id = new.id
     and read_at is null;
  return new;
end;
$$;

create trigger mark_document_notifications_read
after update on public.documents
for each row
when (old.user_confirmed_at is null and new.user_confirmed_at is not null)
execute function private.mark_document_notifications_read();

create or replace function private.mark_task_notifications_read()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.notifications
     set read_at = now()
   where related_entity_type = 'task'
     and related_entity_id = new.id
     and read_at is null;
  return new;
end;
$$;

create trigger mark_task_notifications_read
after update on public.tasks
for each row
when (
  new.status in ('completed', 'not_required')
  and old.status not in ('completed', 'not_required')
)
execute function private.mark_task_notifications_read();

-- Einmalige Bereinigung: offene Hinweise zu bereits bestätigten Dokumenten
-- und bereits erledigten Aufgaben als gelesen markieren.
update public.notifications n
   set read_at = now()
 where n.read_at is null
   and n.related_entity_type = 'document'
   and exists (
     select 1 from public.documents d
      where d.id = n.related_entity_id and d.user_confirmed_at is not null
   );

update public.notifications n
   set read_at = now()
 where n.read_at is null
   and n.related_entity_type = 'task'
   and exists (
     select 1 from public.tasks t
      where t.id = n.related_entity_id
        and t.status in ('completed', 'not_required')
   );
