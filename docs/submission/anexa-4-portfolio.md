# Załącznik nr 4 — Portfolio Wykonawcy

> SZKIC. Wszystkie pozycje poniżej to **publiczne repozytoria organizacji `fayna-digital`** —
> kod, który można otworzyć i sprawdzić. Żadnych nazw klientów prywatnych ani referencji,
> których nie da się zweryfikować publicznie.

---

## 1. Organizacja

**Fayna Digital** — realizacja podstron, modułów i integracji: Odoo 17 (Python), integracje
systemowe, moduły e-fakturowania i telekomunikacji, oraz warstwy frontendowe.
Kontakt: kontakt@fayna.agency.

Repozytoria są publiczne i otwarte do wglądu — kod, testy, dokumentacja i historia zmian:

| Repozytorium | Co to jest |
| --- | --- |
| <https://github.com/fayna-digital/fayna-ksef-margin> | integracja e-fakturowania z KSeF 2.0 w Odoo 17 (XML FA(3), UPO, korekty) |
| <https://github.com/fayna-digital/fayna-rodo-compliance> | moduł RODO/GDPR w Odoo 17 — zarządzanie ochroną danych osobowych |
| <https://github.com/fayna-digital/fayna-legal-versioning> | wersjonowanie dokumentów prawnych i zgodność w Odoo 17 |
| <https://github.com/fayna-digital/fayna-zadarma-odoo> | integracja Zadarma z Odoo 17 — autologowanie, nagrania, click-to-call, SMS |
| <https://github.com/fayna-digital/fayna-sms-base> | baza modułu SMS w Odoo 17 |
| <https://github.com/fayna-digital/fayna-sms-turbosms> | dostawca SMS TurboSMS dla Odoo 17 |
| <https://github.com/fayna-digital/fayna-sendpulse-odoo> | integracja SendPulse z Odoo 17 (AI, lead magnet, multi-page FB/IG) |
| <https://github.com/fayna-digital/fayna-meta-capi> | Meta Conversions API dla Odoo 17 — tracking po stronie serwera |
| <https://github.com/fayna-digital/fayna-omnichannel-bridge> | agregator wiadomości w Odoo 17 + hooki autoreply AI |
| <https://github.com/fayna-digital/fayna-campscout> | portal obozowy w Odoo 17 — programy, kadra, zgodność z prawem PL |
| <https://github.com/fayna-digital/fayna-instructor-school> | szkolenia instruktorów w Odoo 17 |
| <https://github.com/fayna-digital/fayna-shopfloor-kiosk> | kiosk stanowiskowy (Modbus TCP) dla terminali produkcyjnych w Odoo 17 |
| <https://github.com/fayna-digital/fayna-industrial-iot> | most Modbus TCP → MRP w Odoo 17 (z buforem SQLite) |
| <https://github.com/fayna-digital/fayna-ai-kiosk> | kiosk głosowy offline (Vosk STT + Piper TTS) dla punktu obsługi |
| <https://github.com/fayna-digital/fayna-voice-kiosk> | kiosk głosowy dla punktu usługowego |
| <https://github.com/fayna-digital/fayna-rag-mcp> | lokalna baza wiedzy z RAG i serwerem MCP |
| <https://github.com/fayna-digital/h2odolanow-landing> | **niniejsza realizacja** — podstrona H2O!dolanów + prototyp modułu rejestracji |

## 2. Jak realizujemy podstrony i warstwy webowe

Doświadczenie z projektów publicznych w organizacji (fayna-ai-kiosk, fayna-voice-kiosk,
fayna-industrial-iot) przenosi się bezpośrednio na niniejsze zlecenie:

- **interfejs bez procesu budowania** — statyczny HTML/CSS/JS, wdrażany przez CMS Urzędu
  bez npm, bez kompilacji, bez ryzyka rozjazdu wersji;
- **dostępność jako kryterium, nie dodatek** — WCAG 2.1 AA z testami na trzech szerokościach
  ekranu i obsługą klawiatury;
- **dane osobowe pod kontrolą** — moduły RODO w Odoo, dziennik audytu, brak zapisu adresów IP
  wprost, retencja zgodna z polityką administratora;
- **testy zamiast obietnic** — każdy publiczny moduł ma testy i CI, które nie przepuszczają
  commita z błędem.

## 3. Realizacja niniejszego zlecenia jest dostępna do wglądu

Kod podstrony, prototyp modułu rejestracji, testy, dokumentacja zadania
(`docs/TZ.md`), plan (`docs/PLAN.md`), opis architektury i wycena są opublikowane w repozytorium
<https://github.com/fayna-digital/h2odolanow-landing> — razem z historią zmian
i uruchomialnym prototypem panelu zgłoszeń. To najkrótsza droga do oceny jakości wykonania:
można uruchomić i przetestować przed podpisaniem umowy.

```bash
git clone https://github.com/fayna-digital/h2odolanow-landing.git
cd h2odolanow-landing && npm start     # http://127.0.0.1:8787/  i  /admin
npm test                              # testy API, panelu, statyki i bezpieczeństwa
```

## 4. Zasady współpracy

- Git jako jedyne źródło prawdy: lokalnie → GitHub → staging → produkcja.
- Jeden zbiorczy zestaw uwag na etapie akceptacji, decyzje w 3 dni robocze.
- Dokumentacja w repozytorium (TЗ, plan, architektura, instrukcja) — nie tylko w korespondencji.
- Brak podpisów asystenta w kodzie i w historii zmian — repozytorium ma być uczciwym wizerunkiem firmy.
