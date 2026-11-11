# Pakiet podania — szkic do wewnętrznego przeglądu

> **Status: SZKIC (roboczy).** Dokumenty w tym katalogu nie zostały wysłane do urzędu.
> Zawierają miejsca oznaczone `[do uzupełnienia: …]` oraz liczby robocze, które trzeba
> potwierdzić przed wysyłką. Źródło: <https://github.com/fayna-digital/h2odolanow-landing>
> (commit `4f26d24`).

Pakiet powstał z zawartości repozytorium — wszystkie liczby, terminy i opisy techniczne są
zgodne z `docs/oferta.md`, `docs/TZ.md`, `docs/ARCHITECTURE.md` i kodem w `server/`.
Nie ma tu informacji, których nie ma w repo: brak wymyślonych referencji, certyfikatów
ani doświadczenia klienta.

## Zawartość

| Plik | Rola | Format do wysyłki |
| --- | --- | --- |
| `pismo-ofertowe.md` | pismo ofertowe (list ofertowy) z podpisem i załącznikami | PDF (patrz `pismo-ofertowe.html` → PDF) |
| `pismo-ofertowe.html` | to samo w wersji do druku A4 | `pismo-ofertowe.pdf` (generowany, do dołączenia) |
| `anexa-1-odpowiedzi-opz-par-8.md` | odpowiedzi na 11 punktów OPZ §8 | PDF po przeglądzie |
| `anexa-2-opis-techniczny.md` | opis techniczny: warstwy, dostępność, bezpieczeństwo, RODO | PDF po przeglądzie |
| `anexa-3-harmonogram.md` | harmonogram tygodniowy, płatności, gwarancja, utrzymanie | PDF po przeglądzie |
| `anexa-4-portfolio.md` | portfolio firmy (wyłącznie publiczne repozytoria organizacji) | PDF po przeglądzie |
| `checklist-przed-wyslaniem.md` | lista rzeczy do domknięcia i podpisania | checklista wewnętrzna (nie do wysyłki) |

## Jak to wygenerować ponownie

```bash
# 1. pull najnowszej gałęzi main (pakiet trzyma się kodu)
git pull origin main

# 2. PDF pisma ofertowego (Playwright/Chromium)
python3 - <<'PY'
from playwright.sync_api import sync_playwright
from pathlib import Path
src = Path("docs/submission/pismo-ofertowe.html").resolve()
with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page()
    page.goto(src.as_uri())
    page.pdf(path="docs/submission/pismo-ofertowe.pdf", format="A4",
             print_background=True, margin={"top": "18mm", "bottom": "18mm",
                                           "left": "18mm", "right": "18mm"})
    b.close()
print("OK")
PY
```

## Zastrzeżenia

- Ceny są **netto**, bez VAT; stawka 180 zł/h to wewnętrzna stawka wyceny, nie cena publiczna.
- Terminy liczone są od daty przekazania kompletu materiałów (OPZ §7) i podpisania umowy.
- Treści podstrony (program, prelegenci, patronaty, zdjęcia) pozostają do uzupełnienia przez
  urząd — oferta nie obejmuje ich produkcji.
- Zakres obejmuje prace własne wykonawcy; dostęp do CMS, skrzynki pocztowej i domeny
  zapewnia zamawiający.
