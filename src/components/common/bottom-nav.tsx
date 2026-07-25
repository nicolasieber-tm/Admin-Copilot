"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { de } from "@/lib/i18n/de";

// Cockpit-Nav (Design-Entscheid D2): vier Ziele plus Scan-Button in der Mitte.
// Das Profil ist über den Avatar im Kopf des Start-Tabs erreichbar.
const leftItems = [
  { href: "/dashboard", label: de.nav.home, icon: HomeIcon },
  { href: "/documents", label: de.nav.documents, icon: DocumentIcon },
];

const rightItems = [
  { href: "/tasks", label: de.nav.tasks, icon: CheckIcon },
  { href: "/budget", label: de.nav.budget, icon: WalletIcon },
];

type NavItem = {
  href: string;
  label: string;
  icon: (props: IconProps) => React.JSX.Element;
};

export function BottomNav() {
  const pathname = usePathname();

  const renderItem = ({ href, label, icon: Icon }: NavItem) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[11px] font-medium transition ${
          active ? "text-accent-deep" : "text-muted hover:text-foreground"
        }`}
      >
        <Icon className="h-6 w-6" />
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {leftItems.map(renderItem)}
        <div className="flex w-[72px] shrink-0 items-start justify-center">
          <Link
            href="/documents/upload"
            aria-label={de.nav.scan}
            title={de.nav.scan}
            className="scan-gradient -mt-6 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-cyan-950/40 ring-4 ring-background transition hover:brightness-110 active:scale-95"
          >
            <ScanIcon className="h-6 w-6" />
          </Link>
        </div>
        {rightItems.map(renderItem)}
      </div>
    </nav>
  );
}

type IconProps = { className?: string };

function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 10.5 9-7 9 7V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function DocumentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path strokeLinecap="round" d="M14 3v5h5M9.5 13h5M9.5 16.5h5" />
    </svg>
  );
}

function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.5 12.5 2.5 2.5 4.5-5.5" />
    </svg>
  );
}

function WalletIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M16 14.5h2" strokeLinecap="round" />
    </svg>
  );
}

function ScanIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path
        strokeLinecap="round"
        d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M7 12h10"
      />
    </svg>
  );
}
