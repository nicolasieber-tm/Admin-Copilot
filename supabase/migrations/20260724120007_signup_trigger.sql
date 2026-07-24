-- Signup-Trigger: Registrierung erzeugt Profil, persönlichen Workspace,
-- Membership (owner) und Audit-Event (ARCHITECTURE.md §4, Spez 12.2)

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  ws_id uuid;
  v_display_name text;
begin
  v_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    split_part(new.email, '@', 1)
  );

  insert into public.users (id, email, display_name, preferred_language)
  values (
    new.id,
    new.email,
    v_display_name,
    coalesce(nullif(new.raw_user_meta_data ->> 'preferred_language', ''), 'de')
  );

  insert into public.workspaces (type, name)
  values ('personal', v_display_name)
  returning id into ws_id;

  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (ws_id, new.id, 'owner', 'active');

  insert into public.audit_events (workspace_id, user_id, action, entity_type, entity_id)
  values (ws_id, new.id, 'user_registered', 'user', new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();
