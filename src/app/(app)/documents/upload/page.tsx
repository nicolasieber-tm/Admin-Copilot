import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { de } from "@/lib/i18n/de";
import { UploadForm } from "@/components/documents/upload-form";

export const metadata: Metadata = { title: de.upload.title };

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Persönlicher Workspace des Nutzers (MVP: genau einer)
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user!.id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!membership) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight">
        {de.upload.title}
      </h1>
      <UploadForm workspaceId={membership.workspace_id} userId={user!.id} />
    </div>
  );
}
