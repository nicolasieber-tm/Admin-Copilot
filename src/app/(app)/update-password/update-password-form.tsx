"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { de } from "@/lib/i18n/de";
import {
  FormError,
  buttonPrimaryClass,
  inputClass,
  labelClass,
} from "@/components/common/form";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function updatePassword(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(de.auth.updatePassword.error);
      setPending(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={updatePassword} className="flex flex-col gap-4">
      <FormError message={error} />
      <div>
        <label htmlFor="password" className={labelClass}>
          {de.auth.passwordNew}
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
      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {de.auth.updatePassword.submit}
      </button>
    </form>
  );
}
