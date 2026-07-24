import type { Metadata } from "next";
import { de } from "@/lib/i18n/de";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: de.auth.forgot.title };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
