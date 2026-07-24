# MVP Spezifikation, Admin Copilot für Dokumente, Fristen und Budget

## 1. Dokumentzweck

Dieses Dokument beschreibt die Produktidee, den Funktionsumfang und die technische Architektur für einen ersten marktfähigen MVP eines persönlichen Admin Copiloten.

Die Anwendung verbindet zwei bisher getrennte Probleme zu einem durchgängigen System:

1. Schwierige Briefe, Rechnungen, Verfügungen, Versicherungsunterlagen und andere administrative Dokumente verstehen.
2. Die daraus entstehenden Zahlungen, Fristen und finanziellen Auswirkungen in einer einfachen Budgetplanung berücksichtigen.

Die App ist damit weder nur ein Dokumentenscanner noch nur eine Budget App. Sie wird zum persönlichen administrativen Arbeitsbereich, der aus einem unverständlichen Dokument eine verständliche Erklärung, einen konkreten Handlungsplan und eine finanzielle Einordnung erstellt.

Dieses Dokument soll als Grundlage für Produktdesign, technische Architektur, Datenmodellierung, Implementierung, Tests und spätere Übergabe an Entwickler dienen.

## 2. Arbeitstitel

Arbeitstitel: Admin Copilot

Der endgültige Produktname ist nicht Bestandteil des MVP und kann später anhand von Positionierung, Zielgruppe und Markenschutz festgelegt werden.

## 3. Produktvision

Viele Menschen erhalten Briefe und Dokumente, die sie nicht vollständig verstehen. Häufig ist zwar erkennbar, dass etwas wichtig ist, aber nicht:

* Was das Dokument genau bedeutet
* Ob eine Handlung erforderlich ist
* Welche Frist gilt
* Welcher Betrag bezahlt werden muss
* Welche Konsequenzen bei Nichtreaktion entstehen können
* Welche Unterlagen benötigt werden
* Ob das Dokument das verfügbare Monatsbudget belastet
* Wie die Zahlung eingeplant werden soll

Das Problem betrifft nicht nur Menschen mit eingeschränkten Deutschkenntnissen. Auch Selbstständige, junge Erwachsene, Personen mit wenig administrativer Erfahrung, Menschen in finanziell angespannten Situationen und Personen mit komplexen Versicherungs oder Steuerfragen verlieren schnell den Überblick.

Der Admin Copilot übersetzt administrative Komplexität in einen einfachen nächsten Schritt.

Die Kernfrage der Anwendung lautet nicht nur:

> Was steht in diesem Dokument?

Die wichtigere Frage lautet:

> Was bedeutet dieses Dokument für mich, was muss ich jetzt tun, bis wann muss ich es tun und wie wirkt es sich auf mein Budget aus?

## 4. Grundprinzip des Produkts

Das Produkt basiert auf einem einfachen, wiederholbaren Ablauf.

### 4.1 Eingang

Der Nutzer fotografiert ein Dokument, lädt ein PDF hoch oder übernimmt einen bereits vorhandenen Scan.

### 4.2 Erkennung

Das System erkennt:

* Dokumententyp
* Absender
* Empfänger
* Datum
* Frist
* Betrag
* Zahlungsinformationen
* Referenznummern
* Betreff
* zentrale Forderungen
* erforderliche Handlungen
* mögliche Konsequenzen
* relevante Kontaktinformationen

### 4.3 Erklärung

Das System erklärt das Dokument in einfacher Sprache und auf Wunsch in der bevorzugten Sprache des Nutzers.

Die Erklärung soll nicht wie eine juristische Zusammenfassung wirken. Sie soll konkret beantworten:

* Was ist das?
* Warum habe ich das erhalten?
* Muss ich etwas tun?
* Was genau muss ich tun?
* Bis wann?
* Muss ich etwas bezahlen?
* Was passiert möglicherweise, wenn ich nichts mache?
* Welche Information ist unsicher und sollte geprüft werden?

### 4.4 Aktion

Aus dem Dokument werden konkrete Aufgaben erzeugt.

Beispiele:

* Rechnung bis 15. August bezahlen
* Formular ausfüllen
* Unterlagen nachreichen
* Versicherung kontaktieren
* Einsprachefrist prüfen
* Termin vereinbaren
* Dokument nur ablegen, keine Aktion notwendig

### 4.5 Erinnerung

Für relevante Fristen erstellt die App Erinnerungen. Der Nutzer kann Zeitpunkt, Kanal und Status anpassen.

### 4.6 Budgetauswirkung

Wenn das Dokument einen Betrag enthält, schlägt die App vor, diesen Betrag in das Budget zu übernehmen.

Beispiele:

* Einmalige Rechnung
* Wiederkehrende Versicherungsprämie
* Steuerrate
* Rückerstattung
* Lohnanpassung
* Mietzinsänderung
* Nachzahlung
* Gutschrift

### 4.7 Einordnung

Die App zeigt, ob die neue finanzielle Verpflichtung im aktuellen oder kommenden Monatsbudget Platz hat.

Die Anwendung soll dabei nicht nur einen Betrag speichern. Sie soll den Nutzer darauf hinweisen, wenn:

* das verfügbare Budget voraussichtlich negativ wird
* eine Zahlung vor dem nächsten Einkommen fällig wird
* mehrere grosse Zahlungen in kurzer Zeit anstehen
* eine wiederkehrende Ausgabe das zukünftige Budget verändert
* eine Frist kritisch nahe ist

## 5. Warum die beiden Ideen zusammengehören

Dokumentenverständnis und Budgetplanung sind keine zwei beliebigen Funktionen. Sie bilden einen gemeinsamen administrativen Prozess.

Ein offizieller Brief führt häufig zu mindestens einer der folgenden Auswirkungen:

* Eine Zahlung wird fällig
* Eine Rückerstattung wird erwartet
* Eine Frist beginnt
* Eine wiederkehrende Ausgabe verändert sich
* Ein Einkommen verändert sich
* Ein finanzielles Risiko entsteht
* Eine Entscheidung ist notwendig

Eine reine Dokumenten App erklärt nur, was im Brief steht. Danach muss der Nutzer weiterhin selbst eine Erinnerung setzen, die Zahlung einplanen und prüfen, ob das Geld reicht.

Eine reine Budget App kennt dagegen nicht, warum eine neue Ausgabe entsteht und welche Frist dazu gehört.

Der Admin Copilot verbindet beide Seiten:

1. Dokument verstehen
2. Handlung erkennen
3. Frist speichern
4. finanziellen Effekt übernehmen
5. Budget neu berechnen
6. Nutzer bis zum Abschluss begleiten

Diese Verbindung ist der eigentliche Produktvorteil.

## 6. Produktpositionierung

### 6.1 Kernversprechen

> Fotografiere einen Brief und erfahre sofort, was er bedeutet, was du tun musst, bis wann du reagieren musst und wie sich der Betrag auf dein Budget auswirkt.

### 6.2 Positionierung gegenüber Dokumentenscannern

Ein klassischer Scanner digitalisiert Dokumente.

Der Admin Copilot versteht Dokumente, erzeugt Aufgaben und verbindet sie mit dem finanziellen Alltag.

### 6.3 Positionierung gegenüber allgemeinen KI Chatbots

Ein allgemeiner Chatbot kann ein Dokument erklären, besitzt aber normalerweise keinen strukturierten administrativen Arbeitsbereich.

Der Admin Copilot speichert:

* Dokumente
* Fristen
* Aufgaben
* Budgetauswirkungen
* Zahlungsstatus
* Verlauf
* Erinnerungen

Er führt den Nutzer durch einen Prozess und liefert nicht nur eine einmalige Antwort.

### 6.4 Positionierung gegenüber Budget Apps

Eine klassische Budget App verlangt manuelle Pflege von Einnahmen und Ausgaben.

Der Admin Copilot übernimmt finanzielle Auswirkungen direkt aus Dokumenten und zeigt den administrativen Grund hinter einer Ausgabe.

## 7. Zielgruppen

## 7.1 Primäre MVP Zielgruppe

Der MVP sollte zunächst für Privatpersonen entwickelt werden, die administrative Dokumente erhalten und Schwierigkeiten haben, diese korrekt einzuordnen.

Besonders relevant sind:

* Personen mit wenig administrativer Erfahrung
* Menschen mit begrenzten Deutschkenntnissen
* junge Erwachsene mit eigenem Haushalt
* Personen mit mehreren Versicherungs, Steuer oder Behördenkontakten
* Menschen mit unregelmässigem Einkommen
* Personen, die Fristen oder Rechnungen leicht übersehen
* Menschen in finanziell angespannten Situationen

## 7.2 Sekundäre Zielgruppe

Später kann dieselbe Plattform als betreute Lösung für Organisationen angeboten werden.

Mögliche Organisationen:

* Arbeitsintegrationen
* Sozialdienste
* Beratungsstellen
* Schuldenberatungen
* Gemeinden
* Integrationsprogramme
* gemeinnützige Organisationen
* betreute Wohnangebote
* Versicherungs oder Vorsorgeberatungen

## 7.3 Architekturentscheidung für spätere Organisationen

Der MVP erhält im Hintergrund bereits ein Workspace Modell.

Jeder private Nutzer besitzt einen persönlichen Workspace. Später können Organisations Workspaces ergänzt werden, ohne die gesamte Datenstruktur neu aufzubauen.

Im ersten MVP gibt es jedoch noch kein vollständiges Fallmanagement für Sozialarbeitende. Es werden keine komplexen Rollen, Freigaben oder Fallzuweisungen umgesetzt.

Diese Funktionen werden architektonisch vorbereitet, aber nicht im ersten Produktumfang sichtbar gemacht.

## 8. Produktziele des MVP

Der MVP soll beweisen, dass Nutzer mit möglichst wenig Aufwand einen administrativen Brief in eine verständliche und handlungsorientierte Übersicht verwandeln können.

Der MVP gilt als erfolgreich, wenn der Nutzer:

1. Ein Dokument innerhalb weniger Schritte hochladen kann.
2. Den Dokumententyp und die wichtigsten Inhalte korrekt angezeigt bekommt.
3. Eine verständliche Erklärung erhält.
4. Eine erkannte Frist bestätigen oder korrigieren kann.
5. Eine Aufgabe und Erinnerung erstellen kann.
6. Einen erkannten Betrag in das Budget übernehmen kann.
7. Sofort sieht, wie sich dieser Betrag auf das Monatsbudget auswirkt.
8. Den Bearbeitungsstatus des Dokuments nachvollziehen kann.
9. Unsichere Angaben klar erkennt und nicht als sichere Fakten missversteht.

## 9. Klare Nicht Ziele des MVP

Der erste MVP soll bewusst begrenzt bleiben.

Nicht Bestandteil des MVP sind:

* direkte Bankanbindung
* automatischer Import von Banktransaktionen
* Ausführung von Zahlungen
* automatische Einreichung von Formularen
* automatische Kommunikation mit Behörden
* automatische Einsprache oder juristische Schreiben
* verbindliche Rechtsberatung
* verbindliche Steuerberatung
* vollständige Buchhaltung
* Schuldenregulierung
* Betreibungsmanagement
* vollwertiges CRM für Sozialdienste
* gemeinsamer Zugriff mehrerer Betreuungspersonen
* komplexe Mandantenverwaltung
* automatische Vertragskündigungen
* automatische Versicherungsoptimierung
* OCR Training mit eigenen Modellen
* Desktop Dokumentenmanagement mit Ordnerstrukturen
* Exportfunktionen im ersten Kernrelease

Ein späterer Export als PDF oder CSV kann vorbereitet werden, ist aber kein notwendiger Bestandteil des ersten MVP.

## 10. Unterstützte Dokumentkategorien im MVP

Der MVP darf nicht versuchen, jedes mögliche Schweizer Dokument vollständig zu verstehen. Das wäre technisch und inhaltlich zu breit.

Der Start erfolgt mit wenigen, häufigen Kategorien.

### 10.1 Rechnungen

Beispiele:

* normale Rechnung
* QR Rechnung
* Prämienrechnung
* Arztrechnung
* Stromrechnung
* Telefonrechnung
* Mitgliedschaft
* Rechnung einer Behörde

Zu erkennen:

* Betrag
* Fälligkeitsdatum
* Rechnungssteller
* Referenz
* Zahlungszweck
* wiederkehrend oder einmalig
* mögliche Mahninformation

### 10.2 Mahnungen und Zahlungserinnerungen

Zu erkennen:

* ursprünglicher Betrag
* Mahngebühr
* neuer Gesamtbetrag
* neue Frist
* Eskalationshinweis
* Kontaktmöglichkeit
* Dringlichkeit

### 10.3 Versicherungsdokumente

Beispiele:

* Prämienänderung
* Police
* Leistungsabrechnung
* Rückerstattung
* Selbstbehalt oder Franchise Information
* Zahlungsaufforderung

Zu erkennen:

* Versicherung
* Versicherungsart
* Betrag
* Gültigkeitszeitraum
* Änderung gegenüber vorher
* erforderliche Handlung
* Kündigungs oder Reaktionsfrist, nur wenn im Dokument eindeutig enthalten

### 10.4 Steuerdokumente

Beispiele:

* provisorische Steuerrechnung
* definitive Steuerrechnung
* Ratenrechnung
* Aufforderung zur Einreichung
* Fristverlängerungsbestätigung
* Rückerstattung
* Nachforderung

Zu erkennen:

* Steuerperiode
* Betrag
* Zahlungsfrist
* Einreichungsfrist
* zuständige Stelle
* Referenz
* Zahlungs oder Handlungsart

### 10.5 Arbeits und Sozialversicherungsdokumente

Beispiele:

* Arbeitsvertragliche Mitteilung
* Lohnabrechnung
* RAV Schreiben
* Arbeitslosenversicherung
* AHV oder IV Schreiben
* Familienzulagen
* Taggeld
* Sozialdienstliche Verfügung

Zu erkennen:

* Zeitraum
* Leistung oder Forderung
* Betrag
* Frist
* erforderliche Unterlagen
* zuständige Kontaktstelle
* Status der Entscheidung

### 10.6 Miet und Haushaltsdokumente

Beispiele:

* Mietzinsänderung
* Nebenkostenabrechnung
* Kaution
* Wohnungsverwaltung
* Kündigungs oder Übergabetermin
* Energieabrechnung

Zu erkennen:

* neue monatliche Kosten
* einmalige Nachzahlung
* Gültigkeitsdatum
* Frist
* erforderliche Handlung

### 10.7 Allgemeines offizielles Schreiben

Wenn keine unterstützte Kategorie eindeutig passt, wird das Dokument als allgemeines Schreiben behandelt.

Das System soll trotzdem versuchen, folgende Punkte zu extrahieren:

* Absender
* Betreff
* Dokumentdatum
* Frist
* Betrag
* geforderte Handlung
* Kontakt
* Zusammenfassung

Die App muss bei geringer Sicherheit deutlich anzeigen, dass die Einordnung geprüft werden soll.

## 11. Zentrale Nutzerreise

## 11.1 Onboarding

Der Nutzer erstellt ein Konto und beantwortet nur die Informationen, die für den MVP notwendig sind.

Pflichtangaben:

* Vorname oder gewünschte Anrede
* E Mail Adresse
* Passwort oder passwortloser Login
* bevorzugte Erklärungssprache
* bevorzugte Darstellung, normal oder einfach
* Standardwährung, initial CHF
* Zeitzone, initial Europe/Zurich

Optionale Angaben:

* monatliches Nettoeinkommen
* nächstes Einkommensdatum
* regelmässige Einnahmen
* regelmässige Ausgaben
* Haushaltstyp
* gewünschter Erinnerungskanal

Das Onboarding soll nicht den gesamten Budgetplan erzwingen. Der Nutzer darf zuerst ein Dokument hochladen und das Budget später ergänzen.

## 11.2 Startseite

Die Startseite zeigt drei zentrale Bereiche:

1. Neues Dokument hinzufügen
2. Nächste Aufgaben und Fristen
3. Budgetübersicht des aktuellen Monats

Zusätzlich werden offene Dokumente angezeigt, bei denen noch eine Bestätigung fehlt.

## 11.3 Dokument hinzufügen

Der Nutzer kann:

* ein Foto aufnehmen
* mehrere Seiten fotografieren
* ein Bild auswählen
* ein PDF hochladen

Vor dem Upload sieht der Nutzer eine kurze Information, dass sensible Daten verarbeitet werden und dass er nur Dokumente hochladen soll, zu deren Verarbeitung er berechtigt ist.

## 11.4 Dokumentanalyse

Nach dem Upload erhält das Dokument den Status `uploaded`.

Danach folgen die Statusstufen:

1. `preprocessing`
2. `text_extraction`
3. `classification`
4. `structured_extraction`
5. `validation`
6. `explanation_generation`
7. `ready_for_review`
8. `confirmed`
9. `completed`
10. `failed`

Der Nutzer sieht während der Verarbeitung einen verständlichen Status und keine technischen Begriffe.

Beispiel:

* Dokument wird vorbereitet
* Text wird erkannt
* Wichtige Informationen werden geprüft
* Übersicht wird erstellt

## 11.5 Ergebnisansicht

Die Ergebnisansicht folgt immer derselben Reihenfolge.

### Abschnitt 1, Was ist das?

Beispiel:

> Das ist eine Prämienrechnung deiner Krankenkasse für August 2026.

### Abschnitt 2, Was bedeutet das?

Beispiel:

> Du musst CHF 428.50 bezahlen. Die Zahlung ist bis zum 31. Juli 2026 fällig.

### Abschnitt 3, Was musst du tun?

Beispiel:

> Bezahle die Rechnung bis zum 31. Juli 2026. Prüfe vorher, ob du diese Rechnung bereits bezahlt hast.

### Abschnitt 4, Wichtige Angaben

* Betrag
* Frist
* Absender
* Referenz
* Kontakt
* Zeitraum

### Abschnitt 5, Budgetauswirkung

Beispiel:

> Wenn du diese Rechnung in dein Budget übernimmst, bleiben dir im Juli voraussichtlich CHF 312.40 übrig.

### Abschnitt 6, Unsicherheiten

Beispiel:

> Das Fälligkeitsdatum wurde nicht eindeutig erkannt. Bitte prüfe das Datum auf dem Originaldokument.

### Abschnitt 7, Aktionen

* Angaben bestätigen
* Frist korrigieren
* Aufgabe erstellen
* Erinnerung aktivieren
* Betrag ins Budget übernehmen
* als bereits erledigt markieren
* Frage zum Dokument stellen

## 11.6 Bestätigung

Das System darf erkannte Fristen und Beträge nicht stillschweigend als endgültig übernehmen.

Vor der Erstellung einer kritischen Erinnerung oder Budgetbuchung bestätigt der Nutzer:

* Dokumententyp
* Betrag
* Frist
* Handlungsart

Bei klaren Rechnungen kann die Bestätigung in einem einzigen Schritt erfolgen.

## 11.7 Aufgabe und Erinnerung

Nach der Bestätigung erstellt die App eine Aufgabe.

Beispiel:

* Titel: Krankenkassenrechnung bezahlen
* Fällig: 31. Juli 2026
* Betrag: CHF 428.50
* Dokument: Helsana Prämienrechnung August 2026
* Status: Offen
* Priorität: Hoch
* Erinnerung: 7 Tage vorher, 2 Tage vorher, am Fälligkeitstag

Der Nutzer kann diese Angaben ändern.

## 11.8 Budgetübernahme

Wenn der Betrag übernommen wird, erstellt die App einen Budgetposten.

Beispiel:

* Art: Ausgabe
* Kategorie: Versicherung
* Betrag: CHF 428.50
* Monat: Juli 2026
* Fälligkeitsdatum: 31. Juli 2026
* Status: Geplant
* Quelle: Dokument
* Wiederkehrend: Nein

Wenn das Dokument eine wiederkehrende Prämie ankündigt, fragt die App:

> Soll dieser Betrag ab August jeden Monat in dein Budget übernommen werden?

## 11.9 Abschluss

Ein Dokument gilt als abgeschlossen, wenn die notwendige Handlung erledigt ist.

Mögliche Abschlussarten:

* bezahlt
* Formular eingereicht
* Rückfrage gestellt
* Termin vereinbart
* keine Aktion erforderlich
* nur abgelegt

Der Abschluss aktualisiert gleichzeitig:

* Aufgabenstatus
* Erinnerungsstatus
* Budgetstatus
* Dokumentstatus

## 12. Funktionsumfang des MVP

## 12.1 Benutzerkonto

Funktionen:

* Registrierung
* Login
* Logout
* Passwort zurücksetzen
* passwortloser Login optional
* Profil bearbeiten
* Sprache festlegen
* Konto löschen
* Datenexport später vorbereiten

## 12.2 Persönlicher Workspace

Jeder Nutzer erhält einen persönlichen Workspace.

Der Workspace enthält:

* Dokumente
* Aufgaben
* Erinnerungen
* Budget
* Einstellungen
* Aktivitätsverlauf

Die Datenbank wird so aufgebaut, dass später mehrere Nutzer in einem Organisations Workspace arbeiten können.

## 12.3 Dokument Upload

Anforderungen:

* PDF
* JPG
* JPEG
* PNG
* HEIC, falls technisch zuverlässig konvertierbar
* mehrere Seiten pro Dokument
* maximale Dateigrösse konfigurierbar
* Kamera Upload auf Mobilgeräten
* Vorschau vor dem Absenden
* einzelne Seiten löschen oder neu sortieren
* automatische Bildrotation
* einfache Qualitätsprüfung
* Warnung bei zu unscharfem Bild
* Warnung bei abgeschnittenen Seiten

## 12.4 Dokumentenklassifikation

Die Klassifikation liefert:

* Hauptkategorie
* Unterkategorie
* Klassifikationssicherheit
* erkannte Sprache
* vermutete Relevanz
* erwartete Extraktionsfelder

Beispiel:

```json
{
  "category": "invoice",
  "subcategory": "health_insurance_premium",
  "language": "de",
  "confidence": 0.94,
  "requires_action": true,
  "potential_financial_impact": true
}
```

Die App soll keine Prozentwerte prominent für Nutzer anzeigen. Intern werden Sicherheitswerte benötigt, um unsichere Ergebnisse abzufangen.

## 12.5 Strukturierte Extraktion

Die Extraktion erfolgt in ein fest definiertes Datenschema.

Beispiel:

```json
{
  "document_title": "Prämienrechnung August 2026",
  "sender_name": "Beispiel Krankenkasse",
  "recipient_name": "Max Muster",
  "document_date": "2026-07-10",
  "due_date": "2026-07-31",
  "amount": {
    "value": 428.50,
    "currency": "CHF",
    "type": "payment_due"
  },
  "reference_number": "210000000003139471430009017",
  "account_or_iban": "CH0000000000000000000",
  "required_actions": [
    {
      "type": "pay",
      "description": "Rechnung bezahlen",
      "deadline": "2026-07-31"
    }
  ],
  "contact": {
    "name": "Kundendienst",
    "phone": "+41 00 000 00 00",
    "email": "kontakt@example.ch"
  },
  "recurrence": {
    "is_recurring": true,
    "frequency": "monthly",
    "starts_on": "2026-08-01"
  },
  "uncertainties": []
}
```

Alle Felder müssen optional sein. Ein Modell darf fehlende Angaben nicht erfinden.

## 12.6 Verständliche Erklärung

Die Erklärung wird aus den strukturierten Daten und den relevanten Textstellen erstellt.

Sie besteht aus:

* Kurzfassung
* Bedeutung
* notwendige Handlung
* Frist
* Betrag
* mögliche Konsequenz, nur wenn aus dem Dokument ableitbar
* offene Fragen
* Unsicherheiten

Die Erklärung soll verschiedene Darstellungsmodi unterstützen.

### Normal

Klare Alltagssprache ohne unnötige Fachbegriffe.

### Einfach

Kurze Sätze, wenige Informationen pro Abschnitt, klare Handlungsanweisung.

### Bevorzugte Sprache

Die Erklärung kann in einer vom Nutzer gewählten Sprache dargestellt werden.

Das Originaldokument bleibt unverändert. Übersetzung und Erklärung werden klar als generierte Hilfestellung gekennzeichnet.

## 12.7 Dokumentbasierter Chat

Der Nutzer kann Fragen zum geöffneten Dokument stellen.

Beispiele:

* Muss ich das bezahlen?
* Bis wann muss ich reagieren?
* Wo finde ich die Referenznummer?
* Ist das eine Mahnung?
* Welche Unterlagen fehlen?
* Was bedeutet Selbstbehalt?

Der Chat ist im MVP auf das aktuelle Dokument und die daraus extrahierten Daten beschränkt.

Er soll nicht als allgemeine Rechts oder Steuerberatung auftreten.

Antworten müssen nach Möglichkeit auf konkrete Stellen des Dokuments verweisen.

## 12.8 Aufgabenverwaltung

Jede Aufgabe enthält:

* Titel
* Beschreibung
* Status
* Priorität
* Fälligkeitsdatum
* optionalen Betrag
* verknüpftes Dokument
* Handlungsart
* Erstellungsquelle
* Abschlussdatum
* Notizen

Statuswerte:

* offen
* in_bearbeitung
* wartet_auf_antwort
* erledigt
* nicht_erforderlich
* überfällig

Handlungsarten:

* bezahlen
* prüfen
* antworten
* anrufen
* Formular ausfüllen
* Unterlagen senden
* Termin vereinbaren
* ablegen
* sonstiges

## 12.9 Erinnerungen

Eine Erinnerung enthält:

* verknüpfte Aufgabe
* Ausführungszeitpunkt
* Kanal
* Status
* Sendeversuche
* letzte Fehlermeldung
* Nutzerzeitzone

MVP Kanäle:

* In App Erinnerung
* E Mail Erinnerung

Push Benachrichtigungen können später ergänzt werden.

Standardlogik:

* erste Erinnerung 7 Tage vor Frist
* zweite Erinnerung 2 Tage vor Frist
* letzte Erinnerung am Fälligkeitstag
* tägliche Warnung nach Überschreitung nur bei kritischen Aufgaben und nur begrenzt

Der Nutzer kann Erinnerungen deaktivieren oder ändern.

## 12.10 Budgetmodul

Das Budgetmodul ist bewusst einfacher als eine klassische Finanz App.

Es beantwortet primär:

* Wie viel Geld kommt diesen Monat voraussichtlich rein?
* Welche festen Ausgaben gibt es?
* Welche zusätzlichen Zahlungen entstehen aus Dokumenten?
* Was bleibt voraussichtlich übrig?
* Welche Zahlung wird kritisch?
* Welche kommenden Monate verändern sich durch neue wiederkehrende Kosten?

### Budget Bestandteile

* regelmässige Einnahmen
* einmalige Einnahmen
* regelmässige Ausgaben
* einmalige Ausgaben
* dokumentbasierte Ausgaben
* dokumentbasierte Rückerstattungen
* frei verfügbarer Restbetrag

### Budget Kategorien

Initiale Kategorien:

* Wohnen
* Krankenkasse
* Versicherungen
* Steuern
* Mobilität
* Lebensmittel
* Kommunikation
* Gesundheit
* Schulden und Raten
* Freizeit
* Familie
* Bildung
* Sonstiges

Kategorien können später angepasst werden.

### Budget Status

Ein Budgetposten besitzt:

* geplant
* fällig
* bezahlt
* erhalten
* verschoben
* storniert

### Monatsübersicht

Die Monatsübersicht zeigt:

* erwartete Einnahmen
* feste Ausgaben
* zusätzliche Ausgaben aus Dokumenten
* erwartete Rückerstattungen
* verfügbaren Restbetrag
* offene fällige Beträge
* nächstes Einkommensdatum

### Vorschau

Der MVP zeigt mindestens:

* aktuellen Monat
* nächsten Monat
* übernächsten Monat

Die Vorschau basiert auf wiederkehrenden Budgetposten und bereits bekannten dokumentbasierten Verpflichtungen.

## 12.11 Finanzielle Warnungen

Warnungen sind Hinweise, keine Finanzberatung.

Beispiele:

### Negatives Monatsbudget

> Mit den aktuell geplanten Einnahmen und Ausgaben fehlen dir im August voraussichtlich CHF 180.00.

### Zahlung vor nächstem Einkommen

> Diese Rechnung ist vor deinem nächsten eingetragenen Einkommen fällig.

### Mehrere Zahlungen nahe beieinander

> Innerhalb von fünf Tagen sind drei Zahlungen mit insgesamt CHF 1'240.00 fällig.

### Neue wiederkehrende Belastung

> Diese Prämienänderung erhöht deine monatlichen Ausgaben ab September um CHF 38.00.

### Unvollständiges Budget

> Für diesen Monat fehlen noch Angaben zu deinen regelmässigen Einnahmen. Die Budgetprognose ist deshalb unvollständig.

Die App soll keine dramatischen Warnungen ausgeben, wenn die Datengrundlage unvollständig ist.

## 12.12 Verknüpfung zwischen Dokument und Budget

Jeder dokumentbasierte Budgetposten verweist auf das Ursprungsdokument.

Der Nutzer kann jederzeit sehen:

* woher der Betrag stammt
* welcher Text im Dokument dazu gehört
* welche Frist erkannt wurde
* ob die Angabe bestätigt wurde
* ob der Betrag bereits als bezahlt markiert wurde

Wenn ein Betrag im Dokument korrigiert wird, schlägt die App vor, den verknüpften Budgetposten ebenfalls zu aktualisieren.

## 12.13 Dashboard

Das Dashboard zeigt keine überladene Statistikseite.

Es priorisiert Handlungen.

Reihenfolge:

1. Kritische offene Fristen
2. Heute oder bald fällige Zahlungen
3. Dokumente mit unbestätigten Angaben
4. aktueller Budgetstatus
5. zuletzt bearbeitete Dokumente

Beispielkarten:

* Zwei Aufgaben sind diese Woche fällig
* Eine Rechnung ist überfällig
* Dein geplantes Restbudget beträgt CHF 312.40
* Bei einem Dokument ist das Datum unsicher
* Drei neue Dokumente wurden analysiert

## 12.14 Suche und Filter

MVP Suche:

* Dokumenttitel
* Absender
* Betrag
* Kategorie
* Status
* Zeitraum

Filter:

* offen
* erledigt
* mit Frist
* mit Betrag
* unbestätigt
* überfällig
* Dokumentkategorie

Eine komplexe Volltextsuche ist nicht notwendig, kann aber über die Datenbank vorbereitet werden.

## 13. Informationsarchitektur

Die Hauptnavigation auf Mobilgeräten besteht aus fünf Bereichen.

1. Start
2. Dokumente
3. Aufgaben
4. Budget
5. Profil

Eine zentrale Aktion zum Hinzufügen eines Dokuments ist jederzeit sichtbar.

### 13.1 Start

* offene Fristen
* nächster Schritt
* Budgetstatus
* unbestätigte Dokumente

### 13.2 Dokumente

* Dokumentliste
* Filter
* Upload
* Dokumentdetail
* Analyseergebnis
* Dokumentchat

### 13.3 Aufgaben

* offene Aufgaben
* Kalenderansicht optional später
* überfällige Aufgaben
* erledigte Aufgaben
* Aufgaben aus Dokumenten
* manuell erstellte Aufgaben

### 13.4 Budget

* Monatsübersicht
* Einnahmen
* Ausgaben
* dokumentbasierte Posten
* nächste Monate
* Budgeteinrichtung

### 13.5 Profil

* Sprache
* Darstellungsmodus
* Benachrichtigungen
* Datenschutz
* Konto
* Daten löschen

## 14. Empfohlene technische Architektur

## 14.1 Architekturprinzipien

Die Architektur soll:

* schnell entwickelbar sein
* mobile Nutzung priorisieren
* sensible Daten sauber trennen
* KI Anbieter austauschbar halten
* asynchrone Verarbeitung unterstützen
* nachvollziehbare Analyseergebnisse speichern
* spätere B2B Workspaces ermöglichen
* nicht unnötig komplex starten

## 14.2 Empfohlener Stack

### Frontend

* Next.js
* TypeScript
* React
* mobile first Oberfläche
* PWA Unterstützung
* serverseitige und clientseitige Komponenten klar getrennt
* i18n Vorbereitung
* responsives Design

### Backend

* Next.js Server Funktionen oder separate API Schicht
* Supabase Postgres
* Supabase Auth
* Supabase Storage
* Row Level Security
* Hintergrundjobs über eine Queue oder n8n
* strukturierte Logging Lösung

### KI Verarbeitung

* OCR oder multimodale Texterkennung
* Sprachmodell für Klassifikation, Extraktion und Erklärung
* JSON Schema Validierung
* Provider Abstraktion
* getrennte Prompts für unterschiedliche Verarbeitungsschritte

### Benachrichtigungen

* E Mail Provider
* In App Benachrichtigungen
* geplante Jobs für Erinnerungen

### Monitoring

* Fehlertracking
* Job Monitoring
* Audit Log
* Nutzungsmetriken
* KI Kosten Tracking

## 14.3 Rolle von n8n

n8n ist sinnvoll für:

* asynchrone Dokumentenverarbeitung
* Erinnerungsjobs
* E Mail Versand
* administrative Benachrichtigungen
* Wiederholungsversuche bei fehlgeschlagenen externen Diensten
* spätere Integrationen

n8n sollte nicht die alleinige Quelle der Geschäftslogik sein.

Kritische Zustände wie Dokumentstatus, Frist, Budgetposten und Nutzerbestätigung gehören in die Datenbank und in klar versionierten Anwendungscode.

Der Grund ist einfach:

* Workflows werden sonst schwer testbar
* Statusänderungen sind schwieriger nachvollziehbar
* Datenkonsistenz kann leiden
* spätere Entwickler müssen Logik an mehreren Orten suchen

Empfehlung:

* Kernlogik in Backend Services
* n8n für Orchestrierung und externe Abläufe
* Datenbank als einzige verlässliche Quelle des Zustands

## 14.4 Verarbeitungspipeline

Die Dokumentenverarbeitung erfolgt asynchron.

### Schritt 1, Upload

Die Datei wird in einem privaten Storage Bucket gespeichert.

Die Datenbank erstellt einen Dokumentdatensatz.

### Schritt 2, Vorverarbeitung

* Dateityp prüfen
* Dateigrösse prüfen
* Virenscan oder Sicherheitsprüfung
* Bild drehen
* Bildqualität bewerten
* Seiten in ein einheitliches Format bringen
* PDF Seiten extrahieren

### Schritt 3, Texterkennung

Das System extrahiert:

* Volltext
* Seitenstruktur
* Textblöcke
* Tabellenbereiche
* QR Daten, falls vorhanden
* erkannte Sprache

### Schritt 4, Klassifikation

Das System bestimmt Kategorie und Unterkategorie.

### Schritt 5, strukturierte Extraktion

Ein kategoriespezifisches Schema wird verwendet.

Eine Rechnung benötigt andere Felder als ein Versicherungsentscheid.

### Schritt 6, Validierung

Validierungen:

* Datumsformat
* Betrag und Währung
* Frist liegt nicht offensichtlich vor Dokumentdatum
* wiederkehrender Betrag plausibel markiert
* Referenznummer korrekt formatiert, sofern prüfbar
* Pflichtfelder je Kategorie
* Modellantwort entspricht JSON Schema
* keine Felder ohne Textgrundlage

### Schritt 7, Erklärung

Die Erklärung wird aus den bestätigten oder vorläufigen Extraktionsdaten erstellt.

### Schritt 8, Risikobewertung

Das System prüft:

* gibt es eine Frist
* ist die Frist nahe
* ist ein Betrag fällig
* ist die Datengrundlage unsicher
* würde der Betrag das Budget negativ machen
* ist wahrscheinlich eine Nutzerbestätigung nötig

### Schritt 9, Ergebnis speichern

Gespeichert werden:

* Rohtext
* strukturierte Extraktion
* Quellenstellen
* Modellversion
* Promptversion
* Sicherheitswerte
* Erklärung
* erkannte Aufgaben
* erkannte Budgetauswirkungen

### Schritt 10, Nutzerprüfung

Der Nutzer bestätigt oder korrigiert die relevanten Angaben.

Erst danach entstehen verbindliche Aufgaben und Budgetposten.

## 14.5 KI Verarbeitung in getrennten Schritten

Eine einzige grosse KI Anfrage für das gesamte Dokument ist für einen Prototyp möglich, aber für einen stabilen MVP nicht ideal.

Empfohlene Aufteilung:

1. Klassifikation
2. strukturierte Extraktion
3. Validierung
4. Erklärung
5. Aufgabenvorschlag
6. Budgetvorschlag
7. Dokumentchat

Vorteile:

* Fehler sind leichter auffindbar
* einzelne Schritte können wiederholt werden
* kategoriespezifische Prompts werden möglich
* Kosten können besser gemessen werden
* Modellanbieter können schrittweise ersetzt werden
* Sicherheitsregeln lassen sich gezielter anwenden

## 14.6 Provider Abstraktion

Die Anwendung soll KI und OCR Anbieter nicht direkt in der Benutzeroberfläche oder im Datenmodell verankern.

Beispiel Services:

```text
DocumentTextExtractor
DocumentClassifier
DocumentFieldExtractor
DocumentExplainer
DocumentQuestionAnswerer
TranslationService
```

Jeder Service erhält eine definierte Eingabe und liefert ein validiertes Ergebnis.

So kann später der Anbieter gewechselt werden, ohne die gesamte Anwendung umzubauen.

## 15. Datenmodell

## 15.1 users

Felder:

* id
* email
* display_name
* preferred_language
* explanation_mode
* timezone
* currency
* created_at
* updated_at
* deleted_at

## 15.2 workspaces

Felder:

* id
* type, personal oder organization
* name
* created_at
* updated_at

## 15.3 workspace_members

Felder:

* id
* workspace_id
* user_id
* role
* status
* created_at

MVP Rolle:

* owner

Spätere Rollen:

* member
* advisor
* case_manager
* organization_admin

## 15.4 documents

Felder:

* id
* workspace_id
* uploaded_by
* title
* original_filename
* storage_path
* mime_type
* page_count
* file_size
* document_status
* category
* subcategory
* detected_language
* document_date
* sender_name
* recipient_name
* requires_action
* contains_financial_impact
* analysis_confidence
* user_confirmed_at
* completed_at
* created_at
* updated_at
* deleted_at

## 15.5 document_pages

Felder:

* id
* document_id
* page_number
* image_storage_path
* extracted_text
* extraction_metadata
* quality_score
* created_at

## 15.6 document_analyses

Felder:

* id
* document_id
* analysis_version
* provider
* model
* prompt_version
* classification_result
* extraction_result
* validation_result
* explanation_result
* status
* started_at
* completed_at
* error_code
* error_message
* created_at

## 15.7 document_entities

Diese Tabelle speichert einzelne erkannte Werte mit Quellenbezug.

Felder:

* id
* document_id
* entity_type
* value_text
* value_json
* page_number
* source_text
* bounding_box
* confidence
* confirmed_by_user
* corrected_value
* created_at
* updated_at

Beispiele für `entity_type`:

* sender
* amount
* due_date
* document_date
* reference_number
* iban
* phone
* email
* required_action
* consequence
* period

## 15.8 tasks

Felder:

* id
* workspace_id
* document_id
* title
* description
* action_type
* priority
* status
* due_at
* amount
* currency
* created_by
* source
* completed_at
* created_at
* updated_at

## 15.9 reminders

Felder:

* id
* task_id
* workspace_id
* channel
* scheduled_at
* status
* sent_at
* failure_reason
* retry_count
* created_at
* updated_at

## 15.10 notifications

Felder:

* id
* user_id
* workspace_id
* type
* title
* message
* related_entity_type
* related_entity_id
* read_at
* created_at

## 15.11 budget_plans

Felder:

* id
* workspace_id
* month
* currency
* opening_balance
* expected_income
* expected_expenses
* projected_balance
* data_completeness
* created_at
* updated_at

Pro Workspace und Monat existiert ein Budgetplan.

## 15.12 budget_items

Felder:

* id
* workspace_id
* budget_plan_id
* document_id
* task_id
* item_type, income oder expense
* category
* title
* amount
* currency
* due_date
* expected_date
* status
* source, manual oder document
* is_recurring
* recurrence_rule
* recurrence_parent_id
* confirmed_by_user
* created_at
* updated_at
* deleted_at

## 15.13 recurring_items

Optional kann Wiederholung in einer eigenen Tabelle gespeichert werden.

Felder:

* id
* workspace_id
* item_type
* category
* title
* amount
* currency
* frequency
* day_of_month
* starts_on
* ends_on
* source_document_id
* active
* created_at
* updated_at

## 15.14 document_questions

Felder:

* id
* document_id
* user_id
* question
* answer
* cited_entities
* cited_pages
* provider
* model
* created_at

## 15.15 audit_events

Felder:

* id
* workspace_id
* user_id
* action
* entity_type
* entity_id
* metadata
* created_at

Beispiele:

* document_uploaded
* analysis_completed
* due_date_corrected
* amount_confirmed
* task_created
* reminder_sent
* budget_item_created
* document_deleted

## 16. API Struktur

Die API kann über Next.js Route Handler oder eine separate Backend Schicht umgesetzt werden.

## 16.1 Dokumente

```text
POST   /api/documents
GET    /api/documents
GET    /api/documents/{document_id}
DELETE /api/documents/{document_id}
POST   /api/documents/{document_id}/analyse
POST   /api/documents/{document_id}/confirm
POST   /api/documents/{document_id}/complete
POST   /api/documents/{document_id}/questions
```

## 16.2 Aufgaben

```text
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/{task_id}
POST   /api/tasks/{task_id}/complete
```

## 16.3 Erinnerungen

```text
GET    /api/reminders
POST   /api/reminders
PATCH  /api/reminders/{reminder_id}
DELETE /api/reminders/{reminder_id}
```

## 16.4 Budget

```text
GET    /api/budget/{year}/{month}
POST   /api/budget/items
PATCH  /api/budget/items/{item_id}
DELETE /api/budget/items/{item_id}
POST   /api/budget/items/{item_id}/mark_paid
POST   /api/budget/recalculate
```

## 16.5 Profil

```text
GET    /api/profile
PATCH  /api/profile
DELETE /api/profile
```

## 17. Beispiel für einen vollständigen Dokumentprozess

## 17.1 Ausgangslage

Der Nutzer lädt eine Mahnung über CHF 680.00 hoch.

Das Dokument enthält:

* ursprüngliche Rechnung CHF 650.00
* Mahngebühr CHF 30.00
* neue Zahlungsfrist 5. August 2026
* Hinweis auf weitere Schritte bei Nichtzahlung

## 17.2 Systemergebnis

### Dokumenttyp

Mahnung

### Erklärung

> Du hast eine Mahnung erhalten. Die ursprüngliche Rechnung wurde laut diesem Schreiben noch nicht bezahlt. Der neue Gesamtbetrag beträgt CHF 680.00. Darin sind CHF 30.00 Mahngebühren enthalten.

### Nächster Schritt

> Prüfe zuerst, ob du die ursprüngliche Rechnung bereits bezahlt hast. Wenn nicht, bezahle CHF 680.00 bis zum 5. August 2026 oder kontaktiere den Absender, falls du den Betrag nicht rechtzeitig bezahlen kannst.

### Aufgabe

* Mahnung prüfen und bezahlen
* fällig am 5. August 2026
* Priorität hoch

### Budgetauswirkung

Der August Budgetplan enthält vor dem Dokument:

* erwartete Einnahmen CHF 3'500.00
* geplante Ausgaben CHF 3'050.00
* verfügbar CHF 450.00

Nach Übernahme der Mahnung:

* zusätzliche Ausgabe CHF 680.00
* projizierter Restbetrag minus CHF 230.00

### Warnung

> Mit dieser Zahlung fehlen dir im August voraussichtlich CHF 230.00. Die App kennt möglicherweise noch nicht alle Einnahmen oder Änderungen. Prüfe dein Budget und kontaktiere den Absender frühzeitig, wenn eine rechtzeitige Zahlung nicht möglich ist.

### Nutzeraktionen

* Betrag bestätigen
* Frist bestätigen
* als bereits bezahlt markieren
* ins Budget übernehmen
* Erinnerung erstellen
* Kontakt notieren
* Frage zum Dokument stellen

## 18. Regeln für Zuverlässigkeit und Transparenz

## 18.1 Keine erfundenen Angaben

Wenn ein Datum, Betrag oder eine Handlung nicht eindeutig im Dokument enthalten ist, muss das Feld leer oder unsicher bleiben.

Verbotenes Verhalten:

* wahrscheinliche Frist als sichere Frist anzeigen
* aus allgemeinem Wissen eine Rechtsfolge erfinden
* eine Kündigungsfrist ableiten, die nicht im Dokument steht
* einen Betrag schätzen
* einen Absender raten

## 18.2 Quellenbezug

Wichtige Angaben sollen auf die relevante Dokumentstelle zurückführbar sein.

Beispiel:

> Fällig bis 31. Juli 2026

Darunter optional:

> Gefunden auf Seite 1, Abschnitt Zahlungsinformationen

## 18.3 Nutzerbestätigung

Folgende Felder benötigen vor automatischer Weiterverwendung eine Bestätigung, wenn die Sicherheit nicht hoch genug ist:

* Betrag
* Frist
* wiederkehrende Zahlung
* erforderliche Handlung
* Konsequenz
* Empfänger oder Absender bei ähnlichen Namen

## 18.4 Unsicherheit sichtbar machen

Nicht nur das Wort `unsicher` anzeigen, sondern erklären, was geprüft werden soll.

Schlecht:

> Frist unsicher.

Besser:

> Das System hat den 15. August als mögliches Datum erkannt, konnte aber nicht eindeutig feststellen, ob dies die Zahlungsfrist ist. Bitte prüfe den markierten Abschnitt im Original.

## 18.5 Kritische Inhalte

Bei folgenden Dokumenten soll die App besonders vorsichtig sein:

* gerichtliche Schreiben
* Betreibungsdokumente
* Kündigungen
* Einspracheentscheide
* Verfügungen mit Rechtsmittelbelehrung
* ausländerrechtliche Dokumente
* medizinische Entscheide
* Dokumente mit sehr kurzen Fristen

Der MVP kann diese Dokumente erkennen, soll aber bei komplexen Fällen klar empfehlen, eine zuständige Fachperson oder Beratungsstelle beizuziehen.

## 19. Prompt und Ausgabelogik

## 19.1 Systemregel für Extraktion

Das Modell erhält klare Regeln:

* Nutze ausschliesslich Informationen aus dem Dokument.
* Erfinde keine fehlenden Werte.
* Trenne explizite Angaben von Interpretationen.
* Gib für jedes kritische Feld eine Quelle an.
* Setze unbekannte Werte auf `null`.
* Kennzeichne widersprüchliche Angaben.
* Antworte ausschliesslich im vorgegebenen JSON Schema.

## 19.2 Systemregel für Erklärung

* Schreibe in der gewählten Sprache.
* Verwende kurze, konkrete Sätze.
* Erkläre Fachbegriffe.
* Beginne mit dem wichtigsten nächsten Schritt.
* Nenne nur Konsequenzen, die im Dokument stehen oder eindeutig daraus folgen.
* Weise auf Unsicherheit hin.
* Verwende keine Angst erzeugende Sprache.
* Gib keine verbindliche Rechts oder Steuerberatung.
* Unterscheide zwischen Information, Vermutung und Empfehlung.

## 19.3 Beispiel Erklärungsschema

```json
{
  "what_is_it": "Eine Mahnung für eine offene Rechnung.",
  "why_it_matters": "Der Absender verlangt die Zahlung eines offenen Betrags.",
  "what_to_do": [
    "Prüfe, ob du bereits bezahlt hast.",
    "Wenn nicht, bezahle den Gesamtbetrag bis zur Frist.",
    "Kontaktiere den Absender, wenn die Zahlung nicht möglich ist."
  ],
  "deadline": "2026-08-05",
  "amount": {
    "value": 680.00,
    "currency": "CHF"
  },
  "possible_consequence": "Im Schreiben werden weitere Schritte bei Nichtzahlung angekündigt.",
  "uncertainties": [],
  "recommended_task": {
    "title": "Mahnung prüfen und bezahlen",
    "priority": "high"
  }
}
```

## 20. Sicherheit und Datenschutz

Die App verarbeitet sehr sensible Informationen. Sicherheit ist deshalb kein späteres Zusatzprojekt.

## 20.1 Grundprinzipien

* Datenminimierung
* private Speicherung
* Zugriff nur für berechtigte Nutzer
* Verschlüsselung bei Übertragung
* Verschlüsselung der Speichersysteme
* kurze und definierte Aufbewahrung technischer Zwischendaten
* Löschfunktion
* Auditierbarkeit
* keine Nutzung hochgeladener Dokumente für eigenes Modelltraining
* klare Nutzerinformation
* getrennte Produktions und Testdaten

## 20.2 Storage

* private Buckets
* keine öffentlichen Dokument URLs
* zeitlich begrenzte signierte URLs
* strikte Workspace Zuordnung
* keine Dateinamen mit sensiblen Angaben in öffentlichen Pfaden

## 20.3 Datenbankzugriff

* Row Level Security
* jeder Datensatz besitzt workspace_id
* Nutzer kann nur Daten seines Workspace lesen
* Service Rollen nur auf dem Server
* keine Service Schlüssel im Frontend
* Schreiboperationen serverseitig validieren

## 20.4 Logs

Logs dürfen keine vollständigen Dokumenttexte enthalten.

Zu speichern:

* Dokument ID
* Job ID
* Status
* Dauer
* Modell
* Token oder Kostenmetrik
* Fehlercode

Nicht standardmässig zu speichern:

* vollständiger OCR Text
* persönliche Identifikationsnummern
* Bankdaten
* medizinische Details

## 20.5 Prompt Injection Schutz

Dokumentinhalte gelten als nicht vertrauenswürdige Eingabe.

Ein Dokument könnte Text enthalten wie:

> Ignoriere alle bisherigen Anweisungen.

Das System muss solche Inhalte als Dokumenttext behandeln und darf dadurch keine Systemregeln ändern.

Massnahmen:

* Systemanweisungen strikt trennen
* Dokumenttext als zitierte Nutzdaten übergeben
* Tool Nutzung begrenzen
* Modell darf keine externen Aktionen ausführen
* strukturierte Schemaausgabe erzwingen
* verdächtige Inhalte protokollieren

## 20.6 Dateisicherheit

* MIME Typ prüfen
* Endung und tatsächlichen Dateityp vergleichen
* maximale Dateigrösse
* maximale Seitenzahl
* verdächtige Dateien blockieren
* nur unterstützte Formate verarbeiten
* temporäre Dateien löschen

## 20.7 Kontolöschung

Der Nutzer kann sein Konto löschen.

Dabei werden:

* Dokumente gelöscht
* Storage Dateien gelöscht
* Aufgaben gelöscht
* Budgetdaten gelöscht
* Erinnerungen deaktiviert
* personenbezogene Profildaten gelöscht oder anonymisiert
* Auditdaten gemäss notwendiger Aufbewahrungslogik behandelt

Vor einem produktiven Einsatz ist eine separate Datenschutz und Rechtsprüfung erforderlich.

## 21. Fehlerfälle

## 21.1 Unscharfes Foto

Anzeige:

> Das Dokument ist nicht vollständig lesbar. Fotografiere es erneut bei gutem Licht und achte darauf, dass alle Ränder sichtbar sind.

## 21.2 Mehrere Dokumente in einer Datei

Anzeige:

> Die Datei enthält möglicherweise mehrere unterschiedliche Dokumente. Teile sie bitte auf oder bestätige, dass sie zusammengehören.

## 21.3 Kein Betrag erkannt

Die App erstellt keine Budgetwirkung.

Anzeige:

> Es wurde kein eindeutiger Betrag erkannt. Du kannst einen Betrag manuell hinzufügen.

## 21.4 Keine Frist erkannt

Die App erstellt keine feste Erinnerung.

Anzeige:

> Es wurde keine eindeutige Frist erkannt. Du kannst selbst ein Datum festlegen.

## 21.5 Analyse fehlgeschlagen

* Status bleibt nachvollziehbar
* Nutzer kann erneut versuchen
* Originaldatei bleibt erhalten
* technischer Fehler wird protokolliert
* keine doppelten Aufgaben oder Budgetposten

## 21.6 Externer Anbieter nicht verfügbar

* Job wird wiederholt
* Wiederholungen sind begrenzt
* Nutzer erhält eine verständliche Meldung
* Dokument bleibt in Warteschlange
* keine Verarbeitung geht verloren

## 21.7 Doppelte Dokumente

Die App prüft Dateihash und zentrale Merkmale.

Wenn ein wahrscheinliches Duplikat erkannt wird:

> Dieses Dokument wurde möglicherweise bereits am 12. Juli hochgeladen.

Der Nutzer kann trotzdem fortfahren.

## 22. Benachrichtigungslogik

## 22.1 Ereignisse

Benachrichtigungen entstehen bei:

* Analyse abgeschlossen
* Nutzerbestätigung erforderlich
* Frist nähert sich
* Aufgabe überfällig
* Budget wird negativ
* wiederkehrende Ausgabe beginnt
* Dokumentanalyse fehlgeschlagen

## 22.2 Ruhezeiten

Der Nutzer kann Ruhezeiten definieren.

Standard:

* keine E Mail in der Nacht
* kritische In App Hinweise bleiben sichtbar
* Erinnerungen berücksichtigen Europe/Zurich

## 22.3 Vermeidung von Benachrichtigungsüberlastung

Mehrere Hinweise können zusammengefasst werden.

Beispiel:

> Diese Woche sind drei Aufgaben fällig.

Statt drei ähnlicher E Mails innerhalb weniger Minuten.

## 23. UX Prinzipien

## 23.1 Ein nächster Schritt

Jede Ansicht soll eine klare Hauptaktion besitzen.

Beispiele:

* Dokument hochladen
* Angaben bestätigen
* Erinnerung erstellen
* Betrag übernehmen
* Aufgabe erledigen

## 23.2 Kein Fachjargon ohne Erklärung

Begriffe wie Verfügung, Franchise, Selbstbehalt, Einsprache oder provisorische Rechnung werden erklärt.

## 23.3 Mobile zuerst

Die wichtigsten Aktionen müssen mit einer Hand bedienbar sein.

* grosse Touch Flächen
* klare Buttons
* Kamera direkt erreichbar
* keine kleinen Tabellen
* keine komplexen Formulare
* schrittweise Eingabe

## 23.4 Original und Erklärung nebeneinander

Auf Mobilgeräten kann zwischen Original und Erklärung gewechselt werden.

Wichtige Stellen im Dokument können markiert werden.

## 23.5 Bestätigung statt blindem Vertrauen

Die App sagt nicht einfach:

> Wir haben alles erledigt.

Sie sagt:

> Wir haben diese Angaben erkannt. Bitte bestätige Betrag und Frist.

## 23.6 Progressive Offenlegung

Zuerst wird das Wichtigste angezeigt.

Details wie Referenznummer, Modellunsicherheit oder Quellenstellen sind aufklappbar.

## 24. MVP Screens

## 24.1 Registrierung

* E Mail
* Passwort oder Link Login
* Datenschutzbestätigung
* Sprache

## 24.2 Kurzes Onboarding

* Erklärungssprache
* normale oder einfache Sprache
* optional monatliches Einkommen
* optional nächstes Einkommensdatum

## 24.3 Dashboard

* Dokument hinzufügen
* offene Fristen
* Budgetrest
* unbestätigte Analysen

## 24.4 Upload

* Kamera
* Galerie
* PDF
* Seitenauswahl
* Vorschau

## 24.5 Analyse läuft

* Fortschrittsanzeige
* verständliche Statusmeldungen
* Zurück zur Startseite möglich

## 24.6 Dokumentergebnis

* Dokumenttyp
* Kurzfassung
* nächster Schritt
* Frist
* Betrag
* Budgetwirkung
* Unsicherheit
* Aktionen

## 24.7 Bestätigungsdialog

* Betrag
* Frist
* Handlungsart
* wiederkehrend
* bestätigen oder korrigieren

## 24.8 Aufgabenliste

* heute
* diese Woche
* später
* überfällig
* erledigt

## 24.9 Budgetübersicht

* Einnahmen
* fixe Ausgaben
* zusätzliche Dokumentausgaben
* Restbetrag
* kommende Monate

## 24.10 Budgetposten bearbeiten

* Titel
* Betrag
* Kategorie
* Datum
* wiederkehrend
* Status
* Dokumentquelle

## 24.11 Dokumentchat

* Fragefeld
* Vorschlagsfragen
* Antwort
* Quellenhinweise
* Warnung bei Unsicherheit

## 24.12 Profil und Datenschutz

* Sprache
* Erinnerungen
* Kontodaten
* Daten löschen
* Datenschutzinformationen

## 25. Zustandslogik

## 25.1 Dokumentzustand

```text
uploaded
processing
ready_for_review
confirmed
action_open
completed
archived
failed
```

## 25.2 Aufgabenzustand

```text
open
in_progress
waiting
completed
not_required
overdue
```

## 25.3 Budgetpostenzustand

```text
planned
due
paid
received
postponed
cancelled
```

## 25.4 Erinnerungszustand

```text
scheduled
sent
failed
cancelled
```

## 25.5 Wichtige Zustandsregeln

* Ein Dokument kann erst `confirmed` werden, wenn kritische Felder bestätigt sind.
* Eine Aufgabe wird nicht automatisch erledigt, nur weil ein Fälligkeitsdatum vergangen ist.
* Ein Budgetposten wird nicht automatisch als bezahlt markiert.
* Das Löschen eines Dokuments darf verknüpfte Aufgaben und Budgetposten nicht unbemerkt löschen.
* Bei Löschung muss der Nutzer wählen, ob verknüpfte Einträge bestehen bleiben.
* Eine erneute Analyse darf keine doppelten Aufgaben erzeugen.
* Änderungen an Betrag oder Frist müssen verknüpfte Einträge aktualisieren oder eine Bestätigung verlangen.

## 26. Geschäftsregeln für Budgetberechnung

## 26.1 Grundformel

```text
projizierter_restbetrag =
eröffnungsbestand
plus erwartete_einnahmen
minus erwartete_ausgaben
```

## 26.2 Datenvollständigkeit

Die App berechnet zusätzlich einen internen Vollständigkeitsstatus.

Beispiel:

* Einkommen vorhanden
* fixe Ausgaben vorhanden
* nächstes Einkommensdatum vorhanden
* offene Dokumentbeträge bestätigt

Wenn zentrale Angaben fehlen, wird das Ergebnis als Schätzung bezeichnet.

## 26.3 Wiederkehrende Einträge

Wiederkehrende Einträge erzeugen monatliche Instanzen.

Die Instanzen bleiben mit ihrer Ursprungsvorlage verknüpft.

Eine Änderung kann gelten:

* nur für diesen Monat
* ab diesem Monat
* für alle zukünftigen Monate

Diese Logik kann im ersten MVP vereinfacht werden, sollte im Datenmodell jedoch berücksichtigt sein.

## 26.4 Rückerstattungen

Eine erwartete Rückerstattung wird nicht wie bereits verfügbares Geld behandelt.

Status:

* erwartet
* bestätigt
* erhalten

Nur erhaltene Beträge können optional in den verfügbaren Kontostand einbezogen werden.

## 26.5 Unbekanntes Zahlungsdatum

Wenn ein Betrag vorhanden ist, aber kein Datum:

* Budgetposten wird als ungeplant vorgeschlagen
* Nutzer muss Monat oder Datum wählen
* keine kritische Fristerinnerung wird automatisch gesetzt

## 27. Qualitätsanforderungen an die Dokumentanalyse

## 27.1 Testkorpus

Für die Entwicklung wird ein anonymisiertes oder synthetisches Testkorpus erstellt.

Es enthält pro Kategorie:

* gut gescannte PDFs
* Handyfotos
* schräge Aufnahmen
* mehrseitige Dokumente
* deutsche Dokumente
* fremdsprachige Dokumente
* Dokumente mit mehreren Daten
* Dokumente ohne klare Frist
* Dokumente mit mehreren Beträgen
* Dokumente mit QR Rechnung
* Dokumente mit widersprüchlichen Angaben

## 27.2 Bewertete Felder

Für jedes Dokument werden Sollwerte hinterlegt:

* Kategorie
* Absender
* Datum
* Frist
* Betrag
* Währung
* Handlungsart
* Wiederholung
* Referenz
* Unsicherheiten

## 27.3 Fehlerklassen

Fehler werden getrennt gemessen:

* falsche Kategorie
* falscher Betrag
* falsche Frist
* erfundene Angabe
* fehlende Angabe
* falsche Handlung
* unklare Erklärung
* fehlender Unsicherheitshinweis
* falsche Budgetzuordnung

Erfundene Angaben und falsche Fristen gelten als besonders kritische Fehler.

## 28. Akzeptanzkriterien des MVP

## 28.1 Dokument Upload

* Nutzer kann ein PDF oder Foto hochladen.
* Upload funktioniert mobil und auf Desktop.
* Mehrseitige Dokumente bleiben in richtiger Reihenfolge.
* Nicht unterstützte Dateien werden verständlich abgelehnt.

## 28.2 Analyse

* Dokument erhält eine Kategorie oder einen klaren allgemeinen Fallback.
* erkannte Beträge, Fristen und Absender werden strukturiert gespeichert.
* fehlende Felder bleiben leer.
* Analysefehler sind wiederholbar.
* Nutzer sieht Unsicherheiten.

## 28.3 Erklärung

* Nutzer versteht den Dokumentzweck.
* nächster Schritt ist klar formuliert.
* Frist und Betrag sind prominent.
* generierte Erklärung wird nicht mit Originaltext verwechselt.
* einfache Sprache ist auswählbar.

## 28.4 Aufgaben

* Aufgabe kann aus Dokument erstellt werden.
* Nutzer kann Datum und Titel korrigieren.
* Aufgabe erscheint im Dashboard.
* Aufgabe kann erledigt werden.

## 28.5 Erinnerungen

* E Mail Erinnerung wird zum geplanten Zeitpunkt erzeugt.
* Zeitzone wird korrekt berücksichtigt.
* erledigte Aufgaben lösen keine weiteren Erinnerungen aus.
* fehlgeschlagene Sendungen werden protokolliert.

## 28.6 Budget

* Nutzer kann Einnahmen und Ausgaben manuell erfassen.
* Dokumentbetrag kann übernommen werden.
* Monatsrest wird neu berechnet.
* wiederkehrender Betrag kann für Folgemonate angelegt werden.
* Budget weist auf unvollständige Daten hin.

## 28.7 Sicherheit

* Nutzer sieht nur Daten seines Workspace.
* Dokumente sind nicht öffentlich erreichbar.
* Löschung entfernt Dokumentdatei und Daten gemäss Löschlogik.
* sensible Inhalte erscheinen nicht in normalen Logs.
* Service Schlüssel sind nicht im Client enthalten.

## 29. Technische Modulstruktur

Eine mögliche Struktur:

```text
src
  app
    auth
    dashboard
    documents
    tasks
    budget
    settings
    api
  components
    documents
    tasks
    budget
    common
  modules
    auth
    workspaces
    documents
      upload
      preprocessing
      extraction
      classification
      explanation
      confirmation
    tasks
    reminders
    budget
    notifications
    audit
  services
    storage
    database
    ai
    ocr
    email
    queue
  schemas
    document
    extraction
    task
    budget
  jobs
    analyse_document
    send_reminder
    generate_recurring_items
    recalculate_budget
  lib
    security
    validation
    observability
    i18n
```

## 30. Hintergrundjobs

## 30.1 analyse_document

Eingabe:

* document_id

Ablauf:

1. Dokument sperren
2. Status aktualisieren
3. Seiten vorbereiten
4. Text extrahieren
5. Kategorie bestimmen
6. Felder extrahieren
7. Ergebnis validieren
8. Erklärung erstellen
9. Vorschläge für Aufgabe und Budget erstellen
10. Status auf `ready_for_review` setzen
11. Nutzer benachrichtigen

## 30.2 send_reminder

Eingabe:

* reminder_id

Ablauf:

1. Erinnerung laden
2. Berechtigung und Aufgabenstatus prüfen
3. bei erledigter Aufgabe abbrechen
4. Nachricht erzeugen
5. senden
6. Status speichern
7. bei Fehler begrenzt erneut versuchen

## 30.3 generate_recurring_items

Ablauf:

* aktive Vorlagen prüfen
* fehlende Monatsinstanzen erzeugen
* Duplikate verhindern
* Budget neu berechnen

## 30.4 recalculate_budget

Auslöser:

* Budgetposten erstellt
* Betrag geändert
* Status geändert
* wiederkehrender Eintrag erzeugt
* Dokumentbetrag bestätigt

Ergebnis:

* erwartete Einnahmen
* erwartete Ausgaben
* projizierter Restbetrag
* Warnungen
* Vollständigkeitsstatus

## 31. Ereignismodell

Sinnvolle interne Ereignisse:

```text
document.uploaded
document.analysis_started
document.analysis_completed
document.analysis_failed
document.confirmed
document.completed
task.created
task.updated
task.completed
task.overdue
reminder.scheduled
reminder.sent
reminder.failed
budget_item.created
budget_item.updated
budget.recalculated
budget.warning_created
```

Ereignisse erleichtern spätere Integrationen und Auditierung.

## 32. Analytik für Produktvalidierung

Es sollen keine unnötig sensiblen Inhalte in der Analytik landen.

Zu messen:

* Registrierung abgeschlossen
* erstes Dokument hochgeladen
* Analyse erfolgreich
* Analyse korrigiert
* Aufgabe erstellt
* Erinnerung aktiviert
* Betrag ins Budget übernommen
* Aufgabe erledigt
* Dokumentchat genutzt
* Analyse abgebrochen
* Konto gelöscht

Wichtige Produktfragen:

* Versteht der Nutzer nach der Analyse den nächsten Schritt?
* Welche Felder werden häufig korrigiert?
* Welche Dokumenttypen schlagen häufig fehl?
* Werden Erinnerungen tatsächlich genutzt?
* Werden Dokumentbeträge ins Budget übernommen?
* Führt die App zu erledigten Aufgaben?
* An welcher Stelle bricht der Nutzer ab?

## 33. Administratives internes Dashboard

Für den Betrieb ist ein kleines internes Dashboard sinnvoll.

Funktionen:

* fehlgeschlagene Analysejobs
* Verarbeitungsdauer
* Kosten pro Dokument
* Anzahl Dokumente pro Kategorie
* Nutzerkorrekturen
* häufige Fehlerfelder
* Versandfehler bei Erinnerungen
* anonymisierte Qualitätsmetriken
* Modell und Promptversionen

Kein Zugriff auf Dokumentinhalte ohne klar geregelten Supportprozess.

## 34. Entwicklungsreihenfolge

## 34.1 Fundament

* Projektstruktur
* Auth
* Workspaces
* Datenbank
* Row Level Security
* Storage
* Upload
* Auditgrundlage

## 34.2 Dokumentverarbeitung

* PDF und Bildvorbereitung
* OCR oder multimodale Extraktion
* Klassifikation
* strukturierte Extraktion
* JSON Validierung
* Analyse Status
* Fehlerbehandlung

## 34.3 Ergebnis und Bestätigung

* Ergebnisansicht
* einfache Erklärung
* Quellenstellen
* Unsicherheiten
* Korrektur und Bestätigung

## 34.4 Aufgaben und Erinnerungen

* Aufgabenerstellung
* Aufgabenliste
* Fälligkeiten
* E Mail Erinnerung
* Abschlusslogik

## 34.5 Budget

* manuelle Einnahmen
* manuelle Ausgaben
* Monatsansicht
* Dokumentübernahme
* wiederkehrende Einträge
* Warnlogik

## 34.6 Verbindung der Module

* Dokument erzeugt Aufgabe
* Dokument erzeugt Budgetvorschlag
* Aufgabe und Budgetposten bleiben synchron
* Dashboard priorisiert kritische Fälle
* Abschluss aktualisiert alle verbundenen Daten

## 34.7 Dokumentchat und Mehrsprachigkeit

* Fragen zum Dokument
* einfache Sprache
* bevorzugte Erklärungssprache
* Quellenbezug

## 34.8 Qualität und Pilot

* Testkorpus
* Fehleranalyse
* Korrekturschleifen
* Nutzertests
* Datenschutzprüfung
* Pilotbetrieb

## 35. Kritische Produktentscheidungen

## 35.1 Kein vollständiger Finanztracker

Der MVP soll nicht jede kleine Ausgabe erfassen.

Das Budget ist ein Planungs und Warnsystem, kein Kontoersatz.

Dadurch bleibt der Nutzen klar:

* wichtige Verpflichtungen erkennen
* kommende Monate planen
* finanzielle Engpässe früh sehen

## 35.2 Keine Bankanbindung

Die direkte Bankanbindung wird bewusst weggelassen.

Vorteile:

* weniger Integrationsaufwand
* weniger Sicherheitsrisiko
* schnellerer MVP
* einfachere Positionierung
* Fokus auf Dokumente und Handlungen

Nachteile:

* bezahlte Rechnungen werden nicht automatisch erkannt
* Nutzer muss Status manuell aktualisieren
* Budget basiert auf Planung statt auf Kontobewegungen

Für den MVP ist dieser Kompromiss sinnvoll.

## 35.3 Keine automatische Aktion nach aussen

Die App darf im MVP keine Zahlung auslösen, kein Formular einreichen und keine Nachricht an eine Behörde senden.

Sie bereitet Handlungen vor und erinnert den Nutzer.

Dadurch bleiben Kontrolle und Verantwortung beim Nutzer.

## 35.4 Struktur vor Chat

Der Chat ist eine Zusatzfunktion.

Der Hauptnutzen entsteht durch strukturierte Informationen:

* Betrag
* Frist
* Handlung
* Aufgabe
* Erinnerung
* Budgetwirkung

Ein reiner Chat würde das Produkt zu wenig von allgemeinen KI Werkzeugen unterscheiden.

## 35.5 Menschliche Bestätigung vor kritischen Folgen

Je höher das Risiko eines Fehlers, desto stärker muss die Nutzerbestätigung sein.

Besonders kritisch:

* Frist
* Betrag
* wiederkehrende Zahlung
* rechtliche Konsequenz
* Zahlungsstatus
* automatische Erinnerung

## 36. Spätere Erweiterungen

Nicht für den ersten MVP, aber architektonisch möglich:

### 36.1 Export

* PDF Übersicht
* CSV Budget
* Dokument und Aufgabenbericht
* Export für Beratungsgespräch
* Monatsübersicht

### 36.2 Organisationsportal

* Organisationen
* Fallzuweisung
* betreute Nutzer
* Rollen und Rechte
* Freigaben
* gemeinsame Aufgaben
* Notizen
* sichere Nachrichten
* Organisationsstatistiken

### 36.3 Fachpersonen

* Dokument an Beratungsstelle weitergeben
* Fachprüfung anfordern
* Kommentar durch Sozialarbeitende
* Eskalation bei kritischen Dokumenten

### 36.4 Kommunikation

* Antwortentwurf
* E Mail Entwurf
* Formularhilfe
* Checkliste benötigter Unterlagen
* Gesprächsvorbereitung für Behörde oder Versicherung

### 36.5 Kalender

* Kalenderexport
* Google Calendar
* Apple Calendar
* Outlook
* Terminbuchung

### 36.6 Erweiterte Finanzen

* Export
* Kontostand manuell
* Zahlungsplan
* Raten
* mehrere Haushaltsmitglieder
* mehrere Währungen
* freiwillige Bankanbindung in späterer Phase

### 36.7 Dokumenthistorie

* Prämienvergleich
* Mietzinsentwicklung
* Steuerzahlungen pro Jahr
* wiederkehrende Absender
* Erkennung von Änderungen gegenüber Vorjahresdokumenten

### 36.8 Sprach und Integrationshilfe

* vollständige UI Übersetzungen
* Vorlesefunktion
* Sprachaufnahme
* Erklärung in Muttersprache
* zweisprachige Ansicht
* Piktogramme
* Betreuungspersonenmodus

## 37. Risiken

## 37.1 Zu breiter Produktumfang

Risiko:

Das Produkt versucht gleichzeitig Dokumentenmanagement, Übersetzung, Rechtsberatung, Budget App, Sozialdienst Software und Chatbot zu sein.

Gegenmassnahme:

Der MVP bleibt auf dem Kernprozess:

> Dokument hochladen, verstehen, bestätigen, Aufgabe erstellen, Frist erinnern, Budgetwirkung einplanen.

## 37.2 Falsche Fristen oder Beträge

Risiko:

Ein KI Fehler kann direkte negative Folgen haben.

Gegenmassnahmen:

* Quellenbezug
* strukturierte Validierung
* Nutzerbestätigung
* Unsicherheitsanzeige
* Testkorpus
* kategoriespezifische Regeln
* keine automatische Aussenaktion

## 37.3 Unvollständiges Budget

Risiko:

Die App zeigt einen Restbetrag, obwohl wichtige Einnahmen oder Ausgaben fehlen.

Gegenmassnahmen:

* Vollständigkeitsanzeige
* klare Bezeichnung als Prognose
* fehlende Daten sichtbar machen
* keine absolute Sicherheit suggerieren

## 37.4 Sensible Daten

Risiko:

Dokumente enthalten Gesundheits, Steuer, Lohn und Versicherungsdaten.

Gegenmassnahmen:

* private Speicherung
* Zugriffskontrolle
* minimale Logs
* Löschfunktion
* sichere Anbieter
* klare Datenschutzprüfung
* keine Trainingsnutzung

## 37.5 Abhängigkeit von KI Anbietern

Risiko:

Kosten, Qualität oder Verfügbarkeit verändern sich.

Gegenmassnahmen:

* Provider Abstraktion
* Modellversionen speichern
* feste JSON Schemas
* Testkorpus
* austauschbare Services
* Kosten Monitoring

## 37.6 Fehlende Zahlungsbestätigung

Risiko:

Ohne Bankanbindung weiss die App nicht, ob bezahlt wurde.

Gegenmassnahmen:

* einfache Aktion `als bezahlt markieren`
* Erinnerung nach Fälligkeit
* Abschlussfrage
* später optionaler Export oder Kontoabgleich

## 38. Empfohlener Pilot

Der erste Pilot sollte nicht mit beliebigen Nutzern starten.

Geeignet sind Personen, die:

* regelmässig offizielle Dokumente erhalten
* bereit sind, erkannte Angaben zu prüfen
* unterschiedliche Dokumentarten mitbringen
* konkrete Rückmeldung zur Verständlichkeit geben
* den Budgetteil tatsächlich nutzen

Zusätzlich ist ein kleiner Pilot mit einer Arbeitsintegration oder Beratungsstelle sinnvoll, aber erst nachdem der private Kernprozess stabil funktioniert.

Die Organisation sollte zunächst nicht mit einem vollständigen Adminportal ausgestattet werden.

Stattdessen kann beobachtet werden:

* welche Dokumente häufig auftreten
* welche Erklärungen unverständlich bleiben
* welche Sprachen gebraucht werden
* welche Aufgaben Nutzer nicht selbst abschliessen
* wann eine Fachperson notwendig ist
* welche Export oder Zusammenarbeitsfunktionen später relevant werden

## 39. Pilotfragen

Nach jeder Dokumentanalyse können wenige, gezielte Fragen gestellt werden.

* Hast du verstanden, worum es geht?
* Ist der nächste Schritt klar?
* Stimmen Betrag und Frist?
* War die Erklärung zu kompliziert?
* Hast du den Betrag ins Budget übernommen?
* Konntest du die Aufgabe erledigen?
* Wo brauchtest du trotzdem Hilfe?

Die Rückmeldungen sollen mit Dokumentkategorie und Analyseversion verbunden werden, ohne sensible Inhalte unnötig in Analysesysteme zu übertragen.

## 40. Definition des ersten marktfähigen MVP

Der MVP ist bereit für einen kontrollierten Pilot, wenn folgende Kette zuverlässig funktioniert:

1. Nutzer erstellt ein Konto.
2. Nutzer lädt ein Bild oder PDF hoch.
3. System erkennt Text und Dokumentkategorie.
4. System extrahiert Absender, Betrag, Frist und Handlung, sofern vorhanden.
5. System erstellt eine verständliche Erklärung.
6. Nutzer bestätigt oder korrigiert die Angaben.
7. Nutzer erstellt eine Aufgabe und Erinnerung.
8. Nutzer übernimmt den Betrag ins Budget.
9. System berechnet die Monatsauswirkung.
10. Nutzer markiert die Aufgabe und Zahlung später als erledigt.
11. Alle Schritte sind nachvollziehbar, sicher und ohne doppelte Einträge.
12. Unsichere Angaben werden sichtbar und nicht als Fakten dargestellt.

## 41. Kurzfassung für das Entwicklungsteam

Der Admin Copilot ist eine mobile first Webanwendung für administrative Dokumente.

Der Nutzer lädt einen Brief oder eine Rechnung hoch.

Die Anwendung:

1. erkennt den Dokumenttyp
2. extrahiert wichtige Angaben
3. erklärt den Inhalt verständlich
4. erkennt notwendige Handlungen
5. erstellt Aufgaben und Erinnerungen
6. übernimmt finanzielle Auswirkungen in ein einfaches Budget
7. warnt bei Fristen und möglichen Budgetengpässen

Der erste MVP besitzt keine Bankanbindung, führt keine Zahlungen aus und kommuniziert nicht automatisch mit Behörden.

Die wichtigste technische Anforderung ist nicht nur eine gute KI Antwort, sondern ein zuverlässiger strukturierter Prozess mit Quellenbezug, Nutzerbestätigung, Statusverwaltung, Datenkonsistenz und sauberer Trennung sensibler Daten.

## 42. Finale Produktlogik in einem Satz

> Aus jedem schwierigen Dokument wird eine verständliche Erklärung, ein klarer nächster Schritt, eine verlässliche Erinnerung und eine sichtbare Auswirkung auf das persönliche Budget.
