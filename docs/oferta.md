# Oferta: podstrona konferencji H2O!dolanów

**Dotyczy:** wykonanie podstrony internetowej typu landing page dla ogólnopolskiej konferencji
H2O!dolanów (27–28 kwietnia 2027 r.), zgodnie z *Opisem funkcjonalno-technicznym*.

**Wykonawca:** Fayna Digital
**Wersja:** robocza, do zatwierdzenia przez wykonawcę przed wysłaniem
**Ważność oferty:** 30 dni od daty przekazania
**Ceny:** netto w PLN; do każdej kwoty doliczany jest VAT według stawki obowiązującej w dniu wystawienia faktury

---

## 1. Podsumowanie

| Wariant | Zakres | Czas | Cena netto |
| --- | --- | --- | --- |
| **A — rekomendowany** | szablon w CMS urzędu + moduł rejestracji + panel zgłoszeń | 7 tygodni | **37 400 zł** |
| B | podstrona statyczna + własny panel treści (niezależny od CMS) | 8 tygodni | 43 200 zł |
| C — minimalny | frontend statyczny + rejestracja na formularzu CMS, bez panelu zgłoszeń | 4 tygodnie | 24 800 zł |

Rekomendujemy **wariant A**: spełnia wszystkie punkty OPZ (w tym edycję treści przez pracowników
urzędu i panel zgłoszeń), nie wprowadza drugiego systemu do utrzymania i korzysta z infrastruktury,
którą urząd już ma.

Wariant B wybieramy wtedy, gdy CMS urzędu nie pozwala na wstawienie własnego szablonu albo jego
wersja jest na tyle stara, że integracja byłaby ryzykiem. Wariant C — gdy rejestracja ma zostać
w istniejącym narzędziu (np. formularz CMS), a urząd nie potrzebuje panelu z eksportem.

---

## 2. Wycena szczegółowa — wariant A

Stawka: **180 zł netto / godzinę**. Wycena jest ryczałtowa — godziny poniżej służą pokazaniu zakresu,
nie rozliczeniu.

| Lp. | Etap | Godziny | Kwota netto |
| --- | --- | --- | --- |
| 1 | Analiza OPZ, warsztat z urzędem, ustalenie treści i kryteriów odbioru | 2 | 360 zł |
| 2 | Projekt graficzny: 2 koncepcje, wersja desktop i mobile, 2 rundy poprawek | 32 | 5 760 zł |
| 3 | Frontend: 12 sekcji, RWD, dostępność WCAG 2.1 AA, SEO techniczne | 56 | 10 080 zł |
| 4 | Szablon w CMS urzędu: pola edycyjne dla wszystkich sekcji, migracja treści | 24 | 4 320 zł |
| 5 | Moduł rejestracji: API, walidacja serwerowa, antyspam, e-maile | 28 | 5 040 zł |
| 6 | Panel zgłoszeń: lista, wyszukiwanie, filtry, CSV, edycja, otwieranie/zamykanie rejestracji, szablony e-maili | 36 | 6 480 zł |
| 7 | Testy: funkcjonalne, dostępność, RWD, dostarczalność poczty | 14 | 2 520 zł |
| 8 | Wdrożenie produkcyjne: konfiguracja SMTP, SPF/DKIM, kopie zapasowe, przekierowania | 8 | 1 440 zł |
| 9 | Instrukcja obsługi, szkolenie 2 h, 30 dni opieki powdrożeniowej | 8 | 1 440 zł |
| | **Razem** | **208** | **37 440 zł** |

Do zaokrąglenia w ofercie: **37 400 zł netto**.

### Co dokładnie powstaje

- podstrona w domenie `odolanow.pl` (adres do ustalenia, propozycja: `/h2odolanow/`),
- 12 sekcji: hero z licznikiem, o konferencji, powitanie Burmistrza, zakres tematyczny, liczby klastra,
  program dwóch dni z PDF, prelegenci, miejsce z mapą i autobusem, organizatorzy i patronaty,
  rejestracja, kontakt, stopka,
- moduł rejestracji z bazą zgłoszeń, potwierdzeniem e-mail dla uczestnika i powiadomieniem organizatora,
- panel administracyjny zgłoszeń z eksportem CSV (otwieranym bezpośrednio w Excelu),
- szablon CMS z polami do samodzielnej edycji wszystkich treści z OPZ 4.2–4.7 i 4.9,
- instrukcja obsługi panelu (PDF) i szkolenie pracowników.

---

## 3. Odpowiedzi na punkty OPZ §8

**1. Całkowity koszt zaprojektowania i wykonania podstrony**
37 400 zł netto w wariancie A (zakres pełny, zgodny z OPZ). Warianty B i C — w tabeli w punkcie 1.

**2. Szacowany czas realizacji**
7 tygodni od przekazania kompletnych materiałów (OPZ §7) i podpisania umowy. Sam frontend jest gotowy
w 3. tygodniu; tygodnie 4–6 to moduł rejestracji i panel, 7. — testy, wdrożenie i szkolenie.
Przy wariancie C: 4 tygodnie.

**3. Integracja z obecnym CMS i infrastrukturą**
Tak, pod warunkiem że CMS pozwala dodać własny szablon podstrony (Joomla, WordPress, Drupal — tak;
zamknięte systemy bez dostępu do szablonów — wymagają wariantu B). Potrzebujemy: nazwy i wersji CMS,
sposobu publikacji (panel / FTP / git), wersji PHP i bazy oraz zasad polityki cookies urzędu.
Integracja jest częścią wariantu A (etap 4).

**4. Koszt projektu graficznego i indywidualnego układu**
5 760 zł netto (etap 2). Dwie koncepcje, jedna do rozwinięcia, dwie rundy poprawek, pliki robocze
i eksport elementów graficznych. Identyfikacja wydarzenia (kolory, typografia, znak H2O!dolanów)
powstaje w tym etapie i jest przekazywana urzędowi.

**5. Koszt wdrożenia technicznego sekcji i funkcjonalności**
10 080 zł netto (frontend, etap 3) + 4 320 zł netto (szablon CMS, etap 4).
W tym responsywność, dostępność, SEO techniczne i optymalizacja wagi.

**6. Koszt formularza rejestracyjnego z panelem zgłoszeń**
11 520 zł netto (etapy 5 i 6): API z walidacją serwerową, antyspam, baza, dwa e-maile automatyczne,
panel z listą, wyszukiwaniem, filtrami, eksportem CSV, edycją zgłoszenia, zamykaniem rejestracji
i edycją treści e-maili.

**7. Czy rejestracja, przechowywanie i eksport są w jednym systemie**
Tak. Baza zgłoszeń, panel i eksport są częścią jednego modułu po stronie urzędu — bez zewnętrznego
narzędzia i bez dodatkowej integracji. Alternatywnie (wariant C) rejestracja może zostać
w istniejącym narzędziu urzędu, ale wtedy panel i eksport zależą od jego możliwości.

**8. Dodatkowe koszty: licencje, integracje, hosting, utrzymanie**

| Pozycja | Koszt | Uwaga |
| --- | --- | --- |
| Licencje na oprogramowanie | 0 zł | używamy CMS urzędu, bibliotek na wolnych licencjach (MIT/Apache) |
| Krój pisma Open Sans | 0 zł | licencja SIL OFL, można hostować lokalnie |
| Zdjęcia | 0 zł | zdjęcia własne urzędu; obecne ilustracje zastępcze mają wolne licencje |
| Hosting i domena | po stronie urzędu | istniejąca infrastruktura, bez nowych opłat |
| Skrzynka e-mail / SMTP | po stronie urzędu | wymagane SPF i DKIM; konfiguracja w etapie 8 |
| CAPTCHA | 0 zł | darmowy próg Cloudflare Turnstile wystarcza dla tej skali |
| Utrzymanie i wsparcie | 249 zł netto / miesiąc | opcjonalne, szczegóły niżej |

**9. Czy pracownicy urzędu będą samodzielnie aktualizować wszystkie treści**
Tak w wariancie A: teksty wszystkich sekcji, zdjęcia, program (dodawanie, usuwanie, zmiana kolejności
punktów), prelegenci, logotypy i patronaty, informacje organizacyjne, dane kontaktowe.
Formularz, jego pola i treści e-maili — z panelu zgłoszeń. Czego nie zmieniają sami: układu graficznego
i struktury sekcji (to wymaga zmiany szablonu). W wariancie B edycja odbywa się we własnym panelu treści,
w wariancie C — w CMS lub przez wykonawcę.

**10. Czy wykonawca zapewnia wdrożenie pracowników i instrukcję**
Tak: instrukcja PDF (zrzuty ekranu, scenariusze „jak zmienić program”, „jak dodać prelegenta”,
„jak wyeksportować zgłoszenia”) oraz szkolenie online 2 h dla 2–5 osób, z nagraniem.
W cenie wariantu A (etap 9).

**11. Koszty późniejszych aktualizacji, wsparcia i utrzymania**

| Pakiet | Cena netto | Zakres |
| --- | --- | --- |
| Gwarancja | 0 zł | 24 miesiące na wady, reakcja w 1 dzień roboczy, naprawa błędu krytycznego do 4 h |
| Opieka podstawowa | 249 zł / mies. | kopie zapasowe, aktualizacje bezpieczeństwa, monitoring dostępności, 2 h zmian miesięcznie |
| Zmiany ponad pakiet | 190 zł / h | drobne zmiany treści i układu, nowe sekcje, dodatkowe integracje |
| Rozliczenie | — | miesięcznie, wypowiedzenie z 1-miesięcznym okresem |

**Czy wszystko da się zrealizować w jednym projekcie i na jednej podstronie**
Tak — poza elementami, które z definicji są poza podstroną: serwer poczty (SMTP), hosting, certyfikat
SSL, polityka prywatności i deklaracja dostępności (dokumenty urzędu), a także treści i zdjęcia
dostarczane przez urząd. Panel zgłoszeń jest modułem aplikacji działającym obok podstrony w tej samej
domenie — technicznie osobny zestaw plików, dla użytkownika jedna całość.

---

## 4. Harmonogram

| Tydzień | Etap | Co oddajemy |
| --- | --- | --- |
| 1 | analiza, warsztat, zebranie materiałów | potwierdzony zakres i lista treści |
| 2 | projekt graficzny: 2 koncepcje | makiety desktop + mobile do akceptacji |
| 3 | frontend wszystkich sekcji | podgląd na serwerze testowym |
| 4–5 | moduł rejestracji, baza, e-maile | działający formularz, testy wysyłki |
| 6 | panel zgłoszeń, szablon CMS, migracja treści | panel + edytowalne sekcje |
| 7 | testy dostępności i RWD, wdrożenie, szkolenie | podstrona na produkcji, instrukcja, szkolenie |

Warunki utrzymania terminu: komplet materiałów w tygodniu 1, jedna zbiorcza lista uwag na każdym
etapie akceptacji, decyzje w 3 dni roboczych, dostęp do CMS i skrzynki w tygodniu 4.

---

## 5. Warunki

**Płatności:** 30% zaliczki, 40% po akceptacji projektu graficznego i frontendu, 30% po odbiorze
końcowym i szkoleniu. Faktury z 14-dniowym terminem.

**Gwarancja:** 24 miesiące na wady ukryte i błędy działania; 30 dni darmowej opieki powdrożeniowej
(etap 9). W tym czasie usuwamy błędy naszej pracy bez dodatkowych opłat.

**Co zapewnia urząd (OPZ §7):** teksty, program, dane prelegentów, logotypy, zdjęcia (w tym Burmistrza
i autobusu), dane kontaktowe, wzór klauzuli RODO zatwierdzony przez IOD, dostęp do CMS i skrzynki,
decyzje merytoryczne.

**Założenia wyceny:** jedna wersja językowa (polska), brak wideo (zgodnie z OPZ §2), brak integracji
z systemami zewnętrznymi poza SMTP, brak płatności online, brak tłumaczeń, treść dostarczona
w formie nadającej się do publikacji (bez redakcji merytorycznej ze strony wykonawcy).

**Poza wyceną:** produkcja wideo i sesje zdjęciowe, copywriting dłuższych tekstów, tłumaczenia,
materiały drukowane, opłaty hostingowe i domenowe, płatne usługi zewnętrzne, migracja innych podstron
urzędu.

---

## 6. Dlaczego tak

Podstrona ma dwa różne życia: przez 18 miesięcy przed wydarzeniem (program, prelegenci, rejestracja)
i dwa dni konferencji (obciążenie, setki zgłoszeń). Dlatego rozdzielamy warstwę prezentacji (statyczna,
szybka, odporna) od modułu rejestracji (baza, e-maile, panel). Taki układ:

- działa, gdy CMS urzędu ma przerwę techniczną — rejestracja i treść są niezależne,
- nie wymaga nowych licencji ani drugiej domeny,
- pozwala urzędowi zmieniać treść bez programisty, a nam — naprawiać błędy bez ruszania treści,
- jest zgodny z WCAG 2.1 AA i wymaganiami dostępności strony urzędu.

---

## 7. Kontakt

Fayna Digital
e-mail: kontakt@fayna.agency
