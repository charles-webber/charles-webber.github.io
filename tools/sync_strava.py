#!/usr/bin/env python3
"""Synchronise Strava summary activities into the private sports cache."""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Iterable

from sports_data import build_public_data, load_private_cache, merge_activities, normalise_activity, write_json


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CACHE = PROJECT_ROOT / "data" / "private" / "sports-cache.json"
DEFAULT_PUBLIC = PROJECT_ROOT / "source" / "_data" / "sports.json"
DEFAULT_ENV = PROJECT_ROOT / ".env.sports"
TOKEN_URL = "https://www.strava.com/api/v3/oauth/token"
ACTIVITIES_URL = "https://www.strava.com/api/v3/athlete/activities"


def load_env_file(path: Path) -> Dict[str, str]:
    values: Dict[str, str] = {}
    if not path.exists():
        return values
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def persist_env_value(path: Path, key: str, value: str) -> None:
    """Persist the rotated refresh token outside the repository, atomically."""
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = path.read_text(encoding="utf-8").splitlines() if path.exists() else []
    replacement = f"{key}={value}"
    found = False
    output = []
    for line in lines:
        if line.strip().startswith(f"{key}="):
            output.append(replacement)
            found = True
        else:
            output.append(line)
    if not found:
        output.append(replacement)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text("\n".join(output) + "\n", encoding="utf-8")
    temporary.replace(path)
    try:
        path.chmod(0o600)
    except OSError:
        pass


def post_form(url: str, data: Dict[str, str]) -> Dict[str, Any]:
    request = urllib.request.Request(
        url,
        data=urllib.parse.urlencode(data).encode("utf-8"),
        headers={"Content-Type": "application/x-www-form-urlencoded", "User-Agent": "mozhu-sports-sync/1.0"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Strava token request failed ({error.code}): {detail}") from error


def refresh_access_token(config: Dict[str, str], authorization_code: str | None) -> Dict[str, Any]:
    required = ("STRAVA_CLIENT_ID", "STRAVA_CLIENT_SECRET")
    missing = [key for key in required if not config.get(key)]
    if missing:
        raise RuntimeError(f"Missing required Strava setting(s): {', '.join(missing)}")
    payload = {"client_id": config["STRAVA_CLIENT_ID"], "client_secret": config["STRAVA_CLIENT_SECRET"]}
    if authorization_code:
        payload.update({"grant_type": "authorization_code", "code": authorization_code})
    else:
        refresh_token = config.get("STRAVA_REFRESH_TOKEN")
        if not refresh_token:
            raise RuntimeError("Missing STRAVA_REFRESH_TOKEN. Run once with --authorization-code after granting activity:read access.")
        payload.update({"grant_type": "refresh_token", "refresh_token": refresh_token})
    response = post_form(TOKEN_URL, payload)
    if not response.get("access_token") or not response.get("refresh_token"):
        raise RuntimeError("Strava did not return both an access token and a refresh token")
    return response


def fetch_activities(access_token: str, after_epoch: int | None) -> Iterable[Dict[str, Any]]:
    page = 1
    while True:
        params: Dict[str, Any] = {"page": page, "per_page": 200}
        if after_epoch:
            params["after"] = after_epoch
        request = urllib.request.Request(
            ACTIVITIES_URL + "?" + urllib.parse.urlencode(params),
            headers={"Authorization": f"Bearer {access_token}", "User-Agent": "mozhu-sports-sync/1.0"},
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Strava activity request failed ({error.code}): {detail}") from error
        if not isinstance(payload, list):
            raise RuntimeError("Strava activity response was not a list")
        if not payload:
            return
        for activity in payload:
            if isinstance(activity, dict):
                yield activity
        if len(payload) < 200:
            return
        page += 1


def cache_after_epoch(activities: Iterable[Dict[str, Any]], full: bool) -> int | None:
    if full:
        return None
    dates = [item.get("date") for item in activities if item.get("date")]
    if not dates:
        return None
    newest = max(dates)
    try:
        # Re-fetch two weeks to pick up small edits without repeatedly fetching all history.
        return int((datetime.fromisoformat(newest).replace(tzinfo=timezone.utc) - timedelta(days=14)).timestamp())
    except ValueError:
        return None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--env-file", type=Path, default=DEFAULT_ENV, help="Private env file containing Strava credentials")
    parser.add_argument("--cache", type=Path, default=DEFAULT_CACHE)
    parser.add_argument("--output", type=Path, default=DEFAULT_PUBLIC)
    parser.add_argument("--authorization-code", help="One-time OAuth authorization code; exchanges it for a refresh token")
    parser.add_argument("--full", action="store_true", help="Fetch full Strava history rather than the recent overlap")
    args = parser.parse_args()

    config = load_env_file(args.env_file)
    config.update({key: value for key, value in os.environ.items() if key.startswith("STRAVA_") and value})
    token = refresh_access_token(config, args.authorization_code)
    persist_env_value(args.env_file, "STRAVA_REFRESH_TOKEN", token["refresh_token"])

    cache = load_private_cache(args.cache)
    after_epoch = cache_after_epoch(cache["activities"], args.full)
    raw_activities = list(fetch_activities(token["access_token"], after_epoch))
    normalized = [
        activity
        for activity in (normalise_activity(raw, source="strava", fallback_id=f"strava-{index}") for index, raw in enumerate(raw_activities))
        if activity
    ]
    merged = merge_activities(cache["activities"], normalized)
    write_json(args.cache, {"schema_version": 1, "is_demo": False, "activities": merged})
    public = build_public_data(merged, False)
    write_json(args.output, public)

    print(f"Strava sync complete: {len(normalized)} fetched, {len(merged)} cached")
    print(f"{public['current_year']}: {public['summary']['activities']} activities, {public['summary']['distance_km']} km")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, OSError, ValueError, urllib.error.URLError) as error:
        print(f"Strava sync failed: {error}", file=sys.stderr)
        raise SystemExit(1)
