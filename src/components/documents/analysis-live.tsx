"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Hält die Detailansicht aktuell: Realtime-Update auf dem Dokument
// (processing → ready_for_review/failed) plus kurzes Polling während der
// Analyse, um die Pipeline-Zwischenschritte anzuzeigen.
export function AnalysisLive({
  documentId,
  isProcessing,
}: {
  documentId: string;
  isProcessing: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`document-${documentId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "documents",
          filter: `id=eq.${documentId}`,
        },
        () => router.refresh()
      )
      .subscribe();

    const interval = isProcessing
      ? window.setInterval(() => router.refresh(), 4000)
      : undefined;

    return () => {
      supabase.removeChannel(channel);
      if (interval) window.clearInterval(interval);
    };
  }, [documentId, isProcessing, router]);

  return null;
}
