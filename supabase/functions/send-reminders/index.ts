// E-Mail-Versand für Erinnerungen via Resend (Spez 12.9, E-Mail-Kanal).
// Wird von private.invoke_send_reminders() (pg_cron) angestossen, sobald
// Benachrichtigungen mit email_pending existieren. Holt die Zeilen atomar
// über claim_reminder_emails (nur Service Role) und verschickt sie einzeln.
// Ohne konfigurierten RESEND_API_KEY beendet sich der Worker, ohne etwas
// zu übernehmen – die E-Mails bleiben pending, bis der Key gesetzt ist.

import { createClient } from "npm:@supabase/supabase-js@2";

function log(event: string, fields: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ event, ...fields }));
}
function logError(event: string, fields: Record<string, unknown> = {}) {
  console.error(JSON.stringify({ event, ...fields }));
}

const FROM_ADDRESS = "Admin Copilot <erinnerung@admin-pilot.trendingmedia.ch>";
const APP_URL = "https://admin-copilot-nine.vercel.app";
const BATCH_SIZE = 20;

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function emailHtml(title: string, message: string, taskUrl: string): string {
  return `<!doctype html>
<html lang="de">
<body style="margin:0; padding:24px; background:#f4f6f8; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#17222b;">
  <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden;">
    <div style="background:#0a3a4a; color:#ffffff; padding:20px 24px; font-size:15px; font-weight:700;">
      Admin Copilot
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 6px; font-size:17px; font-weight:600; color:#17222b;">${escapeHtml(title)}</p>
      <p style="margin:0 0 20px; font-size:14px; line-height:1.6; color:#5c6b78;">${escapeHtml(message)}</p>
      <a href="${taskUrl}" style="display:inline-block; background:#0e7490; color:#ffffff; text-decoration:none; border-radius:999px; padding:11px 22px; font-size:14px; font-weight:600;">
        Aufgabe öffnen
      </a>
    </div>
    <div style="padding:16px 24px; border-top:1px solid #eef1f2; font-size:12px; color:#8a969e;">
      Du erhältst diese E-Mail, weil in deinem Admin Copilot eine Frist ansteht.
      E-Mail-Erinnerungen kannst du im Profil jederzeit abschalten.
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed" });
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    log("send-reminders: skipped, no RESEND_API_KEY configured");
    return jsonResponse(200, { skipped: "no_api_key" });
  }

  const service = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const { data: rows, error: claimError } = await service.rpc(
    "claim_reminder_emails",
    { p_limit: BATCH_SIZE }
  );
  if (claimError) {
    logError("send-reminders: claim failed", { message: claimError.message });
    return jsonResponse(500, { error: "claim_failed" });
  }
  if (!rows || rows.length === 0) {
    return jsonResponse(200, { sent: 0 });
  }

  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    const taskUrl = row.task_id ? `${APP_URL}/tasks/${row.task_id}` : APP_URL;
    const text = `${row.message}\n\nAufgabe öffnen: ${taskUrl}\n\nE-Mail-Erinnerungen kannst du im Profil abschalten: ${APP_URL}/settings`;

    let errorMessage: string | null = null;
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [row.email],
          subject: row.title,
          html: emailHtml(row.title, row.message ?? "", taskUrl),
          text,
        }),
      });
      if (!response.ok) {
        const body = await response.text();
        errorMessage = `resend_${response.status}: ${body.slice(0, 200)}`;
      }
    } catch (err) {
      errorMessage =
        err instanceof Error ? err.message.slice(0, 200) : String(err);
    }

    if (errorMessage === null) {
      sent += 1;
      await service
        .from("notifications")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", row.notification_id);
    } else {
      failed += 1;
      logError("send-reminders: send failed", {
        notification_id: row.notification_id,
        message: errorMessage,
      });
      await service
        .from("notifications")
        .update({ email_error: errorMessage })
        .eq("id", row.notification_id);
    }
  }

  log("send-reminders: done", { sent, failed });
  return jsonResponse(200, { sent, failed });
});
