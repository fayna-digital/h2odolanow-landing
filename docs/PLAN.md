# PLAN — H2O!dolanów

Realizacja wariantu A z `docs/oferta.md` (7 tygodni). Graf zależności, fazy, checkpointy
i kryteria przejścia między fazami. Stan na 2026-11-11: **fazy 0–2 zrealizowane w repozytorium
jako prototyp**; dalsze fazy wymagają materiałów od urzędu i decyzji o wariancie CMS.

---

## 1. Graf zależności

```
        [Materiały od urzędu: OPZ §7, treści, zdjęcia, logo, SMTP]
                          │
                          ▼
        F0  warsztat + kryteria odbioru ────────┐
                          │                       │
                          ▼                       │
        F1  identyfikacja wizualna              │
                          │                       │
                          ▼                       │
        F2  frontend: 12 sekcji, RWD, WCAG      │
                          │                       │
                          ▼                       │
        F3  moduł rejestracji ──► F4  panel zgłoszeń
                          │                       │
                          └───────────┬───────────┘
                                      ▼
                          F5  szablon CMS + migracja treści
                                      │
                                      ▼
                          F6  testy, wdrożenie, szkolenie
```

Zależności twarde: F2 wymaga F1 (tokeny i znak), F3 wymaga kontraktu z F2, F4 wymaga F3,
F5 wymaga zgodności treści z F2, F6 wymaga kompletu poprzednich faz.

---

## 2. Fazy, checkpointy, kryteria wyjścia

| Faza | Tydzień | Zakres | Checkpoint (co musi być) | Kryterium wyjścia | Stan |
| --- | --- | --- | --- | --- | --- |
| **F0** Analiza i zakres | 1 | warsztat z urzędem, wykaz treści, kryteria odbioru | ustalona lista treści i podpisany zakres | każdy punkt OPZ 4.1–4.10 ma właściciela i źródło treści | ⬜ wymaga urzędu |
| **F1** Identyfikacja | 1–2 | paleta, typografia, znak `H2O!dolanów`, komponenty | 2 makiety desktop + mobile | akceptacja wizualna, tokeny w `:root` | ✅ w repo (`h2odolanow_style.css`) |
| **F2** Frontend | 2–3 | 12 sekcji, menu mobilne, zakładki, licznik, formularz | podgląd na serwerze testowym | brak błędów konsoli, brak poziomego scrolla w 1440/768/390, kontrast ≥ 4,5:1 | ✅ w repo |
| **F3** Rejestracja | 4–5 | API, walidacja, baza, e-maile, antyspam | działający formularz + test wysyłki | `POST /api/registrations` → 201 + 2 wiadomości; 400/409/429/503 obsłużone | ✅ prototyp w `server/` |
| **F4** Panel zgłoszeń | 6 | logowanie, lista, filtry, edycja, usuwanie, CSV, szablony maili | panel + instrukcja | eksport CSV otwiera się w Excelu; zamknięcie rejestracji działa | ✅ prototyp w `server/public/admin` |
| **F5** CMS i treści | 6 | szablon w CMS urzędu, pola edycyjne, migracja treści | edytowalne sekcje | pracownik urzędu zmienia program i prelegenta bez programisty | ⬜ wymaga CMS |
| **F6** Testy i wdrożenie | 7 | dostępność, RWD, dostarczalność poczty, HTTPS, SPF/DKIM, kopia zapasowa, instrukcja, szkolenie | produkcja + instrukcja + szkolenie | checklist z `README.md` zamknięty, monitoring działa | ⬜ wymaga serwera |

---

## 3. Co już jest w repozytorium

| Artefakt | Faza | Uwagi |
| --- | --- | --- |
| `h2odolanow_landing.html`, `h2odolanow_style.css`, `h2odolanow_script.js` | F1–F2 | komplet 12 sekcji + stopka, RWD, WCAG 2.1 AA, SEO |
| `assets/` | F1–F2 | herb + zdjęcia w trzech szerokościach, kredyty w stopce |
| `server/src/*`, `server/public/admin/*` | F3–F4 | prototyp API, bazy, e-maili i panelu; zero zależności runtime |
| `tests/api.test.mjs` | F3–F4, F6 | 5 zestawów testów: API, antyspam, limity, panel, statyka, bezpieczeństwo |
| `tests/test_docs_links.py`, `tools/check_docs_links.py` | F6 | spójność dokumentacji |
| `docs/oferta.md` | F0 | wycena + odpowiedzi na OPZ §8 |
| `docs/TZ.md`, `docs/PLAN.md`, `docs/ARCHITECTURE.md` | F0, F6 | dokumentacja zgodna ze standardem repozytoriów |

---

## 4. Checkpointy jakości (CI)

| Checkpoint | Kiedy | Narzędzie | Stan |
| --- | --- | --- | --- |
| Testy API i panelu | każdy push do `main` / PR | `npm test` (`node --test`) | ✅ |
| Testy linków dokumentacji | każdy push | `pytest tests/test_docs_links.py` | ✅ |
| Higiena plików, gitleaks, brak podpisów AI | każdy push | `pre-commit run --all-files` | ✅ |
| Składnia JS | każdy push | `node --check` (hook lokalny) | ✅ |
| Dostępność (kontrast, klawiatura, czytnik) | F6 | ręcznie + audyt WCAG 2.1 AA | ⬜ |
| Obciążenie (500+ zgłoszeń) | F6 | test obciążeniowy API | ⬜ |

---

## 5. Ryzyka i reakcje

| Ryzyko | Prawdopodobieństwo | Wpływ | Reakcja |
| --- | --- | --- | --- |
| Materiały od urzędu po tygodniu 1 | wysokie | opóźnienie całego harmonogramu | tygodniowy check-in, lista braków w `docs/oferta.md` §5 |
| CMS nie pozwala na własny szablon | średnie | wariant A niemożliwy | wariant B (panel treści) w ofercie; decyzja w tygodniu 1 |
| Szczyt rejestracji przed wydarzeniem | wysokie | timeouty, utrata zgłoszeń | kolejka wysyłki, test obciążeniowy, monitoring, limit per IP |
| Brak konfiguracji SPF/DKIM | średnie | wiadomości w spamie | etap 8 wdrożenia + test dostarczalności |
| Duplikat zgłoszeń (wiele urządzeń) | średnie | bałagan w bazie | unikalny indeks po `lower(email)` + komunikat 409 w formularzu |
| Zdjęcia pod licencją share-alike | niskie | konflikt z polityką urzędu | podmiana na zdjęcia własne gminy (nazwy plików bez zmian w HTML) |

---

## 6. Kolejność po akceptacji oferty

1. Tydzień 1 — F0: warsztat, zebranie materiałów, decyzja wariantu CMS, potwierdzenie treści.
2. Tydzień 2–3 — F1–F2: makiety, akceptacja, frontend, podgląd testowy.
3. Tydzień 4–5 — F3: moduł rejestracji na realnym SMTP, dane testowe urzędu.
4. Tydzień 6 — F4–F5: panel, szablon CMS, migracja treści, instrukcja.
5. Tydzień 7 — F6: testy dostępności i RWD, wdrożenie produkcyjne, szkolenie 2 h, 30 dni opieki.
