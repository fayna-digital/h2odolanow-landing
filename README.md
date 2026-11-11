# H2O!dolanów 2027 — landing page konferencji

Warstwa frontendowa podstrony ogólnopolskiej konferencji **H2O!dolanów** (27–28 kwietnia 2027 r.,
teren Klastra Energii Odolanów–Przygodzice–Sulmierzyce), przygotowana pod wymagania
*Opisu funkcjonalno-technicznego*.

HTML + CSS + waniliowy JavaScript, bez frameworków, bez procesu budowania i bez zależności
poza krojem pisma z Google Fonts. Repozytorium zawiera **warstwę prezentacji**, **działający
prototyp modułu rejestracji** (`server/`: API, baza, e-maile, panel zgłoszeń) oraz **wycenę
i odpowiedzi na OPZ §8** (`docs/oferta.md`). Wpięcie w CMS urzędu opisuje sekcja 6.

---

## 1. Pliki

| Plik | Rola |
| --- | --- |
| `h2odolanow_landing.html` | Cała strona: pasek informacyjny, nagłówek, 12 sekcji, stopka. Miejsca do uzupełnienia oznaczone komentarzami `<!-- CONTENT: ... -->`. |
| `h2odolanow_style.css` | Tokeny identyfikacji, układ wszystkich sekcji, formularz, stany fokusa, `prefers-reduced-motion`, `forced-colors`. |
| `h2odolanow_script.js` | Nagłówek po przewinięciu, menu mobilne (ARIA, Escape, klik poza), licznik do 27.04.2027, zakładki programu (strzałki/Home/End), walidacja formularza, tryb żywy rejestracji, animacje wejścia. |
| `server/` | Prototyp warstwy serwerowej: API zgłoszeń, baza SQLite, e-maile, panel zgłoszeń, CSV. Opis w `server/README.md`. |
| `docs/oferta.md` | Wycena wykonania podstrony (3 warianty), odpowiedzi na punkty OPZ §8, harmonogram i warunki. |
| `assets/` | Herb gminy, zdjęcia w trzech szerokościach (`-800`, `-1200`, pełna) pod `srcset`. |
| `README.md` | Ten dokument. |

---

## 2. Sekcje strony a punkty OPZ

| OPZ | Sekcja | Anchor | Stan |
| --- | --- | --- | --- |
| 4.1 | Hero: nazwa, data, miejsce, hasło, CTA „Zarejestruj się”, licznik | `#start` | gotowe |
| 4.2 | O konferencji | `#o-konferencji` | gotowe, treść do zatwierdzenia |
| 4.3 | Powitanie Burmistrza (foto, tekst, imię i funkcja) | `#powitanie` | tekst i podpis gotowe, **brak fotografii** |
| — | Zakres tematyczny (8 kart, pkt 3 OPZ) | `#tematyka` | gotowe |
| — | Liczby klastra (50 mln zł KPO, 3 gminy, 600+ PV, 400+ magazynów) | `#projekt` | gotowe |
| 4.4 | Program: dwa dni, zakładki, godziny, prelegenci, typy punktów, PDF | `#program` | struktura gotowa, **agenda robocza**, PDF do wgrania |
| 4.5 | Prelegenci i moderatorzy (karty) | `#prelegenci` | siatka gotowa, **dane do uzupełnienia** |
| 4.6 | Miejsce: opis, mapa, dojazd, parking, autobus Mercedes-Benz | `#miejsce` | gotowe, **zdjęcia autobusu do uzupełnienia** |
| 4.7 | Organizatorzy, partnerzy, patronaty (5 kategorii) | `#organizatorzy` | kategorie gotowe, **logotypy do uzupełnienia** |
| 4.8 | Formularz rejestracyjny | `#rejestracja` | frontend + tryb żywy gotowe, prototyp backendu w `server/` |
| 4.9 | Kontakt | `#kontakt` | dane urzędu gotowe, **osoba kontaktowa do uzupełnienia** |
| 4.10 | Stopka: herb, linki formalne, partnerzy, dofinansowanie | `footer` | gotowe |

Nawigacja główna prowadzi do siedmiu najważniejszych sekcji; stopka zbiera pozostałe odnośniki
(strona urzędu, polityka prywatności, deklaracja dostępności, BIP).

---

## 3. Identyfikacja wizualna

Kierunek: nowoczesna energetyka i transformacja — OZE, fotowoltaika, magazynowanie, wodór,
infrastruktura — a nie wyłącznie wodór. Punkt wyjścia był układ i sposób eksponowania treści
z <https://rebuildukraine.in.ua/en> (duży hero, wyraźne CTA, mocne pasy sekcji, karty, osie liczb),
ale projekt jest własny: inna paleta, inna typografia, inny rytm sekcji.

**Nie ma wideo** — cała warstwa obrazowa to fotografie i grafika wektorowa (SVG inline).

| Token | Wartość | Zastosowanie |
| --- | --- | --- |
| `--ink` | `#0c1b2a` | tła ciemnych sekcji, stopka, nagłówek |
| `--ink-2` / `--ink-3` | `#12293c` / `#1a354c` | warstwy i obramowania na ciemnym |
| `--red` | `#d8201a` | akcja główna, akcenty, linki |
| `--red-dark` | `#b3160f` | hover akcji |
| `--amber` | `#f6c445` | akcent na ciemnym tle, liczby, wyróżnienia |
| `--mist` | `#f4f7fa` | tło sekcji pomocniczych |
| `--line` | `#dbe3ec` | linie, obramowania kart |
| `--text` / `--muted` | `#12222f` / `#5a6b7b` | tekst podstawowy i pomocniczy |
| `--radius` / `--radius-lg` | `4px` / `8px` | krawędzie |
| `--container` | `1220px` | szerokość treści |
| `--header-h` | `76px` | wysokość nagłówka (64 px po przewinięciu) |
| Krój | Open Sans 400/600/700/800 | cała strona |

Zasady: ciemne pasy przeplatają się z jasnymi, każda sekcja ma nadtytuł (`eyebrow`),
CTA występuje w hero, w nagłówku i w sekcji rejestracji. Focus jest zawsze widoczny
(`2px dotted`, na ciemnym tle w kolorze bursztynu).

---

## 4. Edycja treści bez programisty

Wszystkie miejsca wymagające treści od urzędu są oznaczone w HTML:

```bash
grep -n "CONTENT:" h2odolanow_landing.html
```

| Co | Gdzie | Jak |
| --- | --- | --- |
| Hasło, lead, teksty sekcji | `#start`, `#o-konferencji` | podmiana tekstu w HTML |
| Fotografia Burmistrza | `#powitanie` → `.photo-slot` | zamiana bloku na `<img src="assets/burmistrz.jpg" alt="…">` |
| Program | `#program` → `ul.agenda` | jeden `<li class="agenda__row">` = jeden punkt; `agenda__row--break` wyróżnia przerwy; `badge--red` = panel, `badge--amber` = warsztat/pokaz |
| PDF programu | `a[data-pdf-download]` | podmiana `href` na plik PDF i usunięcie `aria-disabled` |
| Prelegenci | `#prelegenci` → `ul.speaker-grid` | jeden `<li class="speaker">` = jedna osoba: zdjęcie, imię, funkcja, instytucja, temat |
| Miejsce i autobus | `#miejsce` | teksty w `dl.facts`; zdjęcia autobusu w `.bus__slot` |
| Logotypy | `#organizatorzy` | jeden `<li class="logo-cell">` = jeden podmiot; kolejność w HTML = kolejność na stronie |
| Kontakt | `#kontakt` | dane osoby kontaktowej |
| Zdjęcia sekcji | `assets/` | nadpisanie pliku o tej samej nazwie (zachowaj proporcje i warianty `-800`, `-1200`) |

Po wpięciu w CMS (sekcja 6) te same miejsca stają się polami w panelu — struktura HTML jest
celowo płaska, żeby dała się przenieść do szablonu bez przepisywania.

---

## 5. Formularz rejestracji — frontend, tryb żywy i prototyp backendu

### Frontend

- Pola: imię i nazwisko\*, instytucja/firma\*, stanowisko, e-mail\*, telefon\*, miejscowość,
  rodzaj zgłoszenia (uczestnik / prelegent / partner / media), dodatkowe informacje.
- Zgody: RODO\* (wymagana) i zgoda na kontakt informacyjny (opcjonalna), z informacją o administratorze.
- Walidacja po stronie klienta: długość, format e-mail, min. 9 cyfr telefonu, wymagane zgody;
  błędy powiązane przez `aria-describedby` i `aria-invalid`, fokus przenoszony na pierwsze błędne pole.
- Antyspam: pole-pułapka (`#reg-website`, ukryte) oraz blokada wysyłki przed upływem 2 s od wejścia.
- `novalidate` + własne komunikaty po polsku; `aria-live` na statusie formularza.

Formularz sam rozpoznaje, z czym pracuje:

| Warunek | Tryb | Zachowanie |
| --- | --- | --- |
| `GET /api/health` odpowiada `service: "h2odolanow-registration"` | żywy | `POST /api/registrations`, obsługa kodów 201/202/400/409/429/503, komunikaty przy polach |
| brak backendu (plik otwarty z dysku, hosting statyczny) | demo | uczciwy komunikat „zgłoszenie nie zostało zapisane”, bez udawania wysyłki |

### Prototyp backendu — `server/`

Kompletny, uruchamialny prototyp OPZ 4.8: przyjmowanie zgłoszeń (JSON lub formularz), walidacja
serwerowa, baza SQLite, dwa e-maile automatyczne (potwierdzenie + powiadomienie organizatora),
panel zgłoszeń z logowaniem, filtrami, edycją, usuwaniem, eksportem CSV i zamykaniem rejestracji,
oraz edycja treści e-maili z panelu. Zero zależności runtime (Node.js + `node:sqlite`).

```bash
cd server && npm start
# podstrona: http://127.0.0.1:8787/   panel: /admin   testy: npm test
```

Pełny opis — konfiguracja, endpointy, kontrakt, wdrożenie i świadome ograniczenia prototypu —
jest w [`server/README.md`](server/README.md).

### Kontrakt wdrożony w prototypie

```http
POST /api/registrations
Content-Type: application/json
```

```json
{
  "name": "Jan Kowalski",
  "organization": "Urząd Gminy i Miasta Odolanów",
  "position": "Referent",
  "email": "jan.kowalski@example.pl",
  "phone": "+48 62 733 15 81",
  "city": "Odolanów",
  "type": "uczestnik",
  "notes": "Potrzeba miejsca dla wózka inwalidzkiego",
  "consent_rodo": true,
  "consent_contact": false,
  "website": "",
  "form_loaded_at": "2027-01-10T09:15:22Z"
}
```

| Odpowiedź | Znaczenie | Reakcja frontendu |
| --- | --- | --- |
| `201 { "ok": true, "id": 12 }` | zgłoszenie zapisane, e-maile wysłane | komunikat sukcesu, reset formularza |
| `202 { "ok": true }` | honeypot wypełniony — bot dostaje sukces, nic nie zapisujemy | komunikat sukcesu |
| `400 { "errors": { "email": "…" } }` | błąd walidacji | komunikaty przy polach |
| `400 { "error": "too_fast" }` | formularz wysłany zbyt szybko | „spróbuj ponownie” |
| `409` | e-mail już zgłoszony | komunikat + fokus na e-mail |
| `429` | limit 5 zgłoszeń / 10 min z jednego IP | komunikat „spróbuj później” |
| `503` | rejestracja zamknięta w panelu | komunikat z kontaktem do organizatora |

W produkcji podstrona stoi w podkatalogu domeny urzędu, więc adresy trzeba złożyć z bazy
(np. `data-api-base="/h2odolanow"`) albo przepisać je w reverse proxy — patrz
`server/README.md`, sekcja 7.

### Czego OPZ 4.8 wymaga ponad prototyp

Prototyp pokazuje kontrakt i działa end-to-end, ale przed produkcją dochodzą: CAPTCHA
(Cloudflare Turnstile), konta z rolami i 2FA zamiast jednego hasła, sesje w bazie, migracje
schematu, polityka retencji i automatyczne czyszczenie, kolejka wysyłki poczty, paginacja
w interfejsie panelu, monitoring i testy obciążeniowe. Lista jest w `server/README.md`, sekcja 8.

---

## 6. Wpięcie w stronę urzędu (OPZ 1 i 5)

OPZ wymaga podstrony **w domenie i CMS urzędu**, bez osobnej domeny. Możliwe warianty:

| Wariant | Opis | Edycja treści przez urząd | Uwagi |
| --- | --- | --- | --- |
| **A. Szablon w CMS** *(rekomendowany)* | układ z tego repo przeniesiony do szablonu CMS (np. Joomla/WordPress), treść w polach | pełna, z panelu CMS | wymaga dostępu do CMS i osoby, która zrobi szablon |
| B. Statyczna podstrona w podkatalogu | pliki wgrane do `/h2odolanow/`, treść w HTML | przez edycję plików | najmniej inwazyjne, ale nie spełnia 4.2 „edycja przez pracowników” |
| C. Hybryda | frontend statyczny + headless CMS/panel do treści i zgłoszeń | pełna, z panelu | dwa systemy do utrzymania |

Do wyceny i wdrożenia potrzebne są od urzędu: nazwa i wersja CMS, sposób publikacji (FTP/git/panel),
wersja PHP i bazy, polityka cookies i wzór klauzuli RODO, dane administratora danych.

---

## 7. Dostępność (WCAG 2.1 AA)

- Semantyczne sekcje z `aria-labelledby`, jeden `h1`, logiczna hierarchia nagłówków.
- Link „Przejdź do głównej treści”, widoczny focus na wszystkim interaktywnym.
- Menu mobilne: `aria-expanded` / `aria-controls`, zamykanie `Escape`, klik poza, blokada przewijania tła.
- Zakładki programu wg wzorca ARIA: `role="tablist"`, strzałki, `Home`/`End`, `tabindex` na aktywnym.
- Licznik: `role="timer"`, `aria-live="off"` (nie rozprasza czytnika), ukrywany po starcie wydarzenia.
- Formularz: etykiety powiązane, `aria-required`, `aria-invalid`, komunikaty przez `aria-describedby`,
  status przez `role="status"`.
- Kontrast tekstu na ciemnym tle ≥ 4.5:1, `prefers-reduced-motion` wyłącza animacje wejścia,
  `forced-colors` dodaje obramowania.
- Mapa: `iframe` z `title`, `loading="lazy"`, link do większej mapy jako alternatywa.

Do sprawdzenia przed publikacją: kontrast po podmianie zdjęć, nawigacja klawiaturą po całej stronie,
czytnik ekranu (NVDA/VoiceOver), powiększenie 200%.

---

## 8. Wydajność i SEO

- Każde zdjęcie w trzech szerokościach przez `srcset` + `sizes`; hero z `fetchpriority="high"`,
  pozostałe `loading="lazy"`.
- Łączna waga grafiki: ok. 0,9 MB dla wszystkich wariantów, pojedyncza wizyta pobiera
  ~180–330 KB obrazów zależnie od ekranu.
- Brak wideo, brak zewnętrznych bibliotek JS; jeden arkusz CSS i jeden plik JS.
- `font-display: swap` (Google Fonts), `preconnect` do `fonts.gstatic.com`.
- `<title>`, `meta description`, `og:title/description/image/url`, `twitter:card`, `theme-color`.
- Dane strukturalne `schema.org/Event` (data, miejsce, organizator, `isAccessibleForFree`).

Do ustawienia po publikacji: absolutny `og:image` i `og:url` (np. `https://www.odolanow.pl/h2odolanow/`),
`link rel="canonical"`, wpis w `sitemap.xml`, ewentualnie osobny obraz 1200×630 do social.

---

## 9. Uruchomienie lokalne

Sama warstwa prezentacji (formularz w trybie demo):

```bash
python3 -m http.server 8000
# http://localhost:8000/h2odolanow_landing.html
```

Pełny zestaw z rejestracją, bazą i panelem (formularz w trybie żywym):

```bash
cd server
npm start
# podstrona: http://127.0.0.1:8787/   panel: http://127.0.0.1:8787/admin
npm test    # testy API, panelu, statyki i bezpieczeństwa
```

Krój Open Sans jest pobierany z Google Fonts. Dla wersji bez dostępu do internetu pobierz pliki
`.woff2` i zamień `<link>` na lokalne `@font-face`.

---

## 10. Prawa do materiałów

| Plik | Autor / źródło | Licencja |
| --- | --- | --- |
| `assets/hero-energy*.jpg` | Jacek Halicki, *Farma fotowoltaiczna w Ścinawicy*, Wikimedia Commons | CC BY-SA 4.0 |
| `assets/about-energy*.jpg` | JakobHosp, *Farma Fotowoltaiczna Kalisz Pomorski 2024*, Wikimedia Commons | CC BY 4.0 |
| `assets/hero-odolanow*.jpg` | Gmina i Miasto Odolanów (`odolanow.pl`) | materiały gminy |
| `assets/logo-odolanow.png` | Herb Gminy i Miasta Odolanów | materiał urzędowy |

Zdjęcia OZE są **ilustracją tematu**, nie fotografiami inwestycji klastra — podpisy i stopka
nie sugerują inaczej. Przed publikacją warto podmienić je na zdjęcia z terenu klastra
(te same nazwy plików, bez zmian w HTML). Licencje CC BY / CC BY-SA wymagają podania autora
i licencji — kredyty są w stopce i w tej tabeli. Jeśli urząd nie chce licencji share-alike,
należy użyć zdjęć własnych.

---

## 11. Checklist przed publikacją

- [ ] Fotografia Burmistrza i potwierdzenie tekstu powitalnego.
- [ ] Ostateczny program obu dni + PDF do pobrania.
- [ ] Lista prelegentów i moderatorów ze zdjęciami i zgodami na wizerunek.
- [ ] Logotypy organizatorów, partnerów i patronatów (5 kategorii, właściwe pliki SVG/PNG).
- [ ] Zdjęcia autobusu demonstracyjnego Mercedes-Benz i opis pokazu.
- [ ] Dokładna lokalizacja, dojazd, parking (uzupełnić `dl.facts`).
- [ ] Osoba kontaktowa z bezpośrednim telefonem i e-mailem.
- [ ] Podlinkowana polityka prywatności, deklaracja dostępności, klauzula RODO zatwierdzona przez IOD.
- [ ] Backend rejestracji: przegląd prototypu z `server/`, dodanie CAPTCHA, role i 2FA, polityka retencji, test wysyłki e-maili przez SMTP.
- [ ] Absolutne `og:url` / `og:image`, `canonical`, `sitemap`.
- [ ] Test na Safari (iOS), Chrome (Android), przeglądarka urzędowa; kontrast i klawiatura.
