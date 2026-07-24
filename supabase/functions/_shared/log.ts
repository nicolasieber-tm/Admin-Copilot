// Strukturierte Logs ohne Dokumentinhalte (Spez 20.4):
// nur IDs, Status, Dauer, Modell, Fehlercodes – nie OCR-Text oder Felder.
export function log(event: string, fields: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ event, ...fields }));
}

export function logError(event: string, fields: Record<string, unknown> = {}) {
  console.error(JSON.stringify({ event, ...fields }));
}
