#!/usr/bin/env python3
"""Buduje jednoplikową wersję podstrony do podglądu w prywatnym gist.

Skleja HTML, CSS i JS w jeden plik, a ścieżki do grafik zamienia na adresy
raw w repozytorium GitHub (żeby podgląd działał bez lokalnego systemu plików).

Użycie:
    python3 tools/build_gist_preview.py [katalog_repo] [plik_wyjściowy]
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

RAW_BASE = "https://raw.githubusercontent.com/fayna-digital/h2odolanow-landing/main"


def inline_assets(html: str, css: str, js: str) -> str:
    """Podstawia CSS i JS bezpośrednio w HTML i przepisuje ścieżki do grafik."""
    html = re.sub(
        r'<link rel="stylesheet" href="h2odolanow_style\.css">',
        lambda _match: f"<style>\n{css}\n</style>",
        html,
    )
    html = re.sub(
        r'<script src="h2odolanow_script\.js"></script>',
        lambda _match: f"<script>\n{js}\n</script>",
        html,
    )
    # Wszystkie odwołania do grafik wskazują na surowe pliki w repozytorium GitHub,
    # żeby podgląd działał bez lokalnego systemu plików.
    html = html.replace("assets/", f"{RAW_BASE}/assets/")
    return html


def build(repo: Path) -> str:
    html = (repo / "h2odolanow_landing.html").read_text(encoding="utf-8")
    css = (repo / "h2odolanow_style.css").read_text(encoding="utf-8")
    js = (repo / "h2odolanow_script.js").read_text(encoding="utf-8")
    return inline_assets(html, css, js)


def main(argv: list[str] | None = None) -> int:
    args = argv if argv is not None else sys.argv[1:]
    repo = Path(args[0]).resolve() if args else Path(__file__).resolve().parent.parent
    out = Path(args[1]).resolve() if len(args) > 1 else Path("/tmp/h2odolanow-preview.html")

    html = build(repo)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")

    size_kb = out.stat().st_size / 1024
    print(f"OK: {out} ({size_kb:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
