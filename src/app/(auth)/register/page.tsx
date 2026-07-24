import type { Metadata } from "next";
import { de } from "@/lib/i18n/de";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: de.auth.register.title };

export default function RegisterPage() {
  return <RegisterForm />;
}
