import Image from "next/image";
import { de } from "@/lib/i18n/de";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Image src="/icon.svg" alt="" width={56} height={56} priority />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {de.app.name}
          </h1>
          <p className="mt-1 max-w-xs text-sm text-muted">{de.app.tagline}</p>
        </div>
      </div>
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 card-elevated">
        {children}
      </div>
    </div>
  );
}
