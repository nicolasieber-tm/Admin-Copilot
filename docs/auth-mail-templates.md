# Auth-Mail-Templates (deutsch, Resend-SMTP)

Einzufügen im Supabase-Dashboard unter **Authentication → Emails → Templates**:
pro Template den **Subject** ins Betreff-Feld und den **HTML-Block** in den
Nachrichtentext (Quelltext-Ansicht `<>`). Die Platzhalter wie
`{{ .ConfirmationURL }}` ersetzt Supabase beim Versand automatisch.

Absender (SMTP-Einstellungen): `konto@admin-pilot.trendingmedia.ch`,
Anzeigename «Admin Copilot».

---

## 1 · Confirm sign up (Registrierung bestätigen)

**Subject:** `Bestätige deine E-Mail-Adresse – Admin Copilot`

```html
<html lang="de">
  <body style="margin:0; padding:24px; background:#f4f6f8; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#17222b;">
    <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden;">
      <div style="background:#0a3a4a; color:#ffffff; padding:20px 24px; font-size:15px; font-weight:700;">Admin Copilot</div>
      <div style="padding:24px;">
        <p style="margin:0 0 6px; font-size:17px; font-weight:600; color:#17222b;">Willkommen beim Admin Copilot!</p>
        <p style="margin:0 0 20px; font-size:14px; line-height:1.6; color:#5c6b78;">Schön, bist du da. Bestätige deine E-Mail-Adresse, um loszulegen &ndash; danach kannst du deinen ersten Brief scannen.</p>
        <a href="{{ .ConfirmationURL }}" style="display:inline-block; background:#0e7490; color:#ffffff; text-decoration:none; border-radius:999px; padding:11px 22px; font-size:14px; font-weight:600;">E-Mail-Adresse bestätigen</a>
        <p style="margin:20px 0 0; font-size:12px; line-height:1.6; color:#8a969e;">Funktioniert der Knopf nicht? Kopiere diesen Link in deinen Browser:<br /><span style="word-break:break-all; color:#0e7490;">{{ .ConfirmationURL }}</span></p>
      </div>
      <div style="padding:16px 24px; border-top:1px solid #eef1f2; font-size:12px; line-height:1.6; color:#8a969e;">Du erhältst diese E-Mail, weil sich jemand mit dieser Adresse beim Admin Copilot registriert hat. Warst du das nicht, kannst du diese E-Mail ignorieren.</div>
    </div>
  </body>
</html>
```

---

## 2 · Magic Link (Anmelde-Link)

**Subject:** `Dein Anmelde-Link – Admin Copilot`

```html
<html lang="de">
  <body style="margin:0; padding:24px; background:#f4f6f8; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#17222b;">
    <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden;">
      <div style="background:#0a3a4a; color:#ffffff; padding:20px 24px; font-size:15px; font-weight:700;">Admin Copilot</div>
      <div style="padding:24px;">
        <p style="margin:0 0 6px; font-size:17px; font-weight:600; color:#17222b;">Dein Anmelde-Link</p>
        <p style="margin:0 0 20px; font-size:14px; line-height:1.6; color:#5c6b78;">Mit einem Klick bist du angemeldet &ndash; ganz ohne Passwort. Der Link ist nur kurze Zeit gültig.</p>
        <a href="{{ .ConfirmationURL }}" style="display:inline-block; background:#0e7490; color:#ffffff; text-decoration:none; border-radius:999px; padding:11px 22px; font-size:14px; font-weight:600;">Jetzt anmelden</a>
        <p style="margin:20px 0 0; font-size:12px; line-height:1.6; color:#8a969e;">Funktioniert der Knopf nicht? Kopiere diesen Link in deinen Browser:<br /><span style="word-break:break-all; color:#0e7490;">{{ .ConfirmationURL }}</span></p>
      </div>
      <div style="padding:16px 24px; border-top:1px solid #eef1f2; font-size:12px; line-height:1.6; color:#8a969e;">Du erhältst diese E-Mail, weil ein Anmelde-Link für den Admin Copilot angefordert wurde. Warst du das nicht, kannst du diese E-Mail ignorieren.</div>
    </div>
  </body>
</html>
```

---

## 3 · Reset Password (Passwort zurücksetzen)

**Subject:** `Passwort zurücksetzen – Admin Copilot`

```html
<html lang="de">
  <body style="margin:0; padding:24px; background:#f4f6f8; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#17222b;">
    <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden;">
      <div style="background:#0a3a4a; color:#ffffff; padding:20px 24px; font-size:15px; font-weight:700;">Admin Copilot</div>
      <div style="padding:24px;">
        <p style="margin:0 0 6px; font-size:17px; font-weight:600; color:#17222b;">Passwort zurücksetzen</p>
        <p style="margin:0 0 20px; font-size:14px; line-height:1.6; color:#5c6b78;">Du hast angefordert, dein Passwort zurückzusetzen. Klicke auf den Knopf und lege ein neues fest.</p>
        <a href="{{ .ConfirmationURL }}" style="display:inline-block; background:#0e7490; color:#ffffff; text-decoration:none; border-radius:999px; padding:11px 22px; font-size:14px; font-weight:600;">Neues Passwort festlegen</a>
        <p style="margin:20px 0 0; font-size:12px; line-height:1.6; color:#8a969e;">Funktioniert der Knopf nicht? Kopiere diesen Link in deinen Browser:<br /><span style="word-break:break-all; color:#0e7490;">{{ .ConfirmationURL }}</span></p>
      </div>
      <div style="padding:16px 24px; border-top:1px solid #eef1f2; font-size:12px; line-height:1.6; color:#8a969e;">Du erhältst diese E-Mail, weil das Zurücksetzen des Passworts für dein Admin-Copilot-Konto angefordert wurde. Warst du das nicht, kannst du diese E-Mail ignorieren &ndash; dein Passwort bleibt unverändert.</div>
    </div>
  </body>
</html>
```

---

## 4 · Change Email Address (Neue E-Mail-Adresse bestätigen)

**Subject:** `Neue E-Mail-Adresse bestätigen – Admin Copilot`

```html
<html lang="de">
  <body style="margin:0; padding:24px; background:#f4f6f8; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#17222b;">
    <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden;">
      <div style="background:#0a3a4a; color:#ffffff; padding:20px 24px; font-size:15px; font-weight:700;">Admin Copilot</div>
      <div style="padding:24px;">
        <p style="margin:0 0 6px; font-size:17px; font-weight:600; color:#17222b;">Neue E-Mail-Adresse bestätigen</p>
        <p style="margin:0 0 20px; font-size:14px; line-height:1.6; color:#5c6b78;">Du möchtest die E-Mail-Adresse deines Kontos zu {{ .NewEmail }} ändern. Bestätige die neue Adresse mit einem Klick.</p>
        <a href="{{ .ConfirmationURL }}" style="display:inline-block; background:#0e7490; color:#ffffff; text-decoration:none; border-radius:999px; padding:11px 22px; font-size:14px; font-weight:600;">Neue Adresse bestätigen</a>
        <p style="margin:20px 0 0; font-size:12px; line-height:1.6; color:#8a969e;">Funktioniert der Knopf nicht? Kopiere diesen Link in deinen Browser:<br /><span style="word-break:break-all; color:#0e7490;">{{ .ConfirmationURL }}</span></p>
      </div>
      <div style="padding:16px 24px; border-top:1px solid #eef1f2; font-size:12px; line-height:1.6; color:#8a969e;">Du erhältst diese E-Mail, weil eine Änderung der E-Mail-Adresse deines Admin-Copilot-Kontos angefordert wurde. Warst du das nicht, kannst du diese E-Mail ignorieren.</div>
    </div>
  </body>
</html>
```
