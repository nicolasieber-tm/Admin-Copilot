import type { Metadata } from "next";
import { de } from "@/lib/i18n/de";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: de.auth.login.title };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <LoginForm authError={error === "auth" ? de.auth.login.authError : null} />;
}
