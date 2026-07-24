-- RLS-Smoke-Test (Phase 1, DoD Punkt 3):
-- Nutzer A sieht nichts von Nutzer B – und umgekehrt.
--
-- Ausführung als postgres (Supabase SQL Editor oder MCP execute_sql).
-- Der Test legt zwei Wegwerf-Nutzer an, prüft die Policies unter der Rolle
-- `authenticated` und räumt am Ende wieder auf. Schlägt eine Prüfung fehl,
-- bricht das Skript mit einer Exception ab (Transaktion wird zurückgerollt).

do $$
declare
  user_a uuid := gen_random_uuid();
  user_b uuid := gen_random_uuid();
  ws_a uuid;
  ws_b uuid;
  doc_id uuid;
  cnt integer;
  denied boolean := false;
begin
  -- 1. Zwei Testnutzer anlegen – der Signup-Trigger muss Profil,
  --    persönlichen Workspace und Membership erzeugen
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  )
  values
    (user_a, '00000000-0000-0000-0000-000000000000', 'authenticated',
     'authenticated', 'rls-test-a@example.invalid', '', now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"display_name":"RLS Test A"}'::jsonb, now(), now()),
    (user_b, '00000000-0000-0000-0000-000000000000', 'authenticated',
     'authenticated', 'rls-test-b@example.invalid', '', now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"display_name":"RLS Test B"}'::jsonb, now(), now());

  select workspace_id into strict ws_a
  from public.workspace_members where user_id = user_a;
  select workspace_id into strict ws_b
  from public.workspace_members where user_id = user_b;

  -- 2. Als Nutzer A: Dokument anlegen (prüft die Insert-Policy)
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', user_a, 'role', 'authenticated')::text,
    true
  );
  execute 'set local role authenticated';

  insert into public.documents
    (workspace_id, uploaded_by, title, original_filename, mime_type, status)
  values
    (ws_a, user_a, 'RLS-Testdokument', 'test.pdf', 'application/pdf', 'uploaded')
  returning id into doc_id;

  select count(*) into cnt from public.documents;
  if cnt <> 1 then
    raise exception 'FEHLER: A sollte genau 1 Dokument sehen, sieht %', cnt;
  end if;

  -- 3. Als Nutzer B: darf nichts von A sehen
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', user_b, 'role', 'authenticated')::text,
    true
  );

  select count(*) into cnt from public.documents;
  if cnt <> 0 then
    raise exception 'FEHLER: B sollte 0 Dokumente sehen, sieht %', cnt;
  end if;

  select count(*) into cnt from public.workspaces;
  if cnt <> 1 then
    raise exception 'FEHLER: B sollte nur den eigenen Workspace sehen, sieht %', cnt;
  end if;

  select count(*) into cnt from public.users;
  if cnt <> 1 then
    raise exception 'FEHLER: B sollte nur das eigene Profil sehen, sieht %', cnt;
  end if;

  select count(*) into cnt from public.audit_events;
  if cnt <> 1 then
    raise exception 'FEHLER: B sollte nur eigene Audit-Events sehen (user_registered), sieht %', cnt;
  end if;

  -- 4. Als Nutzer B: Schreiben in fremden Workspace muss blockiert sein
  begin
    insert into public.documents (workspace_id, uploaded_by, title, status)
    values (ws_a, user_b, 'Einbruchsversuch', 'uploaded');
    raise exception 'RLS-LUECKE: B konnte in Workspace A schreiben';
  exception
    when insufficient_privilege then denied := true;
  end;
  if not denied then
    raise exception 'FEHLER: Insert von B in Workspace A wurde nicht blockiert';
  end if;

  -- 5. Als Nutzer A: Soft Delete + Audit-Kette prüfen
  --    (user_registered, document_uploaded, document_deleted)
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', user_a, 'role', 'authenticated')::text,
    true
  );
  update public.documents set deleted_at = now() where id = doc_id;

  select count(*) into cnt from public.audit_events;
  if cnt <> 3 then
    raise exception 'FEHLER: erwartet 3 Audit-Events für A, gefunden %', cnt;
  end if;

  execute 'reset role';

  -- 6. Aufräumen. Erst die Workspaces (die Kaskade erzeugt dabei neue
  --    Audit-Events für gelöschte Dokumente), dann alle Test-Audit-Events.
  delete from public.workspaces where id in (ws_a, ws_b);
  delete from public.audit_events
  where user_id in (user_a, user_b)
     or entity_id in (doc_id, user_a, user_b);
  delete from auth.users where id in (user_a, user_b);

  raise notice 'RLS-TEST BESTANDEN';
end $$;

select 'RLS_TEST_PASSED' as result;
