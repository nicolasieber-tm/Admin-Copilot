-- Security-Hardening gemäss Supabase Advisors:
--
-- 1. private.set_updated_at hatte einen veränderbaren search_path.
alter function private.set_updated_at() set search_path = '';

-- 2. public.rls_auto_enable (Event-Trigger-Helper aus dem Projekt-Provisioning,
--    aktiviert RLS automatisch bei CREATE TABLE) war für anon/authenticated
--    via PostgREST-RPC aufrufbar. Als Event-Trigger braucht niemand EXECUTE.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
