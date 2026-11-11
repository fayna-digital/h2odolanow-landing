# H2Odolanów – strona konferencji

Statyczna strona docelowa (landing page) ogólnopolskiej konferencji **H2Odolanów** o energetyce
i transformacji energetycznej. HTML + CSS + waniliowy JavaScript, bez zależności i bez procesu budowania.

## Struktura

| Plik | Rola |
| --- | --- |
| `h2odolanow_landing.html` | Cała strona: nagłówek, 9 sekcji treści, stopka. Miejsca na treść oznaczone komentarzami `<!-- CONTENT: ... -->`. |
| `h2odolanow_style.css` | Style: mobile-first, zmienne CSS, nawigacja mobilna, formularz, stany fokusa. |
| `h2odolanow_script.js` | Nawigacja mobilna (ARIA, Escape, klik poza menu), walidacja formularza, obsługa wysyłki. |

## Sekcje strony

`hero` · `o-konferencji` · `w-powitanie-burmistrza` · `program` · `prelegenci` ·
`miejsce` · `organizatorzy` · `rejestracja` · `kontakt`

## Uruchomienie lokalne

Wystarczy otworzyć plik HTML w przeglądarce albo podnieść dowolny serwer statyczny:

```bash
python3 -m http.server 8000
# http://localhost:8000/h2odolanow_landing.html
```

## Co jeszcze trzeba uzupełnić

1. **Treść** – wszystkie miejsca oznaczone `CONTENT` (tekst o konferencji, list burmistrza, agenda,
   lista prelegentów, adres miejsca, organizatorzy i patronaty, dane kontaktowe).
2. **Termin i miejsce** – `hero-date` oraz sekcja `miejsce`.
3. **Logotypy** – obecnie brak plików graficznych; `site-logo` to tekst. Po dodaniu logo podmień
   zawartość `.site-logo` na `<img>` z sensownym `alt`.
4. **Backend rejestracji** – formularz ma `action="#"`, więc waliduje dane i pokazuje komunikat
   „niepodłączony”, zamiast udawać zapis. Aby zapisy działały, ustaw `action` na endpoint przyjmujący
   `POST` z `FormData` (pola: `name`, `email`, `phone`, `organization`, `consent_rodo`, `consent_marketing`).
5. **RODO** – podlinkować politykę prywatności i potwierdzić treść klauzuli z administratorem danych.
6. **SEO** – dodać `og:image`, favicon oraz docelowy `og:url`.

## Dostępność

- Semantyczne nagłówki i sekcje z `aria-labelledby`, link „Przejdź do głównej treści”.
- Widoczny fokus (`:focus-visible`) na wszystkich elementach interaktywnych.
- Nawigacja mobilna sterowana atrybutem `aria-expanded`, zamykana klawiszem `Escape`.
- Błędy formularza powiązane z polami przez `aria-describedby` i `aria-invalid`.
- Obsługa `prefers-reduced-motion` oraz `forced-colors`.

## Wdrożenie

Strona jest w pełni statyczna – wystarczy wgrać trzy pliki na hosting (np. `https://odolanow.pl/konferencja/`).
