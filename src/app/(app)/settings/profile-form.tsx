"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { de } from "@/lib/i18n/de";
import type { Database } from "@/lib/supabase/database.types";
import {
  FormError,
  FormNotice,
  buttonPrimaryClass,
  inputClass,
  labelClass,
} from "@/components/common/form";

type ExplanationMode = Database["public"]["Enums"]["explanation_mode"];

export function ProfileForm({
  userId,
  initialDisplayName,
  initialExplanationMode,
  initialLanguage,
  email,
}: {
  userId: string;
  initialDisplayName: string;
  initialExplanationMode: ExplanationMode;
  initialLanguage: string;
  email: string;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [explanationMode, setExplanationMode] = useState<ExplanationMode>(
    initialExplanationMode
  );
  const [language, setLanguage] = useState(initialLanguage);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({
        display_name: displayName.trim() || null,
        explanation_mode: explanationMode,
        preferred_language: language,
      })
      .eq("id", userId);
    setPending(false);
    if (error) {
      setError(de.settings.saveError);
      return;
    }
    setNotice(de.settings.saved);
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <FormError message={error} />
      <FormNotice message={notice} />
      <div>
        <label className={labelClass}>{de.settings.email}</label>
        <input type="email" value={email} disabled className={`${inputClass} opacity-60`} />
      </div>
      <div>
        <label htmlFor="displayName" className={labelClass}>
          {de.settings.displayName}
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="language" className={labelClass}>
          {de.settings.language}
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={inputClass}
        >
          {Object.entries(de.settings.languages).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {de.settings.languageHint}
        </p>
      </div>
      <div>
        <label htmlFor="explanationMode" className={labelClass}>
          {de.settings.explanationMode}
        </label>
        <select
          id="explanationMode"
          value={explanationMode}
          onChange={(e) => setExplanationMode(e.target.value as ExplanationMode)}
          className={inputClass}
        >
          <option value="normal">{de.settings.explanationModes.normal}</option>
          <option value="simple">{de.settings.explanationModes.simple}</option>
        </select>
      </div>
      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {de.settings.save}
      </button>
    </form>
  );
}
