# Contributing — H2O!dolanów

Dziękujemy za wkład. Repozytorium prowadzimy według **standardu repozytoriów Fayna**
(`docs/TZ.md`, `docs/PLAN.md`) i zasady: *lokalnie → GitHub → staging → prod*.

---

## Zasada nadrzędna — #4ZONES

> **NIGDY nie pracujemy bezpośrednio na serwerze.** Ścieżka: lokalnie → GitHub (push) →
> staging → prod (pull). Żadnych ręcznych poprawek plików, tymczasowych skryptów ani
> skryptów importowych na produkcji — najpierw lokalnie, commit, push, potem pull.
> Zmiany „na serwerze” znikają przy kolejnym `git pull`; **Git jest jedynym źródłem prawdy**.

## Zmiany w kodzie

```bash
npm test                        # testy API i panelu (node --test)
python3 -m pytest tests/ -q     # testy dokumentacji
pre-commit run --all-files      # higiena, gitleaks, brak podpisów AI, składnia JS
npm start                       # podgląd lokalny: http://127.0.0.1:8787/
```

- Node.js ≥ 22.5 (wbudowane `node:sqlite`), Python 3.11+ (narzędzia jakości).
- Zero zależności runtime. Jeśli nowa zależność jest naprawdę potrzebna — najpierw pytanie
  do właściciela repozytorium.
- Konfiguracja wyłącznie przez zmienne środowiskowe (`H2_*`, `PORT`, `HOST`).
- Dane osobowe w DOM tylko przez `textContent`. Adresy IP — wyłącznie jako skrót z solą.

## Commit message

- Konwencja: `<typ>(<zakres>): <opis>` — np. `feat(form): obsługa 409 w formularzu`,
  `docs(TZ): doprecyzowanie kryteriów sukcesu`, `fix(landing): kotwice sekcji na mobile`.
- **Bez podpisów AI** — commity nie mogą zawierać trajlera współautora ani wzmianek
  o generowaniu kodu przez asystenta; pilnuje tego hook `no-ai-signature`.

## Treści dokumentacyjne

- Miejsca do uzupełnienia oznaczamy komentarzem `<!-- CONTENT: ... -->` — **nie zmyślamy**
  faktów, nazwisk ani zdjęć.
- Zmiany treści dokumentacyjnej (README, `docs/`) zaznaczamy w `CHANGELOG.md` jako
  dokumentacyjne (`docs:`), zmiany kodu jako `feat:` / `fix:` / `chore:`.
- Linki w dokumentacji muszą wskazywać na istniejące pliki — pilnuje tego
  `tools/check_docs_links.py`.

## Prawa do materiałów

Zdjęcia obce (Wikimedia Commons) mają licencje CC BY / CC BY-SA i wymagają kredytu —
kredyt jest w stopce podstrony i w `README.md`. Materiały gminy należą do Gminy i Miasta
Odolanów. Nowe zdjęcia: bezpośrednio do `assets/` w trzech szerokościach (`-800`, `-1200`,
pełna) + aktualizacja `srcset` w HTML.

## Bezpieczeństwo danych

Nie commitujemy: `.env`, `*.pem`, `*.key`, `*.crt`, tokenów, baz zgłoszeń (`server/var/`)
ani plików `.eml` z realnymi danymi uczestników. Wzorce są w `.gitignore`, a `gitleaks`
pilnuje tego w CI i w pre-commit.
