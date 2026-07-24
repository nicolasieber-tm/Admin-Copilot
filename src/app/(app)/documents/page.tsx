import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { de } from "@/lib/i18n/de";
import { formatDate, statusBadgeClass, statusLabel } from "@/lib/documents";

export const metadata: Metadata = { title: de.documents.title };

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, original_filename, status, page_count, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {de.documents.title}
        </h1>
        <Link
          href="/documents/upload"
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-strong"
        >
          {de.documents.upload}
        </Link>
      </header>

      {documents && documents.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {documents.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-black/5 transition hover:ring-accent/30"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {doc.title ?? doc.original_filename ?? de.documents.detail.title}
                  </span>
                  <span className="block text-xs text-muted">
                    {de.documents.pages(doc.page_count)} ·{" "}
                    {formatDate(doc.created_at)}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(doc.status)}`}
                >
                  {statusLabel(doc.status)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl bg-surface p-6 text-center shadow-sm ring-1 ring-black/5">
          <p className="text-sm leading-relaxed text-muted">
            {de.documents.empty}
          </p>
        </div>
      )}
    </div>
  );
}
