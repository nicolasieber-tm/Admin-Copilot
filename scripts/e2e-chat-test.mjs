// E2E-Test des Dokumentchats: lädt als Testnutzer eine synthetische Rechnung
// hoch, wartet auf die Analyse und stellt dann eine Frage an die Edge
// Function ask-document. Räumt die Testdaten am Ende wieder auf.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://etfkakxetxaustlpvnzo.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Zmtha3hldHhhdXN0bHB2bnpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4ODE0NjMsImV4cCI6MjEwMDQ1NzQ2M30.6sXf4lmqbwqorROL-q--vNVSpRMgPOfbycqJx3sKrvA";

function buildTestPdf() {
  const textLines = [
    "Beispiel Krankenkasse AG",
    "Musterstrasse 1, 8000 Zuerich",
    "",
    "Praemienrechnung August 2026",
    "",
    "Rechnungsdatum: 10.07.2026",
    "Zahlbar bis: 31.07.2026",
    "Betrag: CHF 428.50",
    "Referenz: 21 00000 00003 13947 14300 09017",
    "IBAN: CH93 0076 2011 6238 5295 7",
    "",
    "Bei Zahlungsverzug wird eine Mahngebuehr von CHF 20.00 erhoben.",
    "Ratenzahlung ist auf Anfrage moeglich: 0800 000 000.",
    "Kundendienst: 0800 000 000, kontakt@example.ch",
  ];
  let contentStream = "BT /F1 12 Tf 50 780 Td 16 TL\n";
  for (const line of textLines) {
    contentStream += `(${line.replace(/[()\\]/g, "\\$&")}) Tj T*\n`;
  }
  contentStream += "ET";

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

const supabase = createClient(SUPABASE_URL, ANON_KEY);

const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
  email: "e2e-test@example.invalid",
  password: "E2eTest-Passwort-2026",
});
if (authError) throw new Error(`Login fehlgeschlagen: ${authError.message}`);
console.log("Login ok:", auth.user.id);

const { data: membership } = await supabase
  .from("workspace_members")
  .select("workspace_id")
  .eq("user_id", auth.user.id)
  .single();
const workspaceId = membership.workspace_id;

const pdfBytes = buildTestPdf();
const { data: doc, error: docError } = await supabase
  .from("documents")
  .insert({
    workspace_id: workspaceId,
    uploaded_by: auth.user.id,
    title: "E2E-Chat Prämienrechnung",
    original_filename: "praemienrechnung.pdf",
    mime_type: "application/pdf",
    page_count: 1,
    file_size: pdfBytes.length,
    status: "uploaded",
  })
  .select("id")
  .single();
if (docError) throw new Error(`Dokument: ${docError.message}`);
console.log("Dokument:", doc.id);

const path = `${workspaceId}/${doc.id}/1.pdf`;
const { error: uploadError } = await supabase.storage
  .from("documents")
  .upload(path, pdfBytes, { contentType: "application/pdf" });
if (uploadError) throw new Error(`Upload: ${uploadError.message}`);

await supabase.from("document_pages").insert({
  document_id: doc.id,
  workspace_id: workspaceId,
  page_number: 1,
  image_storage_path: path,
});
await supabase
  .from("documents")
  .update({ storage_path: `${workspaceId}/${doc.id}` })
  .eq("id", doc.id);
console.log("Upload abgeschlossen, warte auf Analyse …");

const deadline = Date.now() + 150_000;
let ready = false;
while (Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 5000));
  const { data: current } = await supabase
    .from("documents")
    .select("status")
    .eq("id", doc.id)
    .single();
  console.log("  Status:", current?.status);
  if (current?.status === "ready_for_review") {
    ready = true;
    break;
  }
  if (current?.status === "failed") break;
}

async function cleanup() {
  await supabase.from("documents").delete().eq("id", doc.id);
  await supabase.storage.from("documents").remove([path]);
  await supabase.auth.signOut();
}

if (!ready) {
  console.log("FEHLER: Analyse nicht bereit – Details:");
  const { data: failedAnalysis } = await supabase
    .from("document_analyses")
    .select("status, error_code, error_message")
    .eq("document_id", doc.id)
    .order("analysis_version", { ascending: false })
    .limit(1)
    .maybeSingle();
  console.log(JSON.stringify(failedAnalysis, null, 2));
  await cleanup();
  process.exit(2);
}

console.log("\nStelle Frage an ask-document …");
const started = Date.now();
const { data: answerData, error: fnError } = await supabase.functions.invoke(
  "ask-document",
  {
    body: {
      document_id: doc.id,
      question: "Was passiert, wenn ich zu spät zahle, und kann ich in Raten zahlen?",
    },
  }
);
if (fnError) {
  const body = fnError.context
    ? await fnError.context.text().catch(() => "?")
    : fnError.message;
  console.log("FEHLER ask-document:", body);
  await cleanup();
  process.exit(1);
}
console.log(`Antwort nach ${Math.round((Date.now() - started) / 1000)} s:`);
console.log(JSON.stringify(answerData, null, 2));

// Kurze Frage → 400 erwartet (Validierung)
const { error: shortError } = await supabase.functions.invoke("ask-document", {
  body: { document_id: doc.id, question: "a" },
});
console.log("\nValidierung kurze Frage:", shortError ? "abgelehnt (ok)" : "FEHLER: akzeptiert");

// Gespeicherte Frage prüfen
const { data: savedRows } = await supabase
  .from("document_questions")
  .select("question, answer, cited_pages, provider, model")
  .eq("document_id", doc.id);
console.log("\nGespeicherte Fragen:", savedRows?.length);

await cleanup();
console.log("\nTestdaten bereinigt.");

const ok =
  answerData?.question?.answer &&
  savedRows?.length === 1 &&
  Boolean(shortError);
console.log(ok ? "\nE2E_CHAT_TEST_PASSED" : "\nE2E_CHAT_TEST_FAILED");
process.exit(ok ? 0 : 1);
