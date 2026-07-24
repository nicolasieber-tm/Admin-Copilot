// Deterministischer Swiss-QR-Parser (ARCHITECTURE.md §1: QR-Rechnungen
// werden nicht der KI überlassen). Der QR-Code wird clientseitig beim Upload
// gescannt (BarcodeDetector) und als Roh-Payload in
// document_pages.extraction_metadata.qr_raw gespeichert; hier wird die
// Payload nach Swiss-QR-Standard v2 (feste Zeilenpositionen) zerlegt.

export type SwissQrData = {
  iban: string;
  creditorName: string | null;
  amount: number | null;
  currency: string | null;
  referenceType: string | null; // QRR | SCOR | NON
  reference: string | null;
  unstructuredMessage: string | null;
};

export function parseSwissQr(raw: string): SwissQrData | null {
  const lines = raw.split(/\r?\n/).map((l) => l.trim());
  if (lines[0] !== "SPC") return null;
  const get = (i: number): string | null => {
    const v = lines[i];
    return v && v.length > 0 ? v : null;
  };
  const iban = get(3);
  if (!iban) return null;

  const amountRaw = get(18);
  const amount = amountRaw ? Number(amountRaw) : null;

  return {
    iban,
    creditorName: get(5),
    amount: amount != null && Number.isFinite(amount) ? amount : null,
    currency: get(19),
    referenceType: get(27),
    reference: get(28),
    unstructuredMessage: get(29),
  };
}
