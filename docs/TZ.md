# TZ — H2O!dolanów (podstrona konferencji)

> Zadanie techniczne w 7 obszarach standardu repozytoriów Fayna.
> Dokument żyje w repozytorium i wersjonuje się razem z kodem.
> Status: **warstwa prezentacji + prototyp backendu — gotowe**, wdrożenie produkcyjne
> po decyzji wariantu z `docs/oferta.md`.

---

## 0. Business / Product

| Pytanie | Odpowiedź |
| --- | --- |
| **Dlaczego** | Gmina i Miasto Odolanów organizuje pierwszą ogólnopolską konferencję klastra energii (27–28.04.2027, teren Klastra Energii Odolanów–Przygodzice–Sulmierzyce). Podstrona jest jedynym miejscem, gdzie uczestnik zapisuje się, a organizator zbiera dane do listy i okładki programu. |
| **Dla kogo** | Odbiorca: uczestnicy konferencji (przedsiębiorcy, samorządy, instytucje, media), organizatorzy (pracownicy urzędu). |
| **Wartość** | Zgłoszenie zamiast e-maila: baza, potwierdzenie dla uczestnika, eksport CSV do okładki i listy uczestników. Bez rejestracji — brak danych do raportu, faktury i weryfikacji frekwencji. |
| **Miernik sukcesu biznesowego** | liczba zapisanych zgłoszeń w terminie; udział zgłoszeń z rolnictwem/OZE wg programu; brak zgłoszeń utraconych (każde zgłoszenie ma potwierdzenie e-mail); wykonanie okładki programu z bazy bez ręcznego przepisywania danych. |
| **Terminy** | 7 tygodni od przekazania materiałów (wariant A wyceny) — patrz harmonogram w `docs/PLAN.md`. |
| **Budżet** | wariant A 37 400 zł netto; wariant B 43 200 zł; wariant C 24 800 zł — `docs/oferta.md`. |
| **Odpowiedzialny** | Fayna Digital (wykonawca) / Urząd Gminy i Miasta Odolanów (zamawiający, administrator danych). |
| **Ryzyka biznesowe** | (1) komplet treści od urzędu przychodzi po tygodniu 1 — opóźnia cały harmonogram; (2) podstrona w domenie urzędu, ale rejestracja poza CMS — ryzyko rozjazdu treści; (3) szczyt rejestracji tuż przed wydarzeniem — baza i mail muszą wytrzymać kilkaset zgłoszeń; (4) brak decyzji o wariancie CMS = opóźnienie startu. |
| **UX-DoD** | Uczestnik rozumie ekran rejestracji bez instrukcji: wie, co wpisać, widzi potwierdzenie i rozumie, gdzie znajdzie potwierdzenie e-mail. |

---

## 1. Objective

**Co budujemy.** Podstronę konferencji w domenie urzędu (`odolanow.pl`) — warstwę prezentacyjną
bez frameworków oraz moduł rejestracji z bazą, e-mailami i panelem zgłoszeń.

**Dla kogo.** Dla uczestnika konferencji (rejestracja, informacje o programie i dojeździe)
i dla pracownika urzędu (odbiór zgłoszeń, eksport, zamknięcie rejestracji).

**Techniczny sukces =** warstwa prezentacyjna spełnia OPZ 4.1–4.10 i WCAG 2.1 AA; formularz
w trybie żywym zapisuje zgłoszenie w bazie, wysyła potwierdzenie i powiadomienie organizatora,
a panel pozwala je znaleźć, poprawić i wyeksportować do Excela.

**Granice zakresu (poza zakresem).** Wideo i sesje zdjęciowe, tłumaczenia, płatności online,
produkcja PDF programu, treści merytoryczne i zdjęcia — po stronie urzędu (OPZ §7).

---

## 2. Commands

```bash
# uruchomienie podstrony + backendu (http://127.0.0.1:8787/)
npm start

# testy (Node >= 22.5, baza testowa w katalogu tymczasowym)
npm test

# testy dokumentacji (linki w README/docs)
python3 -m pytest tests/test_docs_links.py -v

# kontrola jakości przed commitem
pre-commit run --all-files

# sama warstwa prezentacyjna (bez backendu)
python3 -m http.server 8000   # http://localhost:8000/h2odolanow_landing.html
```

Wymagania: Node.js ≥ 22.5 (`node:sqlite`), Python 3.11+ (tylko do narzędzi jakości),
`pre-commit` i `gitleaks` (opcjonalnie, do gatów).

---

## 3. Project Structure

```
.
├── h2odolanow_landing.html      # cała podstrona (12 sekcji + stopka)
├── h2odolanow_style.css         # tokeny identyfikacji i układ
├── h2odolanow_script.js         # menu, licznik, zakładki, formularz (tryb żywy/demo)
├── assets/                      # herb, zdjęcia w trzech szerokościach
├── server/                      # prototyp modułu rejestracji
│   ├── src/                     # config, db, validate, mail, app (routing), index
│   ├── public/admin/            # panel: index.html, app.css, app.js
│   └── README.md                # konfiguracja, endpointy, kontrakt, wdrożenie
├── tests/
│   ├── api.test.mjs             # testy API, panelu, statyki i bezpieczeństwa
│   └── test_docs_links.py       # test linków w dokumentacji
├── tools/check_docs_links.py    # walidator linków (używany przez test)
├── docs/
│   ├── TZ.md                    # ten dokument
│   ├── PLAN.md                  # fazy, graf zależności, checkpointy
│   ├── ARCHITECTURE.md          # warstwy, przepływ danych, zagrożenia
│   └── oferta.md                # wycena i odpowiedzi na OPZ §8
├── .github/workflows/ci.yml     # CI: testy + pre-commit
└── .pre-commit-config.yaml      # higiena, gitleaks, brak podpisów AI
```

---

## 4. Code Style

- **Frontend:** czysty HTML + CSS + waniliowy JavaScript (ES5-ish, bez `const/let` w skryptach
  strony), bez frameworków, bez procesu budowania. Nazewnictwo klas BEM-owe
  (`block__element--modifier`), tokeny CSS w `:root` (`--ink`, `--red`, `--amber`).
- **Backend:** moduły ESM (`.mjs`), `node:http` bez frameworka, każdy moduł eksportuje
  jedną odpowiedzialność (`config` → `db` → `validate` → `mail` → `app`).
- **Konfiguracja:** wyłącznie zmienne środowiskowe (`H2_*`, `PORT`, `HOST`); żadnych
  hardkodowanych adresów, haseł i kluczy w kodzie.
- **Bezpieczeństwo danych:** dane osobowe wstawiane do DOM wyłącznie przez `textContent`
  (bez `innerHTML`); adres IP nigdy wprost — tylko skrót SHA-256 z solą.
- **Język kodu i dokumentacji:** polski (klient i domena urzędu są polskojęzyczne);
  komentarze i komunikaty użytkownika po polsku, formatowanie zgodne z Prettier (2 spacje,
  LF, średnik na końcu linii).
- **Przykład stylu — walidacja po stronie serwera:**

```js
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

if (!EMAIL_RE.test(values.email)) {
  errors.email = 'Podaj poprawny adres e-mail.';
}
```

---

## 5. Testing Strategy

| Warstwa | Narzędzie | Zakres | Oczekiwanie |
| --- | --- | --- | --- |
| Testy API | `node --test` (`tests/api.test.mjs`) | endpointy publiczne (health, status, zapis), walidacja, honeypot, time-gate, duplikat, limit IP, panel (logowanie, filtry, edycja, usuwanie, CSV), statyka, path traversal, CSRF | 5/5 zielone; krytyczne ścieżki (zapis zgłoszenia, duplikat, limit, autoryzacja panelu) pokryte w całości |
| Testy dokumentacji | `pytest` (`tests/test_docs_links.py`) | wszystkie względne linki w `README.md` i `docs/*.md` muszą istnieć | zielone |
| Ręczne | Playwright / przeglądarka | 1440 / 768 / 390 px, menu mobilne, zakładki, formularz w trzech trybach (demo, żywy, zamknięta rejestracja), panel | brak błędów konsoli, brak poziomego przewijania |
| Jakość kodu | `pre-commit` | higiena plików, gitleaks, brak podpisów AI, składnia JS | zielone |
| CI | `.github/workflows/ci.yml` | `npm test`, `pytest`, `pre-commit run --all-files` | zielone na każdym PR |

Pokrycie krytycznych ścieżek docelowo ≥ 70 % (stan: ścieżki krytyczne pokryte testami
API; pomiar pokrycia JS do uruchomienia wraz z wersją produkcyjną modułu).

---

## 6. Boundaries

**Always**

- Zmiany powstają lokalnie → commit → push do GitHub → staging → prod (pull). Git jest
  jedynym źródłem prawdy.
- Przed commitem przechodzi `pre-commit run --all-files`; testy `npm test` i `pytest` zielone.
- Treści oznaczone `<!-- CONTENT: ... -->` czekają na treści od urzędu — nie zmyślamy ich.
- Fakty o klastrze (50 mln zł KPO, 3 gminy, 600+ instalacji PV, 400+ magazynów) pochodzą
  z materiałów gminy; cytaty są autentyczne, a daty i prelegenci — oznaczeni jako robocze.
- Zdjęcia obce mają kredyt w stopce i w `README.md` (licencje CC BY / CC BY-SA).

**Ask first**

- Zmiana zakresu OPZ, wyceny albo harmonogramu.
- Dodanie zależności runtime (dziś: zero zależności poza opcjonalnym `nodemailer`).
- Wdrożenie produkcyjne: SMTP, domena, HTTPS, reverse proxy, wybór wariantu CMS.
- Zmiana praw do materiałów (rezygnacja z licencji share-alike = podmiana zdjęć).
- Wysłanie jakiegokolwiek e-maila do uczestników z danymi produkcyjnymi.

**Never**

- **Nigdy nie pracujemy bezpośrednio na serwerze** — żadnych ręcznych poprawek plików,
  tymczasowych skryptów ani skryptów importowych na produkcji. Zmiany „na serwerze”
  znikają przy kolejnym `git pull`; Git — jedynym źródłem prawdy.
- Nigdy nie commitujemy sekretów (`.env`, `*.pem`, `*.key`, `*.crt`, tokeny) — wyłącznie
  przez zmienne środowiskowe, wzorce w `.gitignore`.
- Nigdy nie zapisujemy adresów IP wprost ani danych osobowych poza wyraźną zgodą.
- Nigdy nie dodajemy podpisów AI (współautorów) do commitów ani do plików — repozytorium
  jest wizerunkiem firmy.
- Nigdy nie publikujemy danych osobowych uczestników poza panelem i eksportem dla
  upoważnionych pracowników urzędu.
- Nigdy nie udajemy zapisu zgłoszenia, jeśli backend nie odpowiada — formularz mówi
  wprost, że działa w wersji demonstracyjnej.

---

## Success Criteria

Kryteria są testowalne i powiązane z sukcesem biznesowym z obszaru 0:

1. Podstrona zawiera wszystkie sekcje OPZ 4.1–4.10 i nie ma błędów konsoli w przeglądarce
   przy 1440 / 768 / 390 px, bez poziomego przewijania. *(UX-DoD)*
2. Kontrast tekstu ≥ 4,5:1, pełna obsługa klawiatury, poprawne role ARIA — weryfikacja
   ręczna i testy dostępności w fazie 7 (OPZ §8). *(WD 2.1 AA)*
3. Zgłoszenie z formularza trafia do bazy w < 2 s, uczestnik dostaje potwierdzenie,
   organizator powiadomienie — potwierdzone testem `tests/api.test.mjs` i plikami `.eml`. *(Miernik: brak utraconych zgłoszeń)*
4. Panel pozwala znaleźć zgłoszenie po nazwisku, adresie e-mail i instytucji, poprawić je,
   usunąć oraz wyeksportować do pliku otwieranego w Excelu. *(Miernik: okładka programu z bazy, bez przepisywania)*
5. Organizator może zamknąć rejestrację jednym przełącznikiem, a formularz informuje
   o tym odwiedzającego. *(Miernik: kontrola liczby zgłoszeń)*
6. Duplikat tego samego adresu e-mail jest odrzucany, a użytkownik dostaje czytelny komunikat. *(Miernik: jakość bazy)*
7. `npm test`, `pytest` i `pre-commit run --all-files` przechodzą w CI na każdym PR. *(Miernik: jakość dostarczenia)*

---

## Open Questions

1. Wariant wdrożenia (A: szablon w CMS urzędu, B: statyczna podstrona + własny panel,
   C: formularz w CMS) — decyzja zamawiającego; wpływa na koszt i termin.
2. Nazwa i wersja CMS urzędu oraz sposób publikacji (panel / FTP / git).
3. Adres podstrony w domenie (`/h2odolanow/` czy subdomena) — wpływa na ścieżki API.
4. Konto SMTP nadawcy, konfiguracja SPF/DKIM i adresy odbiorców powiadomień.
5. Kto w urzędzie ma dostęp do panelu i czy wymagane jest 2FA.
6. Zdjęcia autobusu demonstracyjnego, program w PDF, finalna lista prelegentów i patronatów.
7. Polityka retencji zgłoszeń i sposób jej egzekwowania (RODO).
