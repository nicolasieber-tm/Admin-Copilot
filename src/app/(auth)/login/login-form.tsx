"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { de } from "@/lib/i18n/de";
import {
  FormError,
  FormNotice,
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
  labelClass,
} from "@/components/common/form";

export function LoginForm({ authError }: { authError: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(authError);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function signInWithPassword(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(de.auth.login.error);
      setPending(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function sendMagicLink() {
    if (!email) {
      setError(de.auth.login.error);
      return;
    }
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setPending(false);
    if (error) {
      setError(de.common.error);
      return;
    }
    setNotice(de.auth.login.magicLinkSent);
  }

  return (
    <form onSubmit={signInWithPassword} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{de.auth.login.title}</h2>
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
      <div>
        <label htmlFor="password" className={labelClass}>
          {de.auth.password}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <Link
          href="/forgot-password"
          className="mt-2 inline-block text-sm text-accent hover:underline"
        >
          {de.auth.login.forgotPassword}
        </Link>
      </div>
      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {de.auth.login.submit}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={sendMagicLink}
        className={buttonSecondaryClass}
      >
        {de.auth.login.magicLink}
      </button>
      <p className="text-center text-sm text-muted">
        {de.auth.login.noAccount}{" "}
        <Link href="/register" className="font-medium text-accent hover:underline">
          {de.auth.login.register}
        </Link>
      </p>
    </form>
  );
}
