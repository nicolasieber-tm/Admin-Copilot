# Admin Copilot

Persönlicher Admin Copilot für Dokumente, Fristen und Budget.
Fotografiere einen Brief und erfahre, was er bedeutet, was du tun musst,
bis wann – und wie sich der Betrag auf dein Budget auswirkt.

- Produktspezifikation: [`docs/spezifikation.md`](docs/spezifikation.md)
- Technische Architektur: [`ARCHITECTURE.md`](ARCHITECTURE.md)

## Stack

- **Frontend:** Next.js (App Router) · TypeScript · Tailwind CSS · mobile-first PWA
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions), Projekt `etfkakxetxaustlpvnzo` (Region Zürich)
- **Sicherheit:** Row Level Security auf allen Tabellen (deny by default), privater Storage-Bucket mit Pfad-Policies, signierte URLs

## Entwicklung

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # Produktionsbuild inkl. Typecheck
npm run lint
```

`.env.local` (keine Geheimnisse, nur öffentliche Werte):

```
NEXT_PUBLIC_SUPABASE_URL=…
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=…
```

## Datenbank

Migrationen liegen versioniert in [`supabase/migrations/`](supabase/migrations/)
und werden per Supabase MCP/CLI angewendet – das Dashboard wird nicht für
Schemaänderungen benutzt.

RLS-Smoke-Test (Nutzer A sieht nichts von Nutzer B):
[`scripts/rls-test.sql`](scripts/rls-test.sql) als `postgres` ausführen
(SQL Editor oder MCP `execute_sql`). Erwartetes Ergebnis: `RLS_TEST_PASSED`.

## Stand

**Phase 1 – Fundament (fertig):**

- Registrierung, Login (Passwort + Magic Link), Logout, Passwort-Reset
- Signup-Trigger: Profil + persönlicher Workspace + Membership automatisch
- Alle 15 Tabellen migriert, RLS aktiv und getestet
- Privater Bucket `documents` (20 MB, PDF/JPG/PNG) mit Workspace-Policies
- Upload (Foto mehrseitig / PDF) mit Duplikathinweis (SHA-256), Dokumentliste,
  Detailansicht mit signierten Vorschau-URLs, Soft Delete
- `audit_events` protokolliert Registrierung, Upload, Löschung
- i18n-vorbereitet: alle UI-Strings zentral in `src/lib/i18n/de.ts`

**Phase 2 – Dokumentverarbeitung (fertig):**

- pgmq-Queue `analyse_document`: Enqueue-Trigger nach Upload, Sofortaufruf
  via pg_net, pg_cron-Sweeper alle 30 s, begrenzte Wiederholungen
- Edge Function `analyse-document` mit Provider-Abstraktion
  (`supabase/functions/_shared/ai/`), erste Implementierung: OpenAI
  GPT-5 mini (Responses API, strict Structured Outputs)
- Pipeline: Klassifikation → Extraktion (mit Quellenbezug + Konfidenz) →
  deterministische Validierung (IBAN-/QR-Referenz-Prüfziffern, Datumslogik) →
  Erklärung in Nutzersprache und -modus (normal/einfach)
- Swiss-QR: clientseitiger Scan beim Upload (BarcodeDetector), Payload-Parsing
  serverseitig – QR-Werte überschreiben die Modell-Extraktion
- Live-Status im UI (Realtime + verständliche Schritte), erkannte Angaben mit
  Fundstellen, Unsicherheiten-Box, Retry bei Fehlschlag
- E2E-Test: `scripts/e2e-analysis-test.mjs` (Testnutzer + synthetische
  Rechnung, prüft die komplette Kette bis `ready_for_review`)

**Phase 3 – Bestätigung (Kern fertig):**

- Upload-UX: ein Dateiwähler für Fotos und PDF, Drag-and-drop, Kamera-Button,
  HEIC-Fotos werden clientseitig zu JPEG konvertiert (heic2any, lazy geladen)
- Bestätigungskarte bei «Bitte prüfen»: Dokumenttyp, Betrag und Frist
  prüfen/korrigieren; Korrekturen landen als `corrected_value` auf der Entity,
  der erkannte Originalwert bleibt erhalten; Status → `confirmed`
- Audit: `document_confirmed` und `entity_corrected` via Trigger
- Datumsanzeige TT.MM.JJJJ (de-CH)

Als Nächstes: Phase 4 – Aufgaben + Erinnerungen aus bestätigten Dokumenten;
danach Budgetmodul (Phase 5) und Dokumentchat (Phase 7).
