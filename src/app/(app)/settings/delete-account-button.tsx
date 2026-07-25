"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { de } from "@/lib/i18n/de";

// Konto endgültig löschen: Bestätigung → Edge Function delete-account
// (entfernt Workspace, Storage-Dateien und Auth-Konto) → zurück zum Login.
export function DeleteAccountButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function handleDelete() {
    if (!window.confirm(de.settings.deleteConfirm)) return;
    setPending(true);
    setError(false);
    const supabase = createClient();
    const { error: fnError } = await supabase.functions.invoke(
      "delete-account",
      { body: {} }
    );
    if (fnError) {
      setPending(false);
      setError(true);
      return;
    }
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {de.settings.deleteError}
        </p>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="pressable w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? de.settings.deletePending : de.settings.deleteButton}
      </button>
    </div>
  );
}
