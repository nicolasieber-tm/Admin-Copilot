"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { de } from "@/lib/i18n/de";
import { buttonPrimaryClass } from "@/components/common/form";

export function RetryAnalysisButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function retry() {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("retry_document_analysis", {
      p_document_id: documentId,
    });
    if (error) {
      setPending(false);
      window.alert(
        error.message.includes("daily_limit_reached")
          ? de.documents.analysis.limitReached
          : de.common.error
      );
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={retry}
      disabled={pending}
      className={buttonPrimaryClass}
    >
      {pending ? de.documents.analysis.retryPending : de.documents.analysis.retry}
    </button>
  );
}
