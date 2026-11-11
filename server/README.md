# Moduł rejestracji H2O!dolanów — prototyp

Działający prototyp warstwy serwerowej do podstrony konferencji: przyjmowanie zgłoszeń,
baza, dwa e-maile automatyczne, panel zgłoszeń z eksportem CSV i zamykaniem rejestracji.
Powstał po to, żeby pokazać i przetestować **kontrakt** z OPZ 4.8, a nie żeby iść nim na produkcję
bez przeglądu (patrz „Ograniczenia” na końcu).

Zero zależności runtime: Node.js + wbudowane `node:sqlite`, `node:http`, `node:crypto`.

---

## 1. Uruchomienie

Wymagania: **Node.js ≥ 22.5** (`node:sqlite`), testowane na Node 24.

```bash
npm start           # z katalogu głównego repozytorium
# podstrona: http://127.0.0.1:8787/
# panel:     http://127.0.0.1:8787/admin   (hasło demo: demo-admin)
# health:    http://127.0.0.1:8787/api/health
```

Testy (z katalogu głównego repozytorium):

```bash
npm test            # node --test "tests/*.test.mjs" — API, panel, statyka, bezpieczeństwo
```

Baza i skrzynka powstają same w `server/var/`:

```
server/var/
├── registrations.sqlite      # zgłoszenia, ustawienia, log audytu (WAL)
└── outbox/*.eml              # wiadomości z transportu "file"
```

`server/var/` nie trafia do repozytorium. Usunięcie katalogu = czysta baza.

---

## 2. Konfiguracja

Wszystko przez zmienne środowiskowe — ten sam kod działa lokalnie i na serwerze urzędu.

| Zmienna | Domyślnie | Znaczenie |
| --- | --- | --- |
| `HOST` / `PORT` | `127.0.0.1` / `8787` | nasłuch; na produkcji za reverse proxy zostaw `127.0.0.1` |
| `H2_VAR_DIR` | `server/var` | katalog na bazę i outbox |
| `H2_DB_FILE` | `$H2_VAR_DIR/registrations.sqlite` | ścieżka bazy, jeśli ma leżeć osobno |
| `H2_ADMIN_PASSWORD` | `demo-admin` | hasło panelu; **bez tej zmiennej jest tryb demo** i panel to wypisze |
| `H2_SESSION_TTL_MS` | `28800000` (8 h) | ważność sesji panelu |
| `H2_MIN_FILL_MS` | `2000` | minimalny czas wypełniania formularza (time-gate) |
| `H2_IP_SALT` | `h2odolanow-proto` | sól do skrótu IP w logu; zmień przed wdrożeniem |
| `H2_MAIL_TRANSPORT` | `file` | `file` (pliki `.eml`) albo `smtp` |
| `H2_MAIL_FROM` | `H2O!dolanów <no-reply@odolanow.pl>` | nadawca |
| `H2_ORGANIZER_EMAIL` | `sekretariat@odolanow.pl` | odbiorcy powiadomień, po przecinku |
| `H2_SMTP_URL` | — | np. `smtps://user:pass@smtp.odolanow.pl:465` |

Przykład uruchomienia „jak na produkcji, ale lokalnie”:

```bash
H2_ADMIN_PASSWORD='długie-hasło' \
H2_IP_SALT="$(openssl rand -hex 16)" \
H2_MAIL_TRANSPORT=file \
npm start
```
---

## 3. API publiczne

### `GET /api/health`

```json
{ "ok": true, "service": "h2odolanow-registration", "version": "0.1.0", "mail": "file" }
```

Po tym adresie frontend rozpoznaje, że działa z backendem (żywy formularz), a nie w trybie demo.

### `GET /api/registration-status`

```json
{
  "ok": true,
  "open": true,
  "event": {
    "name": "H2O!dolanów",
    "dateLabel": "27–28 kwietnia 2027",
    "place": "Klaster Energii Odolanów–Przygodzice–Sulmierzyce",
    "contactEmail": "sekretariat@odolanow.pl",
    "contactPhone": "62 733 15 81"
  }
}
```

### `POST /api/registrations`

Przyjmuje `application/json` lub `application/x-www-form-urlencoded`
(typ formularza z `FormData` też przechodzi). Pola:

| Pole | Wymagane | Uwagi |
| --- | --- | --- |
| `name` | tak | min. 3 znaki, musi zawierać literę |
| `organization` | tak | min. 2 znaki |
| `position` | nie | do 120 znaków |
| `email` | tak | unikalny w bazie (bez rozróżniania wielkości liter) |
| `phone` | tak | 9–15 cyfr po odfiltrowaniu separatorów |
| `city` | nie | do 80 znaków |
| `type` | nie | `uczestnik` (domyślnie), `prelegent`, `partner`, `media` |
| `notes` | nie | do 2000 znaków |
| `consent_rodo` | tak | `true` / `on` / `1` |
| `consent_contact` | nie | zgoda marketingowa |
| `website` | — | honeypot; wypełniony = 202 bez zapisu |
| `form_loaded_at` | nie | ISO 8601; różnica < `H2_MIN_FILL_MS` = 400 `too_fast` |

Odpowiedzi:

| Kod | `error` | Kiedy | Reakcja frontendu |
| --- | --- | --- | --- |
| `201` | — | zapisane, e-maile wysłane (`mail.participant`, `mail.organizer`) | komunikat + reset formularza |
| `202` | — | honeypot wypełniony; celowo udajemy sukces | to samo co 201 (bot nie wie) |
| `400` | `validation` | `errors` per pole: `name`, `organization`, `email`, `phone`, `type`, `consent_rodo` | komunikaty przy polach |
| `400` | `too_fast` | formularz wysłany zbyt szybko | komunikat „spróbuj ponownie” |
| `409` | `duplicate` | e-mail już zapisany | komunikat + fokus na e-mail |
| `429` | `rate_limited` | 5 zgłoszeń / 10 min z jednego IP | „spróbuj za kilka minut” |
| `503` | `registration_closed` | rejestracja zamknięta w panelu | komunikat z kontaktem |
| `413` | — | ciało żądania > 64 KB | — |
| `500` | `server_error` | błąd serwera | komunikat ogólny |

Przykład:

```bash
curl -sS -X POST http://127.0.0.1:8787/api/registrations \
  -H 'content-type: application/json' \
  -d '{"name":"Jan Kowalski","organization":"UG Odolanów","email":"jan@example.pl",
       "phone":"600100200","type":"uczestnik","consent_rodo":true}'
```

---

## 4. Panel zgłoszeń

`/admin` — statyczna strona (bez frameworków, CSP `script-src 'self'`, `X-Frame-Options: DENY`).

Logowanie: `POST /admin/api/login` z hasłem; ustawia cookie `h2_admin`
(`HttpOnly`, `SameSite=Strict`, `Secure` gdy żądanie przyszło po HTTPS). Sesje trzymane w pamięci —
restart serwera wylogowuje.

Wszystkie mutacje wymagają nagłówka `x-requested-with: h2-admin` (proste zabezpieczenie CSRF).

| Endpoint | Metoda | Rola |
| --- | --- | --- |
| `/admin/api/login` | POST | hasło → cookie sesji |
| `/admin/api/logout` | POST | unieważnia sesję |
| `/admin/api/session` | GET | czy zalogowany, czy hasło jest domyślne |
| `/admin/api/stats` | GET | liczba zgłoszeń ogółem i wg rodzaju, stan rejestracji |
| `/admin/api/registrations` | GET | lista z filtrami `q`, `type`, `status`, `from`, `to`, `limit`, `offset` |
| `/admin/api/registrations.csv` | GET | eksport wszystkich przefiltrowanych, BOM + `;` (Excel) |
| `/admin/api/registrations/:id` | PATCH | edycja pól i statusu |
| `/admin/api/registrations/:id` | DELETE | trwałe usunięcie (RODO) |
| `/admin/api/settings` | GET / PATCH | `registration_open` + treści dwóch e-maili |

Funkcje panelu: podsumowanie liczb, przełącznik otwarcia rejestracji, wyszukiwanie i filtry
(rodzaj, status, zakres dat), tabela, edycja w oknie modalnym, usuwanie z potwierdzeniem,
eksport CSV, edycja szablonów e-maili z listą dozwolonych znaczników.
Dane osobowe w tabeli są wstawiane wyłącznie przez `textContent` (bez `innerHTML`).

---

## 5. Poczta

Dwa e-maile na zgłoszenie:

1. **potwierdzenie dla uczestnika** — `email_confirm_subject` / `email_confirm_body`,
2. **powiadomienie organizatora** — `email_admin_subject` / `email_admin_body`, na wszystkie adresy
   z `H2_ORGANIZER_EMAIL`.

Treści są szablonami `{{znacznik}}` edytowalnymi w panelu. Dostępne znaczniki:
`{{id}}`, `{{name}}`, `{{organization}}`, `{{position}}`, `{{email}}`, `{{phone}}`, `{{city}}`,
`{{type}}`, `{{type_label}}`, `{{notes}}`, `{{date}}`, `{{place}}`, `{{contact_email}}`,
`{{contact_phone}}`, `{{consent_rodo}}`, `{{consent_contact}}`, `{{created_at}}`.

Transport `file` zapisuje wiadomości jako `.eml` w `var/outbox` — można je otworzyć w kliencie
poczty albo sprawdzić w testach. Transport `smtp` wymaga `npm install nodemailer`
(jedyna opcjonalna zależność) i `H2_SMTP_URL`.

Na produkcji: SPF i DKIM dla domeny nadawcy, osobna skrzynka `no-reply`, monitoring odbić.
Wysyłka idzie w żądaniu HTTP (synchronicznie) — przy dużym ruchu warto przenieść ją do kolejki.

---

## 6. Bezpieczeństwo i RODO

- Adres IP nie jest zapisywany wprost — tylko 16-znakowy skrót SHA-256 z solą (`ip_hash`).
- `audit_log`: logowania, nieudane logowania, utworzenie/edycja/usunięcie zgłoszenia, eksport CSV, odrzucony spam.
- Walidacja i normalizacja po stronie serwera jest nadrzędna wobec frontendu.
- Limit rozmiaru żądania (64 KB), `nosniff`, `Referrer-Policy`, CSP i `frame-ancestors 'none'` w panelu.
- Unikalny indeks na `lower(email)` — duplikat jest niemożliwy także przy dwóch równoległych żądaniach.
- Usuwanie zgłoszenia usuwa wiersz trwale; kopie zapasowe trzeba czyścić zgodnie z polityką retencji urzędu.

---

## 7. Wdrożenie

Docelowo moduł stoi w domenie urzędu, za reverse proxy (nginx/Apache) z HTTPS:

```
https://www.odolanow.pl/h2odolanow/          → statyczna podstrona
https://www.odolanow.pl/h2odolanow/api/...   → ten serwis
https://www.odolanow.pl/h2odolanow/admin     → panel (ograniczony po IP lub VPN, jeśli możliwe)
```

Serwis powinien nasłuchiwać na `127.0.0.1` i mieć proces nadzorowany (systemd, `Restart=always`).
Kopia zapasowa: `sqlite3 var/registrations.sqlite ".backup ..."` w cronie + kopia `var/outbox`.

**Znane ograniczenie prototypu:** frontend woła `/api/...` i `/admin/...` od korzenia domeny.
Przy wdrożeniu w podkatalogu trzeba albo przepisać ścieżki w proxy, albo dodać w produkcji
zmienną `data-api-base` (np. `<body data-api-base="/h2odolanow">`) i składać adresy z niej.
Prototyp działa bez zmian pod korzeniem domeny lub subdomeną.

---

## 8. Ograniczenia prototypu (świadome)

To jest wersja pokazowa kontraktu, nie finalny produkt. Przed produkcją trzeba dodać:

- konta z rolami i 2FA zamiast jednego hasła; sesje w bazie, nie w pamięci,
- CAPTCHA (Cloudflare Turnstile) obok honeypota i time-gate,
- migracje schematu i politykę retencji (automatyczne czyszczenie starych zgłoszeń),
- kolejkę wysyłki poczty i ponawianie nieudanych wysyłek,
- paginację w panelu (API już ją ma, interfejs pokazuje pierwsze 100),
- logi w formacie gotowym do zbierania, metryki i alert o braku dostępu do bazy,
- testy obciążeniowe pod szczyt rejestracji i próbę odtworzenia z kopii.

---

## 9. Struktura

```
server/
├── src/
│   ├── index.mjs        # start serwera, obsługa SIGINT/SIGTERM
│   ├── app.mjs          # routing, API publiczne i admin, CSV, statyka, CSP
│   ├── config.mjs       # konfiguracja ze zmiennych środowiskowych
│   ├── db.mjs           # schemat SQLite, ustawienia domyślne, zapytania
│   ├── validate.mjs     # reguły walidacji zgłoszenia i edycji w panelu
│   └── mail.mjs         # szablony, transport file/smtp, pliki .eml
├── public/admin/        # panel: index.html, app.css, app.js
└── var/                 # dane lokalne, poza repozytorium

# poza katalogiem server/:
├── package.json         # skrypty npm (start, test) — bez zależności runtime
├── tests/
│   ├── api.test.mjs     # 5 zestawów testów (API, panel, statyka, bezpieczeństwo)
│   └── test_docs_links.py
└── tools/check_docs_links.py
```
