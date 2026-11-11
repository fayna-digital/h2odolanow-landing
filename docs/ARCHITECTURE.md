# ARCHITECTURE — H2O!dolanów

Trzy warstwy, jedna domena, zero zależności runtime. Dokument pokazuje, jak przepływa
zgłoszenie i gdzie są granice zaufania.

---

## 1. Warstwy

```
┌──────────────────────────────────────────────────────────────┐
│  1. Prezentacja (statyczna)                                  │
│  h2odolanow_landing.html · h2odolanow_style.css ·            │
│  h2odolanow_script.js · assets/                              │
│  • 12 sekcji OPZ 4.1–4.10, RWD, WCAG 2.1 AA, SEO             │
│  • formularz: tryb żywy (gdy jest API) albo tryb demo         │
└───────────────┬──────────────────────────────────────────────┘
                │  POST /api/registrations  (JSON)
                │  GET  /api/health        (wykrywanie trybu)
                │  GET  /api/registration-status
                ▼
┌──────────────────────────────────────────────────────────────┐
│  2. API (Node.js, node:http, zero frameworków)               │
│  server/src/app.mjs                                          │
│  • routing, walidacja, limity, CSV, statyka, nagłówki         │
│  • /admin/api/* — panel (sesja + X-Requested-With)            │
└───────┬──────────────────────────────────┬───────────────────┘
        │                                  │
        ▼                                  ▼
┌───────────────────────┐   ┌──────────────────────────────────┐
│ 3a. Dane (SQLite)     │   │ 3b. Poczta                      │
│  server/src/db.mjs    │   │  server/src/mail.mjs             │
│  • registrations      │   │  • potwierdzenie → uczestnik     │
│  • settings           │   │  • powiadomienie → organizator   │
│  • audit_log          │   │  • transport: file (.eml) / smtp  │
│  • IP: tylko skrót    │   │  • szablony {{placeholder}}      │
└───────────────────────┘   └──────────────────────────────────┘
```

Panel (`server/public/admin/`) to statyczny interfejs (HTML + CSS + waniliowy JS) talkujący
z `/admin/api/*`. Nie używa `innerHTML` dla danych z bazy — tylko `textContent`.

---

## 2. Przepływ zgłoszenia

1. Frontend wysyła `GET /api/health` → jeśli `service = "h2odolanow-registration"`, formularz
   przechodzi w tryb żywy (w przeciwnym razie zostaje w trybie demo z jawnym komunikatem).
2. `POST /api/registrations` z polami formularza + `form_loaded_at` + `website` (honeypot).
3. Serwer, w kolejności: limit IP (5 / 10 min) → stan rejestracji → walidacja → honeypot →
   time-gate → unikalność e-maila → zapis.
4. Po zapisie: e-mail do uczestnika i e-mail do organizatora (teksty z `settings`).
5. Odpowiedź: `201` (zapisane), `202` (honeypot — bot dostaje „sukces”), `400` (walidacja
   lub time-gate), `409` (duplikat), `429` (limit), `503` (rejestracja zamknięta).
6. Panel: lista z filtrami → edycja / usunięcie → eksport CSV (BOM + `;` → Excel).

---

## 3. Model zagrożeń (skrót)

| Zagrożenie | Środki w prototypie | Do produkcji |
| --- | --- | --- |
| Boty | honeypot + time-gate (2 s) + limit per IP | + CAPTCHA (Cloudflare Turnstile) |
| Wstrzyknięcie treści (XSS) | `textContent` w panelu, walidacja typów, `nosniff` | CSP dla frontu, sanitizacja treści maili |
| CSRF | cookie `SameSite=Strict` + nagłówek `X-Requested-With` dla mutacji | token CSRF |
| Nieautoryzowany dostęp do panelu | hasło (domyślnie `demo-admin` — sygnalizowane w logu i w panelu), sesje w pamięci, limit prób logowania | konta z rolami, 2FA, sesje w bazie, blokada po IP |
| Wyciek danych osobowych | brak eksportu bez sesji, brak logowania treści pól, IP tylko jako skrót | role w panelu, dziennik dostępu, retencja, szyfrowanie kopii |
| Duplikaty zgłoszeń | unikalny indeks `lower(email)` | to samo + potwierdzenie e-mail (double opt-in) |
| Utrata danych | baza SQLite w WAL, tryb `file` do e-maili (podgląd przed SMTP) | kopie zapasowe `.backup`, retencja, kopia poza serwerem |
| Wyciek sekretów | wyłącznie zmienne środowiskowe, brak w repo | menadżer sekretów, rotacja, `gitleaks` w CI |

---

## 4. Decyzje projektowe (ADR-skrót)

| # | Decyzja | Powód | Alternatywy odrzucone |
| --- | --- | --- | --- |
| 1 | Czysty HTML/CSS/JS bez frameworków | podstrona ma żyć w CMS urzędu; brak procesu budowania = brak kłopotu z wdrożeniem i aktualizacją | React/Vue (wymagają build stepu i npm w urzędzie) |
| 2 | `node:sqlite` zamiast PostgreSQL/MySQL | zero zależności, jeden plik, łatwy backup; realny wolumen zgłoszeń dla konferencji jest niski | osobna baza (narzut administracyjny przy jednej instalacji) |
| 3 | Własny router na `node:http` | zależność od frameworka = zależność do utrzymania; kontrakt API jest prosty i stabilny | Express/Fastify (wygodniej, ale więcej ruchomych części) |
| 4 | Panel jako statyczny HTML/JS | brak bundlera, brak zależności, dane wstawiane `textContent` | SPA z frameworkiem (zbędne dla 8 ekranów) |
| 5 | Transport poczty `file` domyślnie | testy i praca bez serwera SMTP; podgląd treści przed wysyłką na produkcję | tylko SMTP (brak możliwości testów offline) |
| 6 | Sesje panelu w pamięci | restart serwera wylogowuje — bezpieczne i proste w prototypie | sesje w bazie (wymagane w produkcji) |
| 7 | Jeden korzeń historii repozytorium, bez `main` z „martwym” HTML-em | domyślna gałąź ma pokazywać gotowy produkt | gałąź `main` ze starym szkieletem |

---

## 5. Wdrożenie w domenie urzędu

```
odolanow.pl/h2odolanow/            → statyczna podstrona (serwer www urzędu)
odolanow.pl/h2odolanow/api/...     → ten serwis (reverse proxy → 127.0.0.1:8787)
odolanow.pl/h2odolanow/admin       → panel (ograniczony po IP / VPN, jeśli to możliwe)
```

Uwaga: frontend woła `/api/...` od korzenia domeny. Przy wdrożeniu w podkatalogu trzeba
przepisać ścieżki w reverse proxy albo dodać w produkcji `data-api-base` i składać adresy
z niej (opis w `server/README.md`, sekcja 7).
