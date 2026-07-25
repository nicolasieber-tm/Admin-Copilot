import type { Metadata } from "next";
import { de } from "@/lib/i18n/de";
import { UpdatePasswordForm } from "./update-password-form";

export const metadata: Metadata = { title: de.auth.updatePassword.title };

export default function UpdatePasswordPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight">
        {de.auth.updatePassword.title}
      </h1>
      <div className="rounded-2xl bg-surface p-5 card-elevated">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
