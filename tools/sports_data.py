#!/usr/bin/env python3
"""Shared, privacy-safe sports activity normalisation and aggregation helpers."""

from __future__ import annotations

import hashlib
import json
import math
import re
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional


SPORT_TYPES = ("run", "cycling", "swim", "walk", "hike", "workout", "other")

TYPE_ALIASES = {
    "run": "run",
    "running": "run",
    "trailrun": "run",
    "virtualrun": "run",
    "ride": "cycling",
    "cycling": "cycling",
    "bike": "cycling",
    "bicycle": "cycling",
    "mountainbikeride": "cycling",
    "gravelride": "cycling",
    "ebikeride": "cycling",
    "swim": "swim",
    "swimming": "swim",
    "walk": "walk",
    "walking": "walk",
    "hike": "hike",
    "hiking": "hike",
    "workout": "workout",
    "weighttraining": "workout",
    "crossfit": "workout",
    "yoga": "workout",
    "跑步": "run",
    "户外跑步": "run",
    "室内跑步": "run",
    "越野跑": "run",
    "骑行": "cycling",
    "户外骑行": "cycling",
    "室内骑行": "cycling",
    "单车": "cycling",
    "游泳": "swim",
    "步行": "walk",
    "户外步行": "walk",
    "徒步": "hike",
    "登山": "hike",
    "健身": "workout",
    "力量训练": "workout",
}


def canonical_type(value: Any) -> str:
    """Map platform-specific names to the small public sports taxonomy."""
    key = "".join(ch for ch in str(value or "").lower() if ch.isalnum())
    if key in TYPE_ALIASES:
        return TYPE_ALIASES[key]
    # Huawei export labels may contain an outdoor/indoor prefix or a display title.
    for alias in sorted(TYPE_ALIASES, key=len, reverse=True):
        if alias in key:
            return TYPE_ALIASES[alias]
    return "other"


def as_float(value: Any, default: float = 0.0) -> float:
    try:
        if isinstance(value, str):
            match = re.search(r"-?[\d,]+(?:\.\d+)?", value)
            if not match:
                return default
            value = match.group(0).replace(",", "")
        number = float(value)
        return number if math.isfinite(number) else default
    except (TypeError, ValueError):
        return default


def as_seconds(value: Any) -> float:
    """Accept seconds, HH:MM:SS, and Huawei-style Chinese durations."""
    if isinstance(value, str):
        text = value.strip()
        if ":" in text:
            try:
                parts = [float(part) for part in text.split(":")]
                if len(parts) == 3:
                    return parts[0] * 3600 + parts[1] * 60 + parts[2]
                if len(parts) == 2:
                    return parts[0] * 60 + parts[1]
            except ValueError:
                pass
        if any(unit in text for unit in ("小时", "分钟", "分", "秒")):
            hours = re.search(r"([\d.]+)\s*小时", text)
            minutes = re.search(r"([\d.]+)\s*(?:分钟|分)", text)
            seconds = re.search(r"([\d.]+)\s*秒", text)
            return (
                as_float(hours.group(1)) * 3600 if hours else 0
            ) + (
                as_float(minutes.group(1)) * 60 if minutes else 0
            ) + (as_float(seconds.group(1)) if seconds else 0)
    return as_float(value)


def parse_date(value: Any) -> Optional[str]:
    """Return a calendar day (YYYY-MM-DD), deliberately discarding time of day."""
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        try:
            return datetime.fromtimestamp(value, tz=timezone.utc).date().isoformat()
        except (OverflowError, OSError, ValueError):
            return None
    text = str(value).strip()
    text = text.replace("/", "-")
    if len(text) >= 10:
        try:
            return date.fromisoformat(text[:10]).isoformat()
        except ValueError:
            pass
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).date().isoformat()
    except ValueError:
        match = re.search(r"(\d{4})\D+(\d{1,2})\D+(\d{1,2})", text)
        if match:
            try:
                return date(int(match.group(1)), int(match.group(2)), int(match.group(3))).isoformat()
            except ValueError:
                pass
        return None


def rounded(value: float, digits: int = 2) -> float:
    return round(float(value or 0), digits)


def normalise_activity(raw: Dict[str, Any], source: str = "import", fallback_id: str = "") -> Optional[Dict[str, Any]]:
    """Create a minimal internal activity record; never retain GPS or device fields."""
    activity_date = parse_date(
        raw.get("date")
        or raw.get("start_date_local")
        or raw.get("start_date")
        or raw.get("start_time")
        or raw.get("timestamp")
    )
    if not activity_date:
        return None

    activity_type = canonical_type(raw.get("type") or raw.get("sport_type") or raw.get("activity_type"))

    if raw.get("distance_km") is not None:
        distance_km = as_float(raw.get("distance_km"))
    elif raw.get("distance_m") is not None:
        distance_km = as_float(raw.get("distance_m")) / 1000
    else:
        # Strava's summary activity `distance` is metres. Generic importers pass distance_km.
        distance_km = as_float(raw.get("distance")) / 1000

    if raw.get("duration_seconds") is not None:
        duration_seconds = as_seconds(raw.get("duration_seconds"))
    elif raw.get("duration_minutes") is not None:
        duration_seconds = as_seconds(raw.get("duration_minutes")) * 60
    else:
        duration_seconds = as_seconds(raw.get("moving_time") or raw.get("elapsed_time") or raw.get("duration"))

    elevation_gain_m = as_float(raw.get("elevation_gain_m") or raw.get("total_elevation_gain"))
    calories = raw.get("calories")
    calories_value = as_float(calories) if calories is not None else None

    source_id = str(raw.get("source_id") or raw.get("activity_id") or raw.get("id") or fallback_id or "")
    if not source_id:
        fingerprint = f"{source}|{activity_date}|{activity_type}|{distance_km:.3f}|{duration_seconds:.0f}"
        source_id = hashlib.sha256(fingerprint.encode("utf-8")).hexdigest()[:16]

    return {
        "source": str(source),
        "source_id": source_id,
        "type": activity_type,
        "date": activity_date,
        "distance_km": rounded(max(0.0, distance_km), 3),
        "duration_seconds": int(max(0.0, duration_seconds)),
        "elevation_gain_m": rounded(max(0.0, elevation_gain_m), 1),
        "calories": rounded(max(0.0, calories_value), 1) if calories_value is not None else None,
    }


def activity_key(activity: Dict[str, Any]) -> str:
    return f"{activity.get('source', 'import')}:{activity.get('source_id', '')}"


def merge_activities(existing: Iterable[Dict[str, Any]], incoming: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    merged: Dict[str, Dict[str, Any]] = {}
    for activity in list(existing) + list(incoming):
        if activity and activity.get("date"):
            merged[activity_key(activity)] = activity
    return sorted(merged.values(), key=lambda item: (item["date"], item.get("source_id", "")))


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise RuntimeError(f"Could not read {path}: {error}") from error


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def load_private_cache(path: Path) -> Dict[str, Any]:
    cache = load_json(path, {"schema_version": 1, "is_demo": False, "activities": []})
    if isinstance(cache, list):
        cache = {"schema_version": 1, "is_demo": False, "activities": cache}
    if not isinstance(cache, dict) or not isinstance(cache.get("activities"), list):
        raise RuntimeError(f"Private sports cache has an invalid schema: {path}")
    cache.setdefault("schema_version", 1)
    cache.setdefault("is_demo", False)
    return cache


def sport_totals(activities: Iterable[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    totals: Dict[str, Dict[str, Any]] = {
        name: {"activities": 0, "distance_km": 0.0, "duration_seconds": 0}
        for name in SPORT_TYPES
    }
    for activity in activities:
        sport = canonical_type(activity.get("type"))
        bucket = totals[sport]
        bucket["activities"] += 1
        bucket["distance_km"] += as_float(activity.get("distance_km"))
        bucket["duration_seconds"] += int(as_float(activity.get("duration_seconds")))
    for bucket in totals.values():
        bucket["distance_km"] = rounded(bucket["distance_km"], 2)
    return totals


def summary(activities: Iterable[Dict[str, Any]]) -> Dict[str, Any]:
    values = list(activities)
    return {
        "activities": len(values),
        "active_days": len({activity["date"] for activity in values}),
        "duration_seconds": int(sum(as_float(activity.get("duration_seconds")) for activity in values)),
        "distance_km": rounded(sum(as_float(activity.get("distance_km")) for activity in values), 2),
    }


def public_activity(activity: Dict[str, Any]) -> Dict[str, Any]:
    """Explicit allow-list for fields that can reach the generated public JSON."""
    return {
        "date": activity["date"],
        "type": canonical_type(activity.get("type")),
        "distance_km": rounded(as_float(activity.get("distance_km")), 2),
        "duration_seconds": int(as_float(activity.get("duration_seconds"))),
    }


def build_public_data(activities: Iterable[Dict[str, Any]], is_demo: bool = False) -> Dict[str, Any]:
    """Aggregate activities into a browser-sized data set with no location or token data."""
    values = sorted((item for item in activities if item.get("date")), key=lambda item: item["date"])
    years = sorted({item["date"][:4] for item in values})
    current_year = str(date.today().year)
    if current_year not in years and years:
        current_year = years[-1]

    yearly: Dict[str, Dict[str, Any]] = {}
    for year in years:
        subset = [item for item in values if item["date"].startswith(year + "-")]
        yearly[year] = {"summary": summary(subset), "sports": sport_totals(subset)}

    by_day: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    by_month: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for item in values:
        by_day[item["date"]].append(item)
        by_month[item["date"][:7]].append(item)

    calendar = []
    for day, day_items in sorted(by_day.items()):
        per_type: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        for item in day_items:
            per_type[canonical_type(item.get("type"))].append(item)
        calendar.append(
            {
                "date": day,
                **summary(day_items),
                "sports": [
                    {
                        "type": sport,
                        "activities": len(items),
                        "distance_km": rounded(sum(as_float(item.get("distance_km")) for item in items), 2),
                        "duration_seconds": int(sum(as_float(item.get("duration_seconds")) for item in items)),
                    }
                    for sport, items in sorted(per_type.items())
                ],
            }
        )

    monthly = []
    for month, month_items in sorted(by_month.items()):
        month_summary = summary(month_items)
        monthly.append({"month": month, **month_summary})

    records = []
    record_labels = {"run": "Longest Run", "cycling": "Longest Ride", "swim": "Longest Swim"}
    for sport, label in record_labels.items():
        candidates = [item for item in values if canonical_type(item.get("type")) == sport and as_float(item.get("distance_km")) > 0]
        if candidates:
            winner = max(candidates, key=lambda item: as_float(item.get("distance_km")))
            records.append({"label": label, "type": sport, "date": winner["date"], "distance_km": rounded(as_float(winner.get("distance_km")), 2)})
    if monthly:
        busiest = max(monthly, key=lambda item: as_float(item.get("distance_km")))
        records.append({"label": "Highest Monthly Distance", "type": "monthly", "month": busiest["month"], "distance_km": busiest["distance_km"]})

    data = {
        "schema_version": 1,
        "is_demo": bool(is_demo),
        "updated_at": date.today().isoformat(),
        "current_year": current_year,
        "available_years": years,
        "summary": yearly.get(current_year, {"summary": summary([])})["summary"],
        "sports": yearly.get(current_year, {"sports": sport_totals([])})["sports"],
        "all_time_summary": summary(values),
        "years": yearly,
        "calendar": calendar,
        "monthly": monthly,
        "recent": [public_activity(item) for item in sorted(values, key=lambda item: item["date"], reverse=True)[:10]],
        "records": records,
    }
    return data


def demo_activities() -> List[Dict[str, Any]]:
    """Small, conspicuously synthetic data set for UI verification only."""
    today = date.today()
    examples = [
        ("run", 5.2, 1760), ("cycling", 18.4, 3220), ("swim", 1.1, 2100),
        ("walk", 3.6, 2460), ("run", 8.0, 2840), ("cycling", 31.7, 5100),
        ("workout", 0.0, 2700), ("run", 3.4, 1260), ("hike", 7.1, 7200),
    ]
    activities = []
    for index, (sport, distance_km, duration_seconds) in enumerate(examples):
        day = today - timedelta(days=(index * 11) + 2)
        activities.append(
            {
                "source": "demo",
                "source_id": f"demo-{index + 1}",
                "type": sport,
                "date": day.isoformat(),
                "distance_km": distance_km,
                "duration_seconds": duration_seconds,
                "elevation_gain_m": 0.0,
                "calories": None,
            }
        )
    return activities
