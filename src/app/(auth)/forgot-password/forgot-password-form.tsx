"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { de } from "@/lib/i18n/de";
import {
  FormError,
  FormNotice,
  buttonPrimaryClass,
  inputClass,
  labelClass,
} from "@/components/common/form";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function sendResetLink(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });
    setPending(false);
    if (error) {
      setError(de.common.error);
      return;
    }
    setNotice(de.auth.forgot.sent);
  }

  return (
    <form onSubmit={sendResetLink} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{de.auth.forgot.title}</h2>
      <p className="text-sm text-muted">{de.auth.forgot.hint}</p>
      <FormError message={error} />
      <FormNotice message={notice} />
      <div>
        <label htmlFor="email" className={labelClass}>
          {de.auth.email}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {de.auth.forgot.submit}
      </button>
      <p className="text-center text-sm">
        <Link href="/login" className="font-medium text-accent hover:underline">
          {de.auth.forgot.back}
        </Link>
      </p>
    </form>
  );
}
