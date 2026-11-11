#!/usr/bin/env python3
"""Walidator linków w dokumentacji repozytorium.

Sprawdza, czy wszystkie względne odnośniki w plikach Markdown wskazują na istniejące
pliki w repozytorium. Linki bezwzględne (http/https/mailto/tel), kotwice i linki do
zewnętrznych zasobów są pomijane.

Użycie:
    python3 tools/check_docs_links.py [katalog ...]
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

LINK_RE = re.compile(r"\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+[\"'][^\"']*[\"'])?\s*\)")
SKIP_PREFIXES = ("http://", "https://", "mailto:", "tel:", "#", "data:", "//")
SKIP_DIRS = {
    ".git",
    "node_modules",
    "var",
    "__pycache__",
    ".pytest_cache",
    ".ruff_cache",
    ".mypy_cache",
}


def iter_markdown(root: Path) -> list[Path]:
    """Zwraca listę plików Markdown w repozytorium (bez katalogów technicznych)."""
    files: list[Path] = []
    for path in root.rglob("*.md"):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        files.append(path)
    return sorted(files)


def check_file(path: Path) -> list[str]:
    """Zwraca listę błędów (opisane brakujące linki) dla jednego pliku Markdown."""
    problems: list[str] = []
    text = path.read_text(encoding="utf-8", errors="replace")

    for raw in LINK_RE.findall(text):
        target = raw.strip()
        if not target or target.lower().startswith(SKIP_PREFIXES):
            continue

        cleaned = target.split("#", 1)[0].split("?", 1)[0]
        if not cleaned:
            continue

        resolved = (path.parent / cleaned).resolve()
        if not resolved.exists():
            problems.append(f"{path}: brak pliku dla odnośnika „{target}”")
    return problems


def check_repo(root: Path) -> list[str]:
    """Sprawdza całe repozytorium i zwraca listę problemów (pusta lista = OK)."""
    problems: list[str] = []
    for path in iter_markdown(root):
        problems.extend(check_file(path))
    return problems


def main(argv: list[str] | None = None) -> int:
    args = argv if argv is not None else sys.argv[1:]
    roots = [Path(arg).resolve() for arg in args] or [
        Path(__file__).resolve().parent.parent
    ]

    problems: list[str] = []
    for root in roots:
        if not root.exists():
            print(f"Nie znaleziono katalogu: {root}")
            return 2
        problems.extend(check_repo(root))

    if problems:
        print("Błędne linki w dokumentacji:")
        for problem in problems:
            print(f"  - {problem}")
        return 1

    print("Linki w dokumentacji: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
