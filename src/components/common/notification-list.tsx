"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { de } from "@/lib/i18n/de";

export type NotificationItem = {
  id: string;
  title: string;
  message: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
};

// Ungelesene In-App-Benachrichtigungen (Erinnerungen, Spez 12.9).
// Wegklicken setzt read_at – die Zeile verschwindet beim nächsten Refresh.
export function NotificationList({ items }: { items: NotificationItem[] }) {
  const router = useRouter();

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    router.refresh();
  }

  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl bg-accent-soft p-5 ring-1 ring-accent/20">
      <h2 className="mb-2 text-[15px] font-semibold tracking-tight text-accent-strong">
        {de.dashboard.notifications}
      </h2>
      <ul className="flex flex-col divide-y divide-accent/10">
        {items.map((item) => {
          const href =
            item.related_entity_type === "task" && item.related_entity_id
              ? `/tasks/${item.related_entity_id}`
              : item.related_entity_type === "document" && item.related_entity_id
                ? `/documents/${item.related_entity_id}`
                : null;
          const content = (
            <>
              <span className="block text-sm font-medium">{item.title}</span>
              {item.message && (
                <span className="block text-xs text-muted">{item.message}</span>
              )}
            </>
          );
          return (
            <li key={item.id} className="flex items-center gap-3 py-2.5">
              {href ? (
                <Link href={href} className="min-w-0 flex-1 transition hover:opacity-80">
                  {content}
                </Link>
              ) : (
                <span className="min-w-0 flex-1">{content}</span>
              )}
              <button
                type="button"
                onClick={() => markRead(item.id)}
                aria-label={de.dashboard.markRead}
                title={de.dashboard.markRead}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-black/5"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
