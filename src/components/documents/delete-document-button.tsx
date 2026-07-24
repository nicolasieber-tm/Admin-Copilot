"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { de } from "@/lib/i18n/de";

export function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function softDelete() {
    // Soft Delete (ARCHITECTURE.md §4) – endgültige Löschung inkl. Storage
    // übernimmt später die delete-account-Funktion
    if (!window.confirm(de.documents.detail.deleteConfirm)) return;
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("documents")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", documentId);
    if (error) {
      setPending(false);
      window.alert(de.common.error);
      return;
    }
    router.push("/documents");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={softDelete}
      disabled={pending}
      className="rounded-xl px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
    >
      {de.documents.detail.delete}
    </button>
  );
}
