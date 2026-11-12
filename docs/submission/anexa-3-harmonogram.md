# Załącznik nr 3 — Harmonogram, płatności, gwarancja i utrzymanie

> SZKIC. Harmonogram w wariancie A (7 tygodni). Tygodnie liczone od przekazania kompletu
> materiałów (OPZ §7) i podpisania umowy.

---

## 1. Harmonogram tygodniowy (wariant A)

| Tydzień | Etap | Co powstaje | Kamień milowy (checkpoint) |
| --- | --- | --- | --- |
| **1** | Analiza OPZ, warsztat z Urzędem, zebranie treści | potwierdzony zakres, wykaz treści, kryteria odbioru, wybór wariantu CMS | lista materiałów i braków — bez niej harmonogram się nie startuje |
| **2** | Projekt graficzny | 2 koncepcje (desktop + mobile), 1 do rozwinięcia | wybór koncepcji, tokeny identyfikacji, znak H2O!dolanów |
| **2–3** | Frontend | wszystkie sekcje OPZ 4.1–4.10, RWD, WCAG 2.1 AA, SEO techniczne, formularz | podgląd na serwerze testowym, 2 rundy poprawek |
| **4–5** | Moduł rejestracji | API, walidacja serwerowa, antyspam, baza, 2 wiadomości e-mail | działający formularz, test wysyłki na skrzynce Urzędu |
| **6** | Panel zgłoszeń | logowanie, lista, filtry, edycja, usuwanie, eksport CSV, szablony e-maili | panel + instrukcja obsługi (szkic) |
| **6** | Szablon CMS + migracja treści | pola edycyjne dla treści OPZ 4.2–4.7 i 4.9 | pracownik Urzędu zmienia program i prelegenta bez programisty |
| **7** | Testy, wdrożenie, szkolenie | testy dostępności i RWD, produkcja, instrukcja PDF, szkolenie 2 h | produkcja, instrukcja, szkolenie, 30 dni opieki powdrożeniowej |

### Warunki utrzymania terminu

1. Komplet materiałów (teksty, zdjęcia, logo, program, dane prelegentów) w tygodniu 1.
2. Jedna zbiorcza lista uwag na każdym etapie akceptacji — nie wiele list po kolei.
3. Decyzje Zamawiającego w 3 dni robocze.
4. Dostęp do CMS i skrzynki pocztowej w tygodniu 4.
5. Wybór wariantu CMS (A/B/C) przed startem tygodnia 2.

### Prace poza harmonogramem (po stronie Urzędu)

Dostarczenie treści i zdjęć, zatwierdzenie klauzuli RODO przez IOD, wybór wariantu,
akceptacje etapów, udostępnienie skrzynki nadawczej z konfiguracją SPF/DKIM.

---

## 2. Schemat płatności

| Etap | Wymagalność | Udział | Kwota netto (wariant A) |
| --- | --- | --- | --- |
| Zaliczka | po podpisaniu umowy | 30% | 11 220 zł |
| Etap 1 — projekt graficzny + frontend | po akceptacji projektu graficznego i frontendu | 40% | 14 960 zł |
| Etap 2 — odbiór końcowy | po odbiorze i szkoleniu | 30% | 11 220 zł |
| | | **100%** | **37 400 zł** |

Faktury z 14-dniowym terminem płatności, przelew na rachunek Wykonawcy.

---

## 3. Gwarancja

| Parametr | Wartość |
| --- | --- |
| Okres | 24 miesiące od odbioru |
| Zakres | wady ukryte i błędy działania (w tym dostępność WCAG 2.1 AA poza zmianami treści) |
| Reakcja | 1 dzień roboczy od zgłoszenia |
| Naprawa błędu krytycznego | do 4 h (blokada rejestracji, niedostępność strony, brak zapisu zgłoszeń) |
| Opieka powdrożeniowa | 30 dni w cenie — usuwanie błędów własnej pracy bez dodatkowych opłat |
| Wyłączenia | zmiany treści przez Zamawiającego, brak dostępu do skrzynki/Domeny, brak aktualizacji bezpieczeństwa po stronie serwera Urzędu, decyzje dotyczące dostawców zewnętrznych (CAPTCHA, SMS, bramki płatności) |

---

## 4. Utrzymanie po okresie gwarancyjnym (opcjonalnie)

| Pozycja | Cena netto | Zakres |
| --- | --- | --- |
| Opieka podstawowa | 249 zł/mies. | kopie zapasowe bazy, aktualizacje bezpieczeństwa, monitoring dostępności, 2 h zmian miesięcznie |
| Zmiany ponad pakiet | 190 zł/h | nowe sekcje, drobne zmiany treści i układu, dodatkowe integracje |
| Rozliczenie | — | miesięcznie, wypowiedzenie z 1-miesięcznym okresem |

---

## 5. Co wchodzi w cenę, a co nie

**W cenie:** projekt graficzny, warstwa prezentacyjna, szablon CMS, moduł rejestracji,
panel zgłoszeń, testy, wdrożenie produkcyjne, instrukcja obsługi, szkolenie 2 h,
30 dni opieki powdrożeniowej, gwarancja 24 miesiące.

**Poza ceną:** produkcja wideo i sesje zdjęciowe, copywriting dłuższych tekstów,
tłumaczenia, materiały drukowane, opłaty hostingowe i domenne, płatne usługi zewnętrzne
(np. płatny CAPTCHA), migracja innych podstron Urzędu.
