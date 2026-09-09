#!/usr/bin/env python3
"""Run the configured sports update source, falling back to rebuilding cached data."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / ".env.sports"


def has_strava_config() -> bool:
    if all(os.getenv(key) for key in ("STRAVA_CLIENT_ID", "STRAVA_CLIENT_SECRET", "STRAVA_REFRESH_TOKEN")):
        return True
    if not ENV_FILE.exists():
        return False
    contents = ENV_FILE.read_text(encoding="utf-8")
    return all(f"{key}=" in contents for key in ("STRAVA_CLIENT_ID", "STRAVA_CLIENT_SECRET", "STRAVA_REFRESH_TOKEN"))


def main() -> int:
    target = "sync_strava.py" if has_strava_config() else "import_sports.py"
    arguments = [sys.executable, str(ROOT / "tools" / target)]
    if target == "import_sports.py":
        cache = ROOT / "data" / "private" / "sports-cache.json"
        if not cache.exists():
            print("No Strava credentials or private cache found; keeping the existing public sports data unchanged.")
            print("Import an export with: python tools/import_sports.py path/to/export --replace")
            return 0
        arguments.append("--from-cache")
    return subprocess.call(arguments, cwd=ROOT)


if __name__ == "__main__":
    raise SystemExit(main())
