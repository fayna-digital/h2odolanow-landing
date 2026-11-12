# Załącznik nr 2 — Opis techniczny realizacji

> SZKIC. Opisuje rozwiązanie zrealizowane w prototypie i przyjęte do wdrożenia produkcyjnego.
> Pełna dokumentacja: `docs/TZ.md` (zadanie), `docs/ARCHITECTURE.md` (warstwy), `docs/PLAN.md`
> (fazy), `server/README.md` (moduł rejestracji).

---

## 1. Architektura

Trzy warstwy, jedna domena urzędu, brak zależności wymagających utrzymania po stronie
Urzędu.

| Warstwa | Zawartość | Technologia |
| --- | --- | --- |
| Prezentacja | 12 sekcji OPZ 4.1–4.10, nagłówek, stopka, formularz | HTML5, CSS3 (custom properties, `grid`, `clamp()`), waniliowy JavaScript |
| API | przyjmowanie zgłoszeń, walidacja, limity, panel, eksport CSV | Node.js ≥ 22.5, wbudowane `node:http`, zero frameworków |
| Dane i poczta | baza zgłoszeń, ustawienia, dziennik audytu, dwa wiadomości e-mail | SQLite (WAL) + `node:sqlite`, transport `file` lub SMTP |

Podstrona jest statyczna — działa nawet przy chwilowej awarii CMS. Moduł rejestracji jest
niezależny od warstwy prezentacyjnej: rejestracja i treść nie blokują się nawzajem.

## 2. Sekcje podstrony

Realizacja obejmuje wszystkie wymagane sekcje: hero z licznikiem do wydarzenia, o konferencji,
powitanie Burmistrza, zakres tematyczny, liczby klastra energii, program dwóch dni
(zakładki zgodne ze wzorcem ARIA, godziny, typy punktów, wersja PDF do pobrania), prelegenci
i moderatorzy, miejsce z mapą, dojazdem, parkingiem i autobusem, organizatorzy, partnerzy
i patronaty, formularz rejestracyjny, kontakt oraz stopka z linkami formalnymi.

Warstwa graficzna to wyłącznie fotografie i grafika wektorowa — **bez wideo**, zgodnie
z OPZ §2. Zdjęcia dostarczone przez Urząd podmieniamy pod tymi samymi nazwami plików,
bez zmian w kodzie strony.

## 3. Dostępność (WCAG 2.1 AA)

- Semantyczne sekcje z `aria-labelledby`, jeden `h1`, logiczna hierarchia nagłówków.
- Widoczny fokus na wszystkich elementach interaktywnych, kontrast ≥ 4,5:1 na ciemnym tle.
- Menu mobilne: `aria-expanded` / `aria-controls`, zamykanie klawiszem `Escape`, zamknięcie
  kliknięciem poza menu, blokada przewijania tła.
- Zakładki programu: `role="tablist"`, nawigacja strzałkami, `Home` / `End`, `tabindex`
  na aktywnej zakładce.
- Licznik dni: `role="timer"`, `aria-live="off"` (nie rozprasza czytnika ekranu).
- Formularz: powiązane etykiety, `aria-required`, `aria-invalid`, komunikaty przez
  `aria-describedby`, status przez `role="status"`; fokus przenoszony na pierwsze błędne pole.
- `prefers-reduced-motion` wyłącza animacje wejścia, `forced-colors` dodaje obramowania.
- Alternatywa dla mapy: mapa z linkiem do pełnego widoku.

## 4. Formularz rejestracyjny i ochrona przed nadużyciami

Pola: imię i nazwisko, instytucja/firma, stanowisko, e-mail, telefon, miejscowość,
rodzaj zgłoszenia (uczestnik / prelegent / partner / media), informacje dodatkowe; zgoda RODO
(wymagana) i opcjonalna zgoda na kontakt informacyjny wraz z informacją o administratorze
danych.

Ochrona przed automatycznymi zgłoszeniami: pole-pułapka (honeypot), blokada wysyłki przed
upływem 2 sekund od wejścia na stronę, limit 5 zgłoszeń na 10 minut z jednego adresu IP,
unikalność adresu e-mail w bazie. W wariancie produkcyjnym dochodzi CAPTCHA
(Cloudflare Turnstile — próg darmowy wystarcza przy tej skali).

Walidacja działa po stronie klienta (natychmiastowa informacja) i po stronie serwera
(walidacja jest nadrzędna — frontendu nie da się obejść).

## 5. Moduł rejestracji i panel zgłoszeń

- API: `POST /api/registrations` (JSON lub formularz), `GET /api/health`,
  `GET /api/registration-status`; odpowiedzi: `201` zapis, `202` (bot — bez zapisu),
  `400` błąd walidacji z komunikatami przy polach, `409` duplikat e-mail,
  `429` limit, `503` rejestracja zamknięta.
- Baza: jedna tabela zgłoszeń, ustawienia (w tym treści wiadomości e-mail), dziennik audytu.
- Panel `/admin`: logowanie, podsumowanie liczb, wyszukiwanie i filtry (rodzaj, status,
  zakres dat), tabela z danymi, edycja zgłoszenia, trwałe usunięcie, **eksport CSV**
  (z BOM i średnikiem — otwiera się wprost w Excelu), przełącznik otwarcia rejestracji,
  edycja treści dwóch wiadomości e-mail.
- Dwa wiadomości automatyczne na zgłoszenie: potwierdzenie dla uczestnika i powiadomienie
  organizatora; treści edytowalne z panelu (znaczniki typu `{{name}}`, `{{date}}`).

## 6. Bezpieczeństwo danych i RODO

- Adres IP nie jest zapisywany wprost — wyłącznie 16-znakowy skrót z solą.
- Dziennik audytu: logowania, nieudane próby logowania, utworzenie, edycja i usunięcie
  zgłoszenia, eksport danych.
- Panel chroniony hasłem (w produkcji: konta z rolami i 2FA), sesja w ciasteczku `HttpOnly`
  i `SameSite=Strict`, mutacje wymagają dodatkowego nagłówka anty-CSRF.
- CSP i `X-Frame-Options: DENY` dla panelu, `X-Content-Type-Options: nosniff` globalnie,
  ograniczenie rozmiaru żądania (64 KB).
- Dane osobowe wstawiane do panelu wyłącznie przez `textContent` — brak interpretacji HTML.
- Trwałe usunięcie zgłoszenia na żądanie; kopie zapasowe zgodne z polityką retencji Urzędu.

## 7. Wydajność i SEO

- Zdjęcia w trzech szerokościach (`srcset` + `sizes`), hero z `fetchpriority="high"`,
  pozostałe `loading="lazy"`; pojedyncza wizyta pobiera ok. 180–330 KB grafik.
- Jeden arkusz CSS, jeden plik JS, brak zewnętrznych bibliotek, brak wideo.
- `title`, `meta description`, Open Graph, Twitter Card, `theme-color`, dane strukturalne
  `schema.org/Event` (data, miejsce, organizator, `isAccessibleForFree`).
- Po publikacji: absolutne `og:url`/`og:image`, `canonical`, wpis w `sitemap.xml`.

## 8. Technologie i zależności

HTML5, CSS3, waniliowy JavaScript (bez frameworków i bez procesu budowania), Node.js 22.5+,
wbudowany `node:sqlite`, SQLite. Brak zależności obowiązkowych po stronie wdrożenia —
jedyna opcjonalna to `nodemailer`, gdy transportem poczty jest SMTP.

## 9. Testy i zapewnienie jakości

Testy jednostkowe i integracyjne API (przyjęcie zgłoszenia, duplikat, walidacja, honeypot,
time-gate, limit IP, panel, eksport CSV, ochrona ścieżek), testy dostępności i responsywności
na trzech szerokościach ekranu, test dostarczalności wiadomości, kontrola jakości kodu
i dokumentacji w CI (GitHub Actions) oraz w钩овkach pre-commit.
