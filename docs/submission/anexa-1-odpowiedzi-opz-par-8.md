# Załącznik nr 1 — Odpowiedzi na punkty OPZ §8

> SZKIC. Odpowiedzi w wariancie A (rekomendowanym); różnice wariantów oznaczono wprost.

---

### 1. Całkowity koszt zaprojektowania i wykonania podstrony

**Wariant A: 37 400 zł netto** — zakres pełny zgodny z OPZ (projekt graficzny, warstwa
prezentacyjna, szablon CMS, moduł rejestracji, panel zgłoszeń, testy, wdrożenie,
instrukcja i szkolenie). Wariant B: 43 200 zł netto. Wariant C: 24 800 zł netto.
Stawka wyceny: 180 zł netto za godzinę; rozbicie godzinowe — w `docs/oferta.md` (§2).

### 2. Szacowany czas realizacji

**7 tygodni** od przekazania kompletnych materiałów (OPZ §7) i podpisania umowy.
Frontend gotowy w 3. tygodniu; tygodnie 4–6 to moduł rejestracji, panel zgłoszeń i szablon
CMS; 7. tydzień to testy, wdrożenie i szkolenie. Wariant B: 8 tygodni; wariant C: 4 tygodnie.

### 3. Integracja z obecnym CMS i infrastrukturą

**Tak**, pod warunkiem że CMS pozwala dodać własny szablon podstrony (Joomla, WordPress,
Drupal — tak; zamknięte systemy bez dostępu do szablonów — wymagają wariantu B).
Potrzebujemy od Urzędu: nazwy i wersji CMS, sposobu publikacji (panel / FTP / git), wersji
PHP i bazy oraz zasad polityki cookies. Integracja jest częścią wariantu A (etap 4 wyceny).

### 4. Koszt projektu graficznego i indywidualnego układu

**5 760 zł netto** (etap 2 wyceny, 32 h). Zawiera: dwie koncepcje, jedną do rozwinięcia,
dwie rundy poprawek, układ desktop i mobile oraz identyfikację wydarzenia (paleta,
typografia, znak **H2O!dolanów**) przekazaną Urzędowi do dalszego użycia.
Gotowy projekt graficzny jest w repozytorium realizacji i może stanowić podstawę do
przedstawienia przed postępowaniem.

### 5. Koszt wdrożenia technicznego sekcji i funkcjonalności

**10 080 zł netto** (frontend, etap 3) + **4 320 zł netto** (szablon CMS, etap 4).
W cenie: responsywność, dostępność WCAG 2.1 AA, SEO techniczne, optymalizacja wagi
grafiki oraz brak wideo zgodnie z OPZ §2.

### 6. Koszt formularza rejestracyjnego wraz z panelem zgłoszeń

**11 520 zł netto** (etapy 5 i 6): API z walidacją serwerową, zabezpieczenia
antyspamowe, baza zgłoszeń, dwa wiadomości e-mail automatyczne, panel z listą,
wyszukiwaniem, filtrami, eksportem CSV (gotowy do Excela), edycją zgłoszenia,
zamykaniem i otwieraniem rejestracji oraz edycją treści wiadomości.

### 7. Czy rejestracja, przechowywanie i eksport są w jednym systemie

**Tak.** Baza zgłoszeń, panel i eksport należą do jednego modułu po stronie Urzędu —
bez zewnętrznego narzędzia i bez dodatkowej integracji. W wariancie C rejestracja może zostać
w istniejącym narzędziu Urzędu, ale panel i eksport zależą wtedy od jego możliwości.

### 8. Dodatkowe koszty: licencje, integracje, hosting, utrzymanie

| Pozycja | Koszt | Uwagi |
| --- | --- | --- |
| Licencje na oprogramowanie | 0 zł | CMS Urzędu + biblioteki na wolnych licencjach (MIT/Apache) |
| Krój pisma Open Sans | 0 zł | licencja SIL OFL, można hostować lokalnie |
| Zdjęcia | 0 zł | zdjęcia własne Urzędu; obecne ilustracje zastępcze mają wolne licencje |
| Hosting i domena | po stronie Urzędu | istniejąca infrastruktura, bez nowych opłat |
| Skrzynka e-mail / SMTP | po stronie Urzędu | wymagane SPF i DKIM — konfiguracja w etapie 8 |
| CAPTCHA | 0 zł | darmowy próg Cloudflare Turnstile wystarcza dla tej skali |
| Utrzymanie i wsparcie | 249 zł netto/mies. | opcjonalne — zakres poniżej |

### 9. Czy pracownicy Urzędu będą samodzielnie aktualizować wszystkie treści

**Tak, w wariancie A.** Teksty wszystkich sekcji, zdjęcia, program (dodawanie, usuwanie,
zmiana kolejności punktów), prelegenci, logotypy i patronaty, informacje organizacyjne
i dane kontaktowe — edytowane z panelu CMS. Formularz, jego pola i treści wiadomości
e-mail — z panelu zgłoszeń. Układu graficznego i struktury sekcji nie zmieniają sami —
to wymaga zmiany szablonu. W wariancie B edycja odbywa się we własnym panelu treści,
w wariancie C — w CMS lub przez Wykonawcę.

### 10. Czy Wykonawca zapewnia wdrożenie pracowników i instrukcję

**Tak:** instrukcja PDF (zrzuty ekranu, scenariusze „jak zmienić program”, „jak dodać
prelegenta”, „jak wyeksportować zgłoszenia”) oraz szkolenie online 2 h dla 2–5 osób
z nagraniem. W cenie wariantu A (etap 9).

### 11. Koszty późniejszych aktualizacji, wsparcia i utrzymania

| Pakiet | Cena netto | Zakres |
| --- | --- | --- |
| Gwarancja | 0 zł | 24 miesiące na wady, reakcja w 1 dzień roboczy, naprawa błędu krytycznego do 4 h |
| Opieka podstawowa | 249 zł/mies. | kopie zapasowe, aktualizacje bezpieczeństwa, monitoring dostępności, 2 h zmian miesięcznie |
| Zmiany ponad pakiet | 190 zł/h | drobne zmiany treści i układu, nowe sekcje, dodatkowe integracje |
| Rozliczenie | — | miesięcznie, wypowiedzenie z 1-miesięcznym okresem |

### Czy wszystko da się zrealizować w jednym projekcie i na jednej podstronie

**Tak** — poza elementami, które z definicji są poza podstroną: serwer poczty (SMTP),
hosting, certyfikat SSL, polityka prywatności i deklaracja dostępności (dokumenty Urzędu)
oraz treści i zdjęcia dostarczane przez Urząd. Panel zgłoszeń jest modułem aplikacji
działającym obok podstrony w tej samej domenie — technicznie osobny zestaw plików,
dla użytkownika jedna całość.
