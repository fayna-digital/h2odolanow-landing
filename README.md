# H2O!dolanów — podstrona konferencji

![Node](https://img.shields.io/badge/Node-%3E%3D22.5-3FAF52)
![Tests](https://img.shields.io/badge/tests-node%20%2B%20pytest-0b6e4f)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Accessibility](https://img.shields.io/badge/WCAG-2.1%20AA-blue)
![Status](https://img.shields.io/badge/status-prototyp%20%2F%20do%20wdro%C5%BCenia-orange)

**Opracowane przez [Fayna Digital](https://fayna.agency) — Autor: Volodymyr Shevchenko**

Podstrona ogólnopolskiej konferencji **H2O!dolanów** (27–28 kwietnia 2027 r., teren Klastra
Energii Odolanów–Przygodzice–Sulmierzyce) przygotowana zgodnie z *Opisem funkcjonalno-technicznym*
oraz **działający prototyp modułu rejestracji** (API, baza, e-maile, panel zgłoszeń).

---

## Problem

Pierwsza ogólnopolska konferencja klastra energii nie ma jeszcze miejsca, w którym uczestnik
zapisuje się, a organizator zbiera dane do listy i okładki programu. Formularz na stronie
urzędu bez bazy oznacza: zgłoszenia w skrzynce e-mail, ręczne przepisywanie do arkusza,
brak historii zmian i brak potwierdzenia dla uczestnika.

## Rozwiązanie

Podstrona w domenie urzędu (`odolanow.pl`) z dwoma niezależnymi warstwami:

- **prezentacja** — 12 sekcji wg OPZ 4.1–4.10, własna identyfikacja wizualna,
  responsywność, WCAG 2.1 AA, SEO techniczne; zero frameworków, zero procesu budowania;
- **moduł rejestracji** (`server/`) — API z walidacją serwerową, baza SQLite, dwa e-maile
  automatyczne (potwierdzenie dla uczestnika + powiadomienie organizatora) oraz panel
  zgłoszeń z wyszukiwaniem, filtrami, edycją, usuwaniem i eksportem CSV gotowym do Excela.

Formularz sam rozpoznaje, z czym pracuje: przy działającym API działa w trybie **żywym**
(realne zapisy, komunikaty o błędach przy polach), bez backendu uczciwie mówi, że działa
w wersji demonstracyjnej — nie udaje wysłanego zgłoszenia.

## Efekt

- Zgłoszenie z formularza trafia do bazy w < 2 s, uczestnik dostaje potwierdzenie,
  organizator powiadomienie — potwierdzone testami (`tests/api.test.mjs`).
- Panel pozwala znaleźć zgłoszenie po nazwisku, e-mailu i instytucji, poprawić je oraz
  wyeksportować do arkusza — okładka programu powstaje z bazy, bez przepisywania danych.
- Rejestrację da się zamknąć jednym przełącznikiem, a odwiedzający widzi wtedy informację
  z numerem kontaktowym.
- Całość da się utrzymać bez licencji i bez nowej infrastruktury: zero zależności runtime,
  jeden plik bazy, brak wideo.

## Stack

HTML5 · CSS3 (custom properties, `grid`, `clamp()`) · waniliowy JavaScript (ES5-ish, `fetch`)
· Node.js 22.5+ (`node:sqlite`, `node:http`) · SQLite (WAL) · `node:test` · pytest ·
ruff · mypy · gitleaks · pre-commit · GitHub Actions.

---

## Zawartość repozytorium

| Plik / katalog | Rola |
| --- | --- |
| `h2odolanow_landing.html` | Cała strona: pasek informacyjny, nagłówek, 12 sekcji, stopka. Miejsca do uzupełnienia oznaczone komentarzami `<!-- CONTENT: ... -->`. |
| `h2odolanow_style.css` | Tokeny identyfikacji, układ wszystkich sekcji, formularz, stany fokusa, `prefers-reduced-motion`, `forced-colors`. |
| `h2odolanow_script.js` | Nagłówek po przewinięciu, menu mobilne (ARIA, Escape, klik poza), licznik do 27.04.2027, zakładki programu (strzałki/Home/End), walidacja formularza, tryb żywy rejestracji, animacje wejścia. |
| `server/` | Prototyp modułu rejestracji: API, baza, e-maile, panel zgłoszeń, CSV. Szczegóły: [`server/README.md`](server/README.md). |
| `tests/` | Testy API i panelu (`node --test`) oraz testy linków dokumentacji (`pytest`). |
| `tools/` | Walidator linków w dokumentacji. |
| `docs/` | [`TZ.md`](docs/TZ.md) (7 obszarów standardu), [`PLAN.md`](docs/PLAN.md) (fazy i checkpointy), [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) (warstwy i zagrożenia), [`oferta.md`](docs/oferta.md) (wycena + odpowiedzi na OPZ §8). |
| `assets/` | Herb gminy, zdjęcia w trzech szerokościach (`-800`, `-1200`, pełna) pod `srcset`. |
| `CHANGELOG.md` | Historia zmian (Keep a Changelog + SemVer). |
| `CONTRIBUTING.md` | Zasady pracy: lokalnie → GitHub → staging → prod, konwencja commitów, brak podpisów AI. |

---

## Sekcje strony a punkty OPZ

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

## Identyfikacja wizualna

Kierunek: nowoczesna energetyka i transformacja — OZE, fotowoltaika, magazynowanie, wodór,
infrastruktura — a nie wyłącznie wodór. Układ i sposób eksponowania treści inspirowane
z <https://rebuildukraine.in.ua/en>, ale projekt jest własny: inna paleta, inna typografia,
inny rytm sekcji. **Bez wideo** — wyłącznie fotografie i grafika wektorowa (SVG inline).

| Token | Wartość | Zastosowanie |
| --- | --- | --- |
| `--ink` | `#0c1b2a` | tła ciemnych sekcji, stopka, nagłówek |
| `--ink-2` / `--ink-3` | `#12293c` / `#1a354c` | warstwy i obramowania na ciemnym |
| `--red` | `#d8201a` | akcent, wykrzyknik w znaku, CTA |
| `--amber` | `#f6c445` | akcent na ciemnym tle, liczby |
| `--paper` | `#ffffff` | jasne sekcje |
| `--font` | Open Sans 400–800 | całość tekstu (SIL OFL, hostowany lokalnie) |
| `--radius` | 4–8 px | karty, pola, przyciski |

Znak wydarzenia: `H2O!dolanów` — wykrzyknik pełni rolę akcentu (czerwony na jasnym tle,
bursztynowy na ciemnym).

---

## Uruchomienie lokalne

Sama warstwa prezentacji (formularz w trybie demo):

```bash
python3 -m http.server 8000
# http://localhost:8000/h2odolanow_landing.html
```

Pełny zestaw z rejestracją, bazą i panelem (formularz w trybie żywym):

```bash
npm start          # podstrona: http://127.0.0.1:8787/   panel: /admin
npm test           # testy API i panelu (node --test)
python3 -m pytest tests/ -q   # testy dokumentacji
pre-commit run --all-files     # higiena, gitleaks, brak podpisów AI
```

Wymagania: Node.js ≥ 22.5, Python 3.11+ (narzędzia jakości). Krój Open Sans jest pobierany
z Google Fonts — dla wersji bez dostępu do internetu pobierz pliki `.woff2` i zamień
`<link>` na lokalne `@font-face`.

---

## Dokumentacja

| Dokument | Zawartość |
| --- | --- |
| [`docs/TZ.md`](docs/TZ.md) | Zadanie techniczne: biznes, cel, komendy, struktura, styl kodu, strategia testów, granice + kryteria sukcesu i otwarte pytania. |
| [`docs/PLAN.md`](docs/PLAN.md) | Graf zależności, fazy F0–F6, checkpointy, ryzyka. |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Warstwy, przepływ zgłoszenia, model zagrożeń, decyzje projektowe. |
| [`docs/oferta.md`](docs/oferta.md) | Wycena w trzech wariantach, odpowiedzi na 11 punktów OPZ §8, harmonogram, warunki, utrzymanie. |
| [`server/README.md`](server/README.md) | Konfiguracja prototypu, endpointy, kontrakt, e-maile, wdrożenie, ograniczenia. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Zasady pracy z repozytorium. |

---

## Dostępność (WCAG 2.1 AA)

- Semantyczne sekcje z `aria-labelledby`, jeden `h1`, logiczna hierarchia nagłówków.
- Link „Przejdź do głównej treści”, widoczny focus na wszystkim interaktywnym.
- Menu mobilne: `aria-expanded` / `aria-controls`, zamykanie `Escape`, klik poza, blokada przewijania tła.
- Zakładki programu wg wzorca ARIA: `role="tablist"`, strzałki, `Home`/`End`, `tabindex` na aktywnym.
- Licznik: `role="timer"`, `aria-live="off"` (nie rozprasza czytnika), ukrywany po starcie wydarzenia.
- Formularz: etykiety powiązane, `aria-required`, `aria-invalid`, komunikaty przez `aria-describedby`,
  status przez `role="status"`.
- Kontrast tekstu na ciemnym tle ≥ 4,5:1, `prefers-reduced-motion` wyłącza animacje wejścia,
  `forced-colors` dodaje obramowania.
- Mapa: `iframe` z `title`, `loading="lazy"`, link do większej mapy jako alternatywa.

Do sprawdzenia przed publikacją: kontrast po podmianie zdjęć, nawigacja klawiaturą po całej stronie,
czytnik ekranu (NVDA/VoiceOver), powiększenie 200%.

## Wydajność i SEO

- Każde zdjęcie w trzech szerokościach przez `srcset` + `sizes`; hero z `fetchpriority="high"`,
  pozostałe `loading="lazy"`.
- Łączna waga grafiki: ok. 0,9 MB dla wszystkich wariantów, pojedyncza wizyta pobiera
  ~180–330 KB obrazów zależnie od ekranu.
- Brak wideo, brak zewnętrznych bibliotek JS; jeden arkusz CSS i jeden plik JS.
- `font-display: swap` (Google Fonts), `preconnect` do `fonts.gstatic.com`.
- `<title>`, `meta description`, `og:title/description/image/url`, `twitter:card`, `theme-color`.
- Dane strukturalne `schema.org/Event` (data, miejsce, organizator, `isAccessibleForFree`).

Do ustawienia po publikacji: absolutne `og:image` i `og:url` (np. `https://www.odolanow.pl/h2odolanow/`),
`link rel="canonical"`, wpis w `sitemap.xml`, ewentualnie osobny obraz 1200×630 do social.

---

## Prawa do materiałów

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

## Checklista przed publikacją

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

---

## Licencja i kontakt

Kod: **MIT** — [`LICENSE`](LICENSE). Dokumentacja i treści podstrony pozostają własnością
Fayna Digital / Gminy i Miasta Odolanów zgodnie z umową.

Fayna Digital — kontakt@fayna.agency
