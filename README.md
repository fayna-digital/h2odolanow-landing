# H2Odolanów – strona konferencji

Statyczna strona docelowa (landing page) ogólnopolskiej konferencji **H2Odolanów** o energetyce
i transformacji energetycznej. HTML + CSS + waniliowy JavaScript, bez zależności i bez procesu budowania.

Warstwa wizualna jest odwzorowana na serwisie **Gminy i Miasta Odolanów** (<https://www.odolanow.pl/>),
żeby konferencja była wizualnie częścią tej samej marki.

## Struktura

| Plik | Rola |
| --- | --- |
| `h2odolanow_landing.html` | Cała strona: nagłówek, hero, 8 sekcji treści, stopka. Miejsca na treść oznaczone komentarzami `<!-- CONTENT: ... -->`. |
| `h2odolanow_style.css` | Style: tokeny marki, hero, pasy nagłówków sekcji, lista programu, karty prelegentów, formularz, stopka. |
| `h2odolanow_script.js` | Nawigacja mobilna (ARIA, Escape, klik poza menu), biały pasek nagłówka po przewinięciu, walidacja formularza, obsługa wysyłki. |
| `assets/` | `logo-odolanow.png` (herb), `hero-odolanow.jpg` (zdjęcie Odolanowa). |

## Sekcje strony

`hero` · `o-konferencji` · `w-powitanie-burmistrza` · `program` · `prelegenci` ·
`miejsce` · `organizatorzy` · `rejestracja` · `kontakt`

## Wygląd – skąd wzięte

Warstwa wizualna powtarza to, co definiuje serwis gminy:

| Element | Wartość |
| --- | --- |
| Krój pisma | Open Sans (400/600/700), zapasowo Arial |
| Kolor tekstu | `#2e2e2e` |
| Akcent (działania, linki, hover) | `#da251d` |
| Pasy nagłówków sekcji | `#154ba3`, biały tekst, wyśrodkowane |
| Linie i tła pomocnicze | `#dfe6ee`, `#d4dae2` |
| Ciemne pasy (stopka, powitanie) | `#2e2e2e` |
| Focus | `2px dotted #da251d` |
| Krawędzie | bez zaokrągleń |

Rozpoznawalne elementy serwisu użyte na stronie: pełnoekranowe hero ze zdjęciem i przyciemnieniem,
herb gminy nad tytułem, biały pasek „Przejdź do strony” pod hero, niebieskie pasy nagłówków,
wiersze listy zmieniające tło na czerwone przy hover, czerwony przycisk menu na mobile.

## Uruchomienie lokalne

Wystarczy otworzyć plik HTML w przeglądarce albo podnieść dowolny serwer statyczny:

```bash
python3 -m http.server 8000
# http://localhost:8000/h2odolanow_landing.html
```

Krój Open Sans jest pobierany z Google Fonts. Jeśli strona ma działać bez dostępu do internetu,
pobierz pliki `.woff2` i podmień `<link>` na lokalne `@font-face`.

## Co jeszcze trzeba uzupełnić

1. **Treść** – wszystkie miejsca oznaczone `CONTENT` (tekst o konferencji, list burmistrza, agenda,
   lista prelegentów, adres miejsca, organizatorzy i patronaty, dane kontaktowe).
2. **Termin i miejsce** – `hero__date` oraz sekcja `miejsce` (obecnie blok zastępczy zamiast mapy).
3. **Zdjęcia** – `assets/hero-odolanow.jpg` to zdjęcie Odolanowa z serwisu gminy; docelowo warto
   podmienić je na fotografię z konferencji (wystarczy nadpisać plik, ścieżka jest w HTML).
4. **Logotypy** – obecnie tylko herb gminy. Logotypy organizatorów, partnerów i patronów
   wstawić do `ul.org-grid`.
5. **Backend rejestracji** – formularz ma `action="#"`, więc waliduje dane i pokazuje komunikat
   „niepodłączony”, zamiast udawać zapis. Aby zapisy działały, ustaw `action` na endpoint przyjmujący
   `POST` z `FormData` (pola: `name`, `email`, `phone`, `organization`, `consent_rodo`, `consent_marketing`).
6. **RODO** – podlinkować politykę prywatności i potwierdzić treść klauzuli z administratorem danych.
7. **SEO** – dodać `og:image`, docelowy `og:url`, potwierdzić dane w `meta author`.

## Dostępność

- Semantyczne nagłówki i sekcje z `aria-labelledby`, link „Przejdź do głównej treści”.
- Widoczny fokus `2px dotted #da251d` na wszystkich elementach interaktywnych (jak w serwisie gminy).
- Nawigacja mobilna sterowana atrybutem `aria-expanded`, zamykana klawiszem `Escape`,
  panel na pełną wysokość ekranu.
- Błędy formularza powiązane z polami przez `aria-describedby` i `aria-invalid`.
- Obsługa `prefers-reduced-motion` oraz `forced-colors`.

## Prawa do materiałów

Herb (`assets/logo-odolanow.png`) i zdjęcie (`assets/hero-odolanow.jpg`) pochodzą z serwisu
`odolanow.pl` i są materiałami Gminy i Miasta Odolanów. Przed publikacją poza stroną gminy
potwierdź zgodę na wykorzystanie.

## Wdrożenie

Strona jest w pełni statyczna – wystarczy wgrać pliki na hosting (np. `https://odolanow.pl/konferencja/`).
