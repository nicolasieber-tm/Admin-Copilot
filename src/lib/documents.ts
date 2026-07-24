import { de } from "@/lib/i18n/de";
import type { Database } from "@/lib/supabase/database.types";

export type DocumentStatus = Database["public"]["Enums"]["document_status"];

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
export const ACCEPTED_PDF_TYPE = "application/pdf";
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // muss zum Bucket-Limit passen

export function statusLabel(status: DocumentStatus): string {
  return de.documents.status[status] ?? status;
}

export function statusBadgeClass(status: DocumentStatus): string {
  switch (status) {
    case "uploaded":
    case "processing":
      return "bg-accent-soft text-accent-strong";
    case "ready_for_review":
      return "bg-amber-100 text-amber-800";
    case "confirmed":
    case "action_open":
      return "bg-blue-100 text-blue-800";
    case "completed":
    case "archived":
      return "bg-emerald-100 text-emerald-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-black/5 text-muted";
  }
}

export function fileExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "application/pdf":
      return "pdf";
    default:
      return "bin";
  }
}

export function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "–";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Ersetzt ISO-Daten (YYYY-MM-DD) in Fliesstext durch TT.MM.JJJJ */
export function formatIsoDatesInText(text: string): string {
  return text.replace(
    /\b(\d{4})-(\d{2})-(\d{2})\b/g,
    (_, year, month, day) => `${day}.${month}.${year}`
  );
}

/** ISO-Datum (YYYY-MM-DD) → Anzeige als TT.MM.JJJJ; alles andere unverändert */
export function formatDateValue(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Zurich",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Zurich",
  }).format(new Date(iso));
}

/** SHA-256 über den Inhalt aller Dateien (Duplikaterkennung, Spez 21.7) */
export async function hashFiles(files: File[]): Promise<string> {
  const buffers = await Promise.all(files.map((f) => f.arrayBuffer()));
  const total = buffers.reduce((sum, b) => sum + b.byteLength, 0);
  const combined = new Uint8Array(total);
  let offset = 0;
  for (const buffer of buffers) {
    combined.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  const digest = await crypto.subtle.digest("SHA-256", combined);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
