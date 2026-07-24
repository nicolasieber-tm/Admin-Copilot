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
  inputClass,
  labelClass,
} from "@/components/common/form";

export function RegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function signUp(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          display_name: displayName,
          preferred_language: "de",
        },
      },
    });
    if (error) {
      setError(de.auth.register.error);
      setPending(false);
      return;
    }
    if (data.session) {
      // E-Mail-Bestätigung deaktiviert: direkt eingeloggt
      router.push("/dashboard");
      router.refresh();
      return;
    }
    setNotice(de.auth.register.confirmSent);
    setPending(false);
  }

  return (
    <form onSubmit={signUp} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{de.auth.register.title}</h2>
      <FormError message={error} />
      <FormNotice message={notice} />
      <div>
        <label htmlFor="displayName" className={labelClass}>
          {de.auth.displayName}
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="given-name"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={inputClass}
        />
      </div>
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
          autoComplete="new-password"
          required
          minLength={8}
          placeholder={de.auth.passwordMin}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>
      <p className="text-xs leading-relaxed text-muted">
        {de.auth.register.privacy}
      </p>
      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {de.auth.register.submit}
      </button>
      <p className="text-center text-sm text-muted">
        {de.auth.register.hasAccount}{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          {de.auth.register.login}
        </Link>
      </p>
    </form>
  );
}
