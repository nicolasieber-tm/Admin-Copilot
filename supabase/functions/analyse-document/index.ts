// Worker für die pgmq-Queue `analyse_document`.
// Wird per pg_net direkt nach dem Upload und alle 30 s vom pg_cron-Sweeper
// aufgerufen. Verarbeitet pro Aufruf bis zu MAX_MESSAGES Nachrichten.
//
// Wiederholungslogik (Spez 21.6): Transiente Fehler bleiben in der Queue
// (Visibility-Timeout läuft ab → erneuter Versuch), nach MAX_ATTEMPTS oder
// bei permanenten Fehlern wird archiviert. Der Nutzer kann über
// retry_document_analysis() jederzeit einen neuen Versuch starten.

import { ProviderError } from "../_shared/ai/provider.ts";
import { OpenAiProvider } from "../_shared/ai/providers/openai.ts";
import { createServiceClient } from "../_shared/db.ts";
import { log, logError } from "../_shared/log.ts";
import { processDocument } from "./pipeline.ts";

const MAX_MESSAGES = 5;
const MAX_ATTEMPTS = 3;

type QueueMessage = {
  msg_id: number;
  read_ct: number;
  message: { document_id?: string };
};

Deno.serve(async () => {
  const supabase = createServiceClient();
  let processed = 0;
  let failed = 0;

  for (let i = 0; i < MAX_MESSAGES; i++) {
    const { data, error } = await supabase.rpc("queue_read_analyse", {
      batch: 1,
      vt: 300,
    });
    if (error) {
      logError("queue_read_failed", { error: error.message });
      break;
    }
    const messages = (data ?? []) as QueueMessage[];
    if (messages.length === 0) break;

    const msg = messages[0];
    const documentId = msg.message?.document_id;
    if (!documentId) {
      await supabase.rpc("queue_archive_analyse", { p_msg_id: msg.msg_id });
      continue;
    }

    try {
      const provider = new OpenAiProvider();
      await processDocument(supabase, provider, documentId);
      await supabase.rpc("queue_archive_analyse", { p_msg_id: msg.msg_id });
      processed++;
    } catch (err) {
      failed++;
      const transient = err instanceof ProviderError ? err.transient : true;
      const code = err instanceof ProviderError ? err.code : "internal_error";
      logError("analysis_failed", {
        document_id: documentId,
        msg_id: msg.msg_id,
        attempt: msg.read_ct,
        error_code: code,
        transient,
      });
      if (!transient || msg.read_ct >= MAX_ATTEMPTS) {
        await supabase.rpc("queue_archive_analyse", { p_msg_id: msg.msg_id });
      }
      // sonst: Nachricht bleibt unsichtbar bis das Visibility-Timeout
      // abläuft und wird danach automatisch erneut gelesen
    }
  }

  log("worker_run", { processed, failed });
  return new Response(JSON.stringify({ processed, failed }), {
    headers: { "Content-Type": "application/json" },
  });
});
