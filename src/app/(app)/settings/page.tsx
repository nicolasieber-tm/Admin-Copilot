import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { de } from "@/lib/i18n/de";
import { ProfileForm } from "./profile-form";
import { DeleteAccountButton } from "./delete-account-button";
import packageJson from "../../../../package.json";

export const metadata: Metadata = { title: de.settings.title };

// Muss zu den Limits in der Datenbank/Edge Function passen:
// private.analysis_quota_exceeded (20/Workspace) und ask-document (30/Nutzer)
const ANALYSES_LIMIT = 20;
const QUESTIONS_LIMIT = 30;

function UsageRow({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const percent = Math.min(Math.round((used / limit) * 100), 100);
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span>{label}</span>
        <span className="text-xs font-semibold tabular-nums text-muted">
          {de.settings.usageOf(used, limit)}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/[0.06]">
        <span
          className={`block h-full rounded-full ${
            percent >= 100 ? "bg-red-400" : "bg-accent"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gleiche Fenster wie die Limit-Prüfungen: jeweils die letzten 24 Stunden
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ data: profile }, { count: analysesUsed }, { count: questionsUsed }] =
    await Promise.all([
      supabase
        .from("users")
        .select("display_name, email, explanation_mode, preferred_language")
        .eq("id", user!.id)
        .single(),
      supabase
        .from("document_analyses")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
      supabase
        .from("document_questions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .gte("created_at", since),
    ]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="rise text-2xl font-semibold tracking-tight">
        {de.settings.title}
      </h1>

      <section className="rise-2 rounded-2xl bg-surface p-5 card-elevated">
        <h2 className="mb-4 text-[15px] font-semibold tracking-tight">
          {de.settings.account}
        </h2>
        <ProfileForm
          userId={user!.id}
          initialDisplayName={profile?.display_name ?? ""}
          initialExplanationMode={profile?.explanation_mode ?? "normal"}
          initialLanguage={profile?.preferred_language ?? "de"}
          email={profile?.email ?? user!.email ?? ""}
        />
      </section>

      <section className="rise-3 rounded-2xl bg-surface p-5 card-elevated">
        <h2 className="mb-1 text-[15px] font-semibold tracking-tight">
          {de.settings.security}
        </h2>
        <Link
          href="/update-password"
          className="pressable -mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 hover:bg-black/[0.03]"
        >
          <span>
            <span className="block text-sm font-medium">
              {de.settings.changePassword}
            </span>
            <span className="block text-xs text-muted">
              {de.settings.changePasswordHint}
            </span>
          </span>
          <span aria-hidden className="shrink-0 text-muted">
            →
          </span>
        </Link>
      </section>

      <section className="rise-3 rounded-2xl bg-surface p-5 card-elevated">
        <h2 className="mb-3 text-[15px] font-semibold tracking-tight">
          {de.settings.usage}
        </h2>
        <div className="flex flex-col gap-4">
          <UsageRow
            label={de.settings.usageAnalyses}
            used={analysesUsed ?? 0}
            limit={ANALYSES_LIMIT}
          />
          <UsageRow
            label={de.settings.usageQuestions}
            used={questionsUsed ?? 0}
            limit={QUESTIONS_LIMIT}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          {de.settings.usageHint}
        </p>
      </section>

      <section className="rise-4 rounded-2xl bg-surface p-5 card-elevated">
        <h2 className="mb-2 text-[15px] font-semibold tracking-tight">
          {de.settings.privacyTitle}
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          {de.settings.privacyText}
        </p>
      </section>

      <section className="rise-4 rounded-2xl bg-surface p-5 card-elevated">
        <h2 className="mb-2 text-[15px] font-semibold tracking-tight">
          {de.settings.about}
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          {de.settings.aboutText}
        </p>
        <p className="mt-2 text-xs text-muted">
          {de.app.name} · {de.settings.aboutVersion(packageJson.version)}
        </p>
      </section>

      <section className="rise-4 rounded-2xl bg-red-50 p-5 ring-1 ring-inset ring-red-200">
        <h2 className="mb-1 text-[15px] font-semibold tracking-tight text-red-900">
          {de.settings.deleteTitle}
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-red-800/80">
          {de.settings.deleteHint}
        </p>
        <DeleteAccountButton />
      </section>

      <form action="/auth/signout" method="post" className="rise-4">
        <button
          type="submit"
          className="pressable w-full rounded-xl bg-surface px-4 py-3 text-sm font-medium text-red-700 card-elevated hover:bg-red-50"
        >
          {de.auth.logout}
        </button>
      </form>
    </div>
  );
}
