import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { de } from "@/lib/i18n/de";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: de.settings.title };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, email, explanation_mode, preferred_language")
    .eq("id", user!.id)
    .single();

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
        <h2 className="mb-2 text-[15px] font-semibold tracking-tight">
          {de.settings.privacyTitle}
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          {de.settings.privacyText}
        </p>
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
