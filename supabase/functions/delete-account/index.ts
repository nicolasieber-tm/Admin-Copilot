// Konto löschen (Datenschutz, nDSG): entfernt Konto und sämtliche Daten
// endgültig. Ablauf: eigene Workspaces (nur wenn der Nutzer einziges Mitglied
// ist) samt Storage-Dateien löschen → public.users-Zeile → Auth-Nutzer.
// Die Identität kommt aus dem JWT; gelöscht wird ausschliesslich das eigene Konto.

import { createClient } from "npm:@supabase/supabase-js@2";

// Strukturierte Logs ohne Inhalte (Spez 20.4) – bewusst lokal statt shared,
// damit die Function ohne Zusatzdateien deploybar bleibt
function log(event: string, fields: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ event, ...fields }));
}
function logError(event: string, fields: Record<string, unknown> = {}) {
  console.error(JSON.stringify({ event, ...fields }));
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

const STORAGE_BUCKET = "documents";
const REMOVE_CHUNK = 100;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed" });
  }

  // Wer löscht, muss es selbst sein: Nutzer aus dem JWT
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      auth: { persistSession: false },
      global: {
        headers: { Authorization: req.headers.get("Authorization") ?? "" },
      },
    }
  );
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return jsonResponse(401, { error: "unauthorized" });
  }

  const service = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    const { data: memberships, error: memberError } = await service
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id);
    if (memberError) throw memberError;

    for (const { workspace_id } of memberships ?? []) {
      const { count: others } = await service
        .from("workspace_members")
        .select("user_id", { count: "exact", head: true })
        .eq("workspace_id", workspace_id)
        .neq("user_id", user.id);

      if ((others ?? 0) > 0) {
        // Geteilter Workspace: nur die eigene Mitgliedschaft entfernen,
        // die Daten gehören auch den anderen Mitgliedern.
        await service
          .from("workspace_members")
          .delete()
          .eq("workspace_id", workspace_id)
          .eq("user_id", user.id);
        continue;
      }

      // Storage-Dateien zuerst: Originale + Seitenbilder (inkl. soft-deleted)
      const [{ data: docs }, { data: pages }] = await Promise.all([
        service
          .from("documents")
          .select("storage_path")
          .eq("workspace_id", workspace_id),
        service
          .from("document_pages")
          .select("image_storage_path")
          .eq("workspace_id", workspace_id),
      ]);
      const paths = [
        ...(docs ?? []).map((d) => d.storage_path),
        ...(pages ?? []).map((p) => p.image_storage_path),
      ].filter((p): p is string => typeof p === "string" && p.length > 0);

      for (let i = 0; i < paths.length; i += REMOVE_CHUNK) {
        const { error: removeError } = await service.storage
          .from(STORAGE_BUCKET)
          .remove(paths.slice(i, i + REMOVE_CHUNK));
        if (removeError) {
          // Nicht abbrechen: DB-Löschung ist wichtiger als verwaiste Dateien
          logError("delete-account: storage remove failed", {
            message: removeError.message,
          });
        }
      }

      const { error: wsError } = await service
        .from("workspaces")
        .delete()
        .eq("id", workspace_id);
      if (wsError) throw wsError;
    }

    const { error: userRowError } = await service
      .from("users")
      .delete()
      .eq("id", user.id);
    if (userRowError) throw userRowError;

    const { error: authError } = await service.auth.admin.deleteUser(user.id);
    if (authError) throw authError;

    log("delete-account: account deleted", { user_id: user.id });
    return jsonResponse(200, { ok: true });
  } catch (err) {
    logError("delete-account failed", {
      message: err instanceof Error ? err.message.slice(0, 300) : String(err),
    });
    return jsonResponse(500, { error: "delete_failed" });
  }
});
