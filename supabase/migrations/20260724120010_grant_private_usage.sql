-- Die RLS-Policies werden mit den Rechten der abfragenden Rolle ausgewertet.
-- Damit `authenticated` die Helper-Funktion private.user_workspace_ids()
-- aufrufen kann, braucht die Rolle USAGE auf dem Schema (nicht aber auf den
-- übrigen Objekten darin – Funktions-Grants bleiben explizit).

grant usage on schema private to authenticated;
