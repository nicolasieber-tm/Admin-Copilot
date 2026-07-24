// Deterministische Validierung (Spez 14.4 Schritt 6) – kein Modellaufruf.
// Prüft Formate und Plausibilität, gleicht Modell-Extraktion mit
// Swiss-QR-Daten ab und sammelt Unsicherheiten für Erklärung und UI.

import type { Extraction } from "./ai/schemas.ts";
import type { SwissQrData } from "./qr.ts";

export type ValidationResult = {
  checks: { name: string; ok: boolean; note: string | null }[];
  uncertainties: string[];
  qr_applied: boolean;
};

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10);
}

export function isValidIban(value: string): boolean {
  const iban = value.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const digits = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let remainder = 0;
  for (const chunk of digits.match(/.{1,7}/g) ?? []) {
    remainder = Number(String(remainder) + chunk) % 97;
  }
  return remainder === 1;
}

/** QR-Referenz (27 Stellen, rekursiver Modulo-10-Check) */
export function isValidQrReference(value: string): boolean {
  const ref = value.replace(/\s+/g, "");
  if (!/^\d{27}$/.test(ref)) return false;
  const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
  let carry = 0;
  for (const char of ref.slice(0, 26)) {
    carry = table[(carry + Number(char)) % 10];
  }
  return (10 - carry) % 10 === Number(ref[26]);
}

export function validate(
  extraction: Extraction,
  qr: SwissQrData | null
): ValidationResult {
  const checks: ValidationResult["checks"] = [];
  const uncertainties: string[] = [...extraction.uncertainties];
  const push = (name: string, ok: boolean, note: string | null = null) => {
    checks.push({ name, ok, note });
    if (!ok && note) uncertainties.push(note);
  };

  const docDate = extraction.document_date.value;
  const dueDate = extraction.due_date.value;

  if (docDate) {
    push(
      "document_date_format",
      isValidIsoDate(docDate),
      isValidIsoDate(docDate) ? null : "Das Dokumentdatum konnte nicht eindeutig gelesen werden. Bitte prüfe es auf dem Original."
    );
  }
  if (dueDate) {
    push(
      "due_date_format",
      isValidIsoDate(dueDate),
      isValidIsoDate(dueDate) ? null : "Die Frist konnte nicht eindeutig gelesen werden. Bitte prüfe das Datum auf dem Original."
    );
  }
  if (docDate && dueDate && isValidIsoDate(docDate) && isValidIsoDate(dueDate)) {
    push(
      "due_after_document_date",
      dueDate >= docDate,
      dueDate >= docDate
        ? null
        : "Die erkannte Frist liegt vor dem Dokumentdatum. Bitte prüfe beide Daten auf dem Original."
    );
  }

  const amount = extraction.amount.value;
  if (amount != null) {
    push(
      "amount_plausible",
      amount > 0 && amount < 100_000_000,
      amount > 0 && amount < 100_000_000
        ? null
        : "Der erkannte Betrag wirkt nicht plausibel. Bitte prüfe ihn auf dem Original."
    );
  }
  if (extraction.amount.value != null && !extraction.amount.source_text) {
    uncertainties.push(
      "Für den Betrag wurde keine eindeutige Fundstelle erkannt. Bitte prüfe den Betrag auf dem Original."
    );
  }
  if (dueDate && !extraction.due_date.source_text) {
    uncertainties.push(
      "Für die Frist wurde keine eindeutige Fundstelle erkannt. Bitte prüfe das Datum auf dem Original."
    );
  }

  const iban = extraction.account_or_iban.value;
  if (iban) {
    push(
      "iban_checksum",
      isValidIban(iban),
      isValidIban(iban) ? null : "Die erkannte IBAN ist ungültig. Bitte übernimm sie direkt vom Original."
    );
  }

  const reference = extraction.reference_number.value;
  if (reference && /^\d[\d\s]{20,}$/.test(reference)) {
    push(
      "qr_reference_checksum",
      isValidQrReference(reference),
      isValidQrReference(reference)
        ? null
        : "Die erkannte Referenznummer besteht die Prüfziffernkontrolle nicht. Bitte übernimm sie direkt vom Original."
    );
  }

  // Abgleich mit deterministischen Swiss-QR-Daten: Der QR-Code gewinnt.
  let qrApplied = false;
  if (qr) {
    qrApplied = true;
    if (amount != null && qr.amount != null && Math.abs(amount - qr.amount) > 0.005) {
      uncertainties.push(
        `Der im Text erkannte Betrag (${amount.toFixed(2)}) weicht vom QR-Code ab (${qr.amount.toFixed(2)}). Es gilt der Betrag aus dem QR-Code.`
      );
    }
    push("qr_iban_checksum", isValidIban(qr.iban), null);
  }

  return { checks, uncertainties, qr_applied: qrApplied };
}
