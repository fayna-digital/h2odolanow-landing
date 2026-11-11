# Changelog

Format — [Keep a Changelog](https://keepachangelog.com/pl/1.1.0/),
wersjonowanie — [SemVer](https://semver.org/lang/pl/).

## [0.1.0] — 2026-11-11

Pierwsza wersja podstrony konferencji **H2O!dolanów** (27–28 kwietnia 2027 r.) wraz
z prototypem modułu rejestracji. Repozytorium przygotowane zgodnie ze standardem
repozytoriów Fayna (README, CHANGELOG, LICENSE, `docs/TZ.md`, `docs/PLAN.md`, `tests/`,
CI i kontrola jakości w pre-commit).

### Added — frontend

- Kompletna podstrona zgodnna z *Opisem funkcjonalno-technicznym*: hero z licznikiem,
  o konferencji, powitanie Burmistrza, zakres tematyczny, liczby klastra, program dwóch dni
  (zakładki + PDF), prelegenci, miejsce z mapą i autobusem, organizatorzy i patronaty,
  formularz rejestracyjny, kontakt, stopka (OPZ 4.1–4.10).
- Własna identyfikacja wizualna w duchu transformacji energetycznej: granat `#0c1b2a`,
  czerwień `#d8201a`, bursztyn `#f6c445`, Open Sans 400–800, promień 4–8 px.
  Znak wydarzenia: `H2O!dolanów` z wykrzyknikiem jako akcentem.
- Warstwa graficzna bez wideo — wyłącznie fotografie (Wikimedia Commons / materiały gminy)
  i grafika wektorowa SVG; kredyty zdjęć w stopce i w README.
- Responsywność (1440 / 768 / 390 px), dostępność WCAG 2.1 AA, SEO techniczne
  (`title`, `description`, Open Graph, Twitter Card, `schema.org/Event`).
- Optymalizacja wagi: `srcset` w trzech szerokościach dla zdjęć, `fetchpriority="high"`
  dla hero, `loading="lazy"` dla reszty, brak zewnętrznych bibliotek JS.
- Nawigacja mobilna (ARIA, `Escape`, klik poza), zakładki programu wg wzorca ARIA
  (strzałki, `Home`/`End`), licznik do wydarzenia, animacje wejścia z respektem
  `prefers-reduced-motion` i `forced-colors`.
- Walidacja formularza po stronie klienta: komunikaty po polsku przy polach, `aria-invalid`,
  `aria-describedby`, fokus na pierwszym błędnym polu, antyspam (honeypot + blokada wysyłki
  przed upływem 2 s).

### Added — prototyp modułu rejestracji (`server/`)

- API `POST /api/registrations` (JSON lub formularz), `GET /api/health`,
  `GET /api/registration-status` — walidacja serwerowa, honeypot, time-gate,
  limit 5 zgłoszeń / 10 min na IP, unikalność e-maila, log audytu ze skrótem IP.
- Baza SQLite (`node:sqlite`) ze schematem zgłoszeń, ustawień i dziennika audytu;
  brak zależności runtime.
- Dwa e-maile automatyczne na zgłoszenie: potwierdzenie dla uczestnika i powiadomienie
  organizatora; szablony `{{znacznik}}` edytowalne z panelu; transport `file` (`.eml`)
  albo `smtp` (opcjonalnie `nodemailer`).
- Panel administracyjny `/admin`: logowanie z cookie `HttpOnly` + nagłówek `X-Requested-With`,
  podsumowanie, wyszukiwanie i filtry, edycja i usuwanie zgłoszeń, eksport CSV (BOM, średnik,
  gotowy do Excela), przełącznik otwarcia rejestracji, edycja treści e-maili.
- Serwowanie podstrony z tego repo pod tym samym adresem; CSP i `X-Frame-Options: DENY`
  dla panelu; ochrona przed path traversal.

### Added — dokumentacja i jakość

- `docs/oferta.md` — wycena w trzech wariantach (A 37 400 / B 43 200 / C 24 800 zł netto),
  odpowiedzi na 11 punktów OPZ §8, harmonogram 7 tygodni, warunki i utrzymanie.
- `docs/TZ.md` — zadanie techniczne w 7 obszarach standardu (biznes, cel, komendy,
  struktura, styl kodu, strategia testów, granice) + kryteria sukcesu i otwarte pytania.
- `docs/PLAN.md` — graf zależności, fazy i checkpointy realizacji.
- `docs/ARCHITECTURE.md` — warstwy, przepływ danych i model zagrożeń.
- `tests/api.test.mjs` — 5 zestawów testów (API publiczne, duplikaty i antyspam, limity,
  panel i eksport CSV, statyka oraz bezpieczeństwo); `node --test` — 5/5 zielone.
- CI (`.github/workflows/ci.yml`): testy Node, kontrola pre-commit (gitleaks, higiena,
  brak podpisów AI), testy linków w dokumentacji.
- `.pre-commit-config.yaml` z lokalnym hookiem `no-ai-signature` (blokada podpisów AI
  w treści i w komunikacie commita).

### Changed

- Nazwa wydarzenia ujednolicona w całym repozytorium: `H2Odolanów` → `H2O!dolanów`
  (tytuł strony, meta, Open Graph, `schema.org`, stopka, klauzula RODO, treść sekcji).
- Hero wyrównane do lewej krawędzi kontenera — treść startuje w tej samej linii
  co nagłówek i kolejne sekcje.
- Zmieniono na wyłącznie zdjęcia i grafikę SVG (zgodnie z OPZ §2 — brak wideo).
- Herb gminy przycięty do jednego щита (156×195, 6,3 KB), poprawione `width`/`height`
  w czterech miejscach HTML.
- Zdjęcia przekonwertowane do WebP/JPEG w jakości q72, hero z 389 KB do 326 KB;
  telefon pobiera wariant 800 px (~81 KB).

### Fixed

- Rozjechane nagłówki CTA w nagłówku i w menu (`header-inner .header-cta`,
  `.site-nav .nav-cta`).
- Zakładki pod sekcjami nachodziły na ich treść — dodano `scroll-margin-top` zależny
  od wysokości sticky nagłówka.
- Formularz na ekranach < 980 px miał za wysoką wklejkę — stopka sekcji rejestracji
  nie jest już sticky.
- Siatka logotypów nie mieściła się na wąskich ekranach — `auto-fit` zamiast stałych kolumn.
- Przyciski hero nakładały się na siebie przy 560 px — układ kolumnowy.

### Known limitations

- Program, prelegenci, patronaty i zdjęcia autobusu to treści robocze oznaczone komentarzami
  `<!-- CONTENT: ... -->` — do uzupełnienia przez urząd.
- Prototyp modułu rejestracji wymaga przed produkcją: CAPTCHA, kont z rolami i 2FA,
  sesji w bazie, migracji schematu, polityki retencji, kolejki wysyłki poczty
  i testów obciążeniowych (lista w `server/README.md`, sekcja 8).
- Adresy API są zakorzenione w `/api/...` — przy wdrożeniu w podkatalogu domeny urzędu
  wymagają przepisania w reverse proxy albo parametru `data-api-base`.
