"""Testy walidatora linków dokumentacyjnych."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
MODULE_PATH = REPO_ROOT / "tools" / "check_docs_links.py"

spec = importlib.util.spec_from_file_location("check_docs_links", MODULE_PATH)
assert spec and spec.loader
check_docs_links = importlib.util.module_from_spec(spec)
sys.modules["check_docs_links"] = check_docs_links
spec.loader.exec_module(check_docs_links)


def test_repo_links_resolve() -> None:
    """Każdy względny link w dokumentacji repozytorium wskazuje na istniejący plik."""
    problems = check_docs_links.check_repo(REPO_ROOT)
    assert problems == [], "\n".join(problems)


def test_detects_missing_target(tmp_path: Path) -> None:
    """Brakujący plik jest wykrywany jako błąd."""
    docs = tmp_path / "docs"
    docs.mkdir()
    (docs / "TZ.md").write_text("# TZ\n", encoding="utf-8")

    doc = tmp_path / "README.md"
    doc.write_text("[ok](docs/TZ.md)\n[bad](docs/nie-ma.md)\n", encoding="utf-8")

    problems = check_docs_links.check_file(doc)

    assert len(problems) == 1
    assert "docs/nie-ma.md" in problems[0]


def test_ignores_external_and_anchor_links(tmp_path: Path) -> None:
    """Linki zewnętrzne, kotwice i e-mail nie są sprawdzane jako pliki."""
    doc = tmp_path / "README.md"
    doc.write_text(
        "[a](https://fayna.agency)\n"
        "[b](mailto:kontakt@fayna.agency)\n"
        "[c](#sekcja)\n"
        "[d](https://odolanow.pl/h2odolanow/#start)\n",
        encoding="utf-8",
    )

    assert check_docs_links.check_file(doc) == []
