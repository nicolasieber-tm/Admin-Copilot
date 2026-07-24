# Admin Copilot – Architektur (MVP)

Dieses Dokument beschreibt die technische Architektur für den MVP gemäss
[`docs/spezifikation.md`](docs/spezifikation.md). Es ist die Referenz für alle
Implementierungsentscheide. Abweichungen von der Spezifikation sind hier
begründet.

Stand: 2026-07-24 · Status: **Entwurf zur Freigabe**

---

## 1. Entscheide auf einen Blick

| Bereich | Entscheid | Begründung |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + React, mobile-first PWA | Spez 14.2; PWA ermöglicht späteren Capacitor-Wrap zur nativen App mit derselben Codebasis |
| UI-Sprache | Deutsch, i18n-vorbereitet (next-intl) | Spez 14.2; Erklärungssprachen unabhängig von der UI-Sprache |
| Backend | Supabase: Postgres, Auth, Storage, Edge Functions | Spez 14.2; Projekt `etfkakxetxaustlpvnzo`, Region Zürich |
| Asynchrone Verarbeitung | Supabase Edge Functions + Postgres-Queue (pgmq) + pg_cron | Nahe an den Daten, Free-Tier-tauglich, kein n8n im MVP (Spez 14.3: Kernlogik gehört in versionierten Code) |
| KI-Provider | OpenAI GPT-5 mini hinter Provider-Abstraktion | Entscheid 2026-07-24 (Kosten); multimodal (liest Fotos/PDFs direkt), erzwungene JSON-Schemas via Structured Outputs; dank Abstraktion (Spez 14.6) bleibt der Anbieter austauschbar |
| QR-Rechnungen | Deterministischer Swiss-QR-Decoder, **nicht** KI | Betrag, IBAN, Referenz sind maschinenlesbar – null Fehlerquote bei der häufigsten Dokumentart. Umsetzung: Scan clientseitig beim Upload (BarcodeDetector, Best Effort), Parsing + Abgleich serverseitig; QR-Werte überschreiben die Modell-Extraktion |
| E-Mail | Resend (Phase 4, braucht verifizierte Domain) | Einfachste API, gute Zustellbarkeit; bis dahin nur In-App-Benachrichtigungen |
| Hosting Frontend | Vercel | Standard für Next.js, Preview-Deployments |
| Auth-Methoden | E-Mail + Passwort, Magic Link | Supabase Auth; Social Login später möglich |
| Paketmanager | npm | Kein Grund für Exoten |
| Realtime | Supabase Realtime für Analyse-Status im UI | Kein Polling während der Dokumentverarbeitung |

## 2. Systemübersicht

```
┌─────────────────────────────┐
│  Next.js App (Vercel)       │  UI, Auth-Flows, Upload, Ergebnisansicht,
│  – PWA, mobile-first        │  Bestätigung, Aufgaben, Budget
│  – nur Publishable Key      │  Datenzugriff via Supabase-Client + RLS
└──────────────┬──────────────┘
               │ HTTPS (supabase-js, RLS erzwungen)
┌──────────────▼──────────────────────────────────────────┐
│  Supabase (Projekt etfkakxetxaustlpvnzo, Zürich)        │
│                                                          │
│  Auth          E-Mail+Passwort, Magic Link               │
│  Postgres      alle Tabellen, RLS, pgmq-Queue, pg_cron   │
│  Storage       privater Bucket `documents`               │
│  Realtime      Statusupdates an das UI                   │
│                                                          │
│  Edge Functions (Service Role, nur serverseitig):        │
│  – analyse-document   KI-Pipeline (Schritte 1–9)         │
│  – send-reminders     E-Mail-Versand (folgt mit Resend;  │
│                       In-App läuft rein in SQL/pg_cron)  │
│  – recurring-items    Monatsinstanzen erzeugen (pg_cron) │
│  – delete-account     Löschkaskade inkl. Storage         │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
        ┌──────▼───────┐            ┌──────▼──────┐
        │ OpenAI API   │            │ Resend      │
        │ (GPT-5 mini) │            │ (Phase 4)   │
        └──────────────┘            └─────────────┘
```

Grundsätze:

- **Die Datenbank ist die einzige Quelle des Zustands** (Spez 14.3). Edge
  Functions sind zustandslos; jeder Pipeline-Schritt persistiert sein Ergebnis.
- **Service-Role-Key existiert nur in Edge Functions.** Das Next.js-Frontend
  (inkl. Server Components) arbeitet ausschliesslich mit der Nutzer-Session
  und RLS. Vercel hält damit keine privilegierten Datenbank-Schlüssel.
- **KI-Aufrufe passieren nie im Frontend.** Alle Provider-Zugriffe laufen in
  Edge Functions hinter der Abstraktionsschicht.

## 3. Statusmodell (Vereinheitlichung von Spez 11.4 und 25.1)

Die Spezifikation führt zwei unterschiedliche Statuslisten. Auflösung:

**`documents.status`** – grober, nutzersichtbarer Zustand (Spez 25.1):

```
uploaded → processing → ready_for_review → confirmed → action_open
                                                        → completed → archived
          ↘ failed (erneut analysierbar)
```

**`document_analyses.status`** – feiner Pipeline-Zustand (Spez 11.4), pro
Analyse-Lauf, für Nachvollziehbarkeit und Wiederaufnahme:

```
pending → preprocessing → text_extraction → classification
        → structured_extraction → validation → explanation_generation
        → completed | failed (mit error_code)
```

Regeln (Spez 25.5):

- `confirmed` erst nach Nutzerbestätigung der kritischen Felder.
- Erneute Analyse erzeugt einen **neuen** `document_analyses`-Datensatz
  (`analysis_version` +1) – niemals doppelte Aufgaben oder Budgetposten.
- Löschen eines Dokuments fragt, was mit verknüpften Aufgaben/Budgetposten
  geschehen soll (Soft Delete via `deleted_at`).

## 4. Datenmodell

Tabellen exakt gemäss Spez Kapitel 15:

`users` (Profil, 1:1 zu `auth.users`) · `workspaces` · `workspace_members` ·
`documents` · `document_pages` · `document_analyses` · `document_entities` ·
`tasks` · `reminders` · `notifications` · `budget_plans` · `budget_items` ·
`recurring_items` · `document_questions` · `audit_events`

Ergänzende Festlegungen:

- **Jede Fachtabelle trägt `workspace_id`** (auch wenn über das Dokument
  ableitbar) – Voraussetzung für einfache, performante RLS-Policies.
- **Signup-Trigger:** Bei Registrierung erzeugt ein Postgres-Trigger auf
  `auth.users` automatisch Profil, persönlichen Workspace und
  `workspace_members`-Eintrag (Rolle `owner`).
- **Soft Delete** (`deleted_at`) für `users`, `documents`, `budget_items`;
  endgültige Löschung übernimmt `delete-account`.
- **Beträge** als `numeric(12,2)` + `currency char(3)`, initial `CHF`.
- **Budgetformel:** `opening_balance` ist im MVP optional (Standard `null`).
  Ohne Bankanbindung gilt: `projizierter_rest = erwartete_einnahmen −
  erwartete_ausgaben` (+ `opening_balance`, falls manuell erfasst).
  Die Monatsübersicht kennzeichnet das Ergebnis gemäss `data_completeness`
  als Schätzung (Spez 26.2).
- **Wiederkehrende Posten:** Vorlage in `recurring_items`, monatliche
  Instanzen in `budget_items` mit `recurrence_parent_id` (Spez 26.3);
  Erzeugung idempotent durch Unique-Constraint (Vorlage + Monat).
- **Duplikaterkennung:** `documents.file_hash` (SHA-256) mit Hinweis statt
  Blockade (Spez 21.7).

## 5. Sicherheit

- **RLS auf allen Tabellen**, deny by default. Standard-Policy-Muster:
  Zugriff nur, wenn `workspace_id` in den Workspaces des eingeloggten Nutzers
  liegt (Helper-Funktion `private.user_workspace_ids()`, `security definer`).
- **Storage:** privater Bucket `documents`, Pfadschema
  `{workspace_id}/{document_id}/{page}.{ext}`. Storage-Policies prüfen die
  Workspace-Mitgliedschaft über den Pfad. Auslieferung ausschliesslich über
  kurzlebige signierte URLs (Spez 20.2).
- **Upload-Validierung serverseitig:** MIME-Typ vs. Magic Bytes, maximale
  Grösse und Seitenzahl, nur PDF/JPG/PNG (HEIC wird clientseitig
  konvertiert), temporäre Dateien werden gelöscht (Spez 20.6).
- **Prompt-Injection-Schutz (Spez 20.5):** Dokumenttext wird als zitierte
  Nutzdaten übergeben, Systemregeln strikt getrennt, Ausgabe über erzwungene
  JSON-Schemas validiert, keine Tool-Nutzung durch das Modell, verdächtige
  Inhalte werden protokolliert.
- **Logs ohne Dokumentinhalte** (Spez 20.4): nur IDs, Status, Dauer, Modell,
  Kostenmetrik, Fehlercode.
- **Audit:** `audit_events` wird bei allen relevanten Aktionen aus
  Edge Functions bzw. Datenbank-Triggern geschrieben (Spez 15.15).

## 6. Verarbeitungspipeline

Ablauf einer Dokumentanalyse (Spez 14.4):

1. **Upload (Frontend):** Datei → Storage, Datensatz in `documents`
   (`status = uploaded`), Seiten in `document_pages`.
2. **Enqueue:** Datenbank-Trigger legt eine Nachricht in die pgmq-Queue
   `analyse_document`; Status → `processing`.
3. **Edge Function `analyse-document`** arbeitet die Schritte ab und
   persistiert nach jedem Schritt in `document_analyses`:
   Vorverarbeitung → Texterkennung (Claude multimodal, plus QR-Decoder) →
   Klassifikation → kategoriespezifische Extraktion → Validierung →
   Erklärung → Risikobewertung → Vorschläge für Aufgabe und Budgetposten.
4. **Ergebnis:** erkannte Werte einzeln mit Quellenbezug und Konfidenz in
   `document_entities`; Status → `ready_for_review`; Notification + Realtime.
5. **Nutzerbestätigung (Frontend):** Bestätigen/Korrigieren der kritischen
   Felder. Erst die Bestätigung erzeugt verbindliche `tasks`, `reminders`
   und `budget_items` (Spez 14.4 Schritt 10).

Fehlerverhalten: begrenzte Wiederholungen über die Queue, Status bleibt
nachvollziehbar, Originaldatei bleibt erhalten, keine Duplikate bei erneuter
Analyse (Spez 21.5/21.6).

### KI-Provider-Abstraktion (Spez 14.6)

Interfaces in `supabase/functions/_shared/ai/`:

```
DocumentTextExtractor · DocumentClassifier · DocumentFieldExtractor
DocumentExplainer · DocumentQuestionAnswerer · TranslationService
```

Jeder Service: definierte Eingabe → validiertes Ergebnis (erzwungenes
JSON-Schema, strict). Erste Implementierung: `providers/openai.ts`
(GPT-5 mini, Responses API). Modell- und Promptversion werden pro Analyse
in `document_analyses` gespeichert (Spez 37.5).

## 7. Hintergrundjobs (Spez 30)

| Job | Auslöser | Mechanik |
|---|---|---|
| `analyse-document` | DB-Trigger bei Upload | pgmq-Queue → Edge Function |
| `send-reminders` | pg_cron, alle 5 Min | fällige `reminders` laden, Aufgabenstatus prüfen, senden, Status/Retry speichern |
| `generate-recurring-items` | pg_cron, täglich | fehlende Monatsinstanzen idempotent erzeugen |
| Budget-Neuberechnung | synchron bei Änderung | Postgres-Funktion `recalculate_budget(workspace, monat)` – kein separater Job nötig |

## 8. Repository-Layout

```
admin-copilot/
  ARCHITECTURE.md
  docs/spezifikation.md
  src/                        Next.js (App Router)
    app/                      auth, dashboard, documents, tasks, budget,
                              settings (Routen gemäss Spez 13)
    components/               documents, tasks, budget, common
    modules/                  Fachlogik Frontend-seitig (Spez 29)
    lib/                      supabase-Client, i18n, validation, utils
    schemas/                  Zod-Schemas (document, extraction, task, budget)
  supabase/
    migrations/               nummerierte SQL-Migrationen (Schema, RLS, Trigger)
    functions/
      _shared/                ai/ (Provider-Abstraktion), db, log, security
      analyse-document/
      send-reminders/
      generate-recurring-items/
      delete-account/
  public/                     PWA-Manifest, Icons
```

## 9. Umgebungen und Konfiguration

- `.env.local` (Frontend): `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` – keine Geheimnisse.
- Edge-Function-Secrets (Supabase Dashboard): `OPENAI_API_KEY` (gesetzt),
  optional `OPENAI_MODEL` (Standard `gpt-5-mini`), später `RESEND_API_KEY`.
- Migrationen werden im Repo versioniert und per Supabase CLI/MCP angewendet;
  das Dashboard wird nicht für Schemaänderungen benutzt.
- Test- und Produktivdaten bleiben getrennt (Spez 20.1); für die Entwicklung
  genügt vorerst das eine Projekt, ein zweites folgt vor dem Pilot.

## 10. Phasenplan (nach Spez 34)

| Phase | Inhalt | Ergebnis |
|---|---|---|
| **1 Fundament** | Projektstruktur, Auth, Workspace-Modell, komplettes Schema + RLS, Storage, Upload-Flow, Audit-Grundlage – **ohne KI** | Registrieren, einloggen, Dokument hochladen und in Liste sehen |
| 2 Dokumentverarbeitung | Queue, Edge Function, Provider-Abstraktion, Klassifikation, Extraktion, Validierung, QR-Decoder, Statusanzeige | Hochgeladenes Dokument wird analysiert, Ergebnis strukturiert gespeichert |
| 3 Ergebnis + Bestätigung | Ergebnisansicht (Spez 11.5), Unsicherheiten, Quellenbezug, Korrektur/Bestätigung | Nutzer bestätigt Betrag/Frist/Handlung |
| 4 Aufgaben + Erinnerungen | Aufgaben-CRUD, Erinnerungslogik, E-Mail via Resend, pg_cron | Frist erzeugt Erinnerung, E-Mail kommt an — **In-App umgesetzt 2026-07-24** (Bestätigung → Aufgabe per DB-Trigger, Erinnerungen 7/2/0 Tage, `private.process_due_reminders()` minütlich per pg_cron → Benachrichtigungen; E-Mail wartet auf offenen Punkt 2) |
| 5 Budget | Monatsübersicht, manuelle Posten, Dokumentübernahme, wiederkehrende Einträge, Warnlogik | Betrag aus Dokument verändert Monatsbudget sichtbar — **umgesetzt 2026-07-24** (Bestätigung → Budgetposten per Trigger im Fristmonat, RPC `ensure_budget_plan` materialisiert wiederkehrende Vorlagen idempotent beim Monatsöffnen, `private.recalculate_budget` synchron per Trigger, Aufgabenabschluss setzt Posten auf bezahlt/erhalten; Warnung bei negativem Rest + Schätzungs-Hinweis; Bestätigung atomar via RPC `confirm_document` mit Budget-Wahl neu/zusammenführen/überspringen gegen Doppelzählung fixer Posten) |
| 6 Verbindung | Dashboard-Priorisierung, Abschlusslogik über alle Module | Durchgängige Kette gemäss Spez 40 — **umgesetzt 2026-07-24** (Budget-Abhaken erledigt Aufgabe→Dokument→Erinnerungen (Rückrichtung, zyklusfrei); `confirm_document` mit p_mark_done «bereits erledigt – nur ablegen»; Dashboard priorisiert: Erinnerungen → Bitte-prüfen-Dokumente → Upload → Fristen → Budget) |
| 7 Chat + Sprache | Dokumentchat, einfache Sprache, Erklärungssprachen | Fragen zum Dokument mit Quellenbezug — **umgesetzt 2026-07-24** (Edge Function `ask-document`: synchron, läuft im RLS-Kontext des Nutzers, GPT-5 mini mit strict-Schema {answer, cited_pages, uncertainty_note}, 30 Fragen/Tag-Limit, gespeichert in document_questions; Chat-UI mit Vorschlagsfragen auf der Dokumentseite; Erklärungssprache de/fr/it/en + einfache Sprache im Profil, gelten für Analyse und Chat; E2E-Test scripts/e2e-chat-test.mjs) |
| 8 Qualität + Pilot | Testkorpus, Fehleranalyse, Datenschutzprüfung, Pilot | Pilotreife gemäss Spez 40 |

**Definition of Done Phase 1:**

1. `npm run dev` startet die App lokal; Registrierung, Login (Passwort +
   Magic Link), Logout, Passwort-Reset funktionieren.
2. Signup erzeugt automatisch Profil, persönlichen Workspace, Membership.
3. Alle 15 Tabellen migriert, RLS aktiv und getestet (Nutzer A sieht nichts
   von Nutzer B – automatisierter Test).
4. Privater Storage-Bucket mit Pfad-Policies; Upload (Foto/PDF, mehrseitig)
   legt Dokument mit Status `uploaded` an; Dokumentliste zeigt es.
5. `audit_events` protokolliert Registrierung, Upload, Löschung.
6. Kein Service-Role-Key ausserhalb von Edge Functions.

## 11. Offene Punkte

| # | Punkt | Benötigt bis |
|---|---|---|
| 1 | Erklärungssprachen zum Start (DE einfach/normal + welche weiteren?) | Phase 3 |
| 2 | Absender-Domain für Erinnerungs-E-Mails (Resend-Verifikation) | Phase 4 |
| 3 | ~~Analyse-Limit pro Nutzer~~ erledigt: 20 Analysen/Workspace/24h (Enqueue+Retry) + 30 Chat-Fragen/Nutzer/Tag (2026-07-25) | – |
| 4 | ~~Vercel-Deployment~~ live: https://admin-copilot-nine.vercel.app (2026-07-25, Auth-Redirect-URLs in Supabase gesetzt) | – |
| 5 | ~~GitHub-Remote~~ erledigt: https://github.com/nicolasieber-tm/Admin-Copilot (privat, 2026-07-25) | – |
| 6 | ~~KI-API-Key~~ erledigt: `OPENAI_API_KEY` gesetzt (2026-07-24) | – |
| 7 | Leaked-Password-Protection im Auth-Dashboard aktivieren (Advisor-Hinweis) | vor Pilot |
