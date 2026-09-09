#!/usr/bin/env python3
"""Import GPX, TCX, FIT, CSV or JSON activity exports into the Sports widget."""

from __future__ import annotations

import argparse
import csv
import json
import math
import sys
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List

from sports_data import (
    build_public_data,
    demo_activities,
    load_private_cache,
    merge_activities,
    normalise_activity,
    write_json,
)


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CACHE = ROOT / "data" / "private" / "sports-cache.json"
DEFAULT_PUBLIC = ROOT / "source" / "_data" / "sports.json"


def local_name(element: ET.Element) -> str:
    return element.tag.rsplit("}", 1)[-1]


def child_text(element: ET.Element, name: str) -> str | None:
    for child in element.iter():
        if local_name(child) == name and child.text:
            return child.text.strip()
    return None


def haversine_meters(a: tuple[float, float], b: tuple[float, float]) -> float:
    radius = 6_371_000
    lat1, lon1, lat2, lon2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    sin_lat = math.sin((lat2 - lat1) / 2)
    sin_lon = math.sin((lon2 - lon1) / 2)
    return 2 * radius * math.asin(math.sqrt(sin_lat * sin_lat + math.cos(lat1) * math.cos(lat2) * sin_lon * sin_lon))


def import_gpx(path: Path) -> List[Dict[str, Any]]:
    root = ET.parse(path).getroot()
    points: List[tuple[float, float]] = []
    times: List[str] = []
    for point in root.iter():
        if local_name(point) != "trkpt":
            continue
        try:
            points.append((float(point.attrib["lat"]), float(point.attrib["lon"])))
        except (KeyError, ValueError):
            continue
        point_time = child_text(point, "time")
        if point_time:
            times.append(point_time)
    distance_m = sum(haversine_meters(points[index - 1], points[index]) for index in range(1, len(points)))
    duration_seconds = 0
    if len(times) >= 2:
        try:
            duration_seconds = (datetime.fromisoformat(times[-1].replace("Z", "+00:00")) - datetime.fromisoformat(times[0].replace("Z", "+00:00"))).total_seconds()
        except ValueError:
            pass
    track_type = next((element.text for element in root.iter() if local_name(element) == "type" and element.text), "run")
    activity = normalise_activity(
        {"type": track_type, "date": times[0] if times else None, "distance_m": distance_m, "duration_seconds": duration_seconds},
        source="gpx",
        fallback_id=path.stem,
    )
    return [activity] if activity else []


def import_tcx(path: Path) -> List[Dict[str, Any]]:
    root = ET.parse(path).getroot()
    activities: List[Dict[str, Any]] = []
    for index, activity_node in enumerate(element for element in root.iter() if local_name(element) == "Activity"):
        distance_m = 0.0
        duration_seconds = 0.0
        for lap in (element for element in activity_node.iter() if local_name(element) == "Lap"):
            distance_m += float(child_text(lap, "DistanceMeters") or 0)
            duration_seconds += float(child_text(lap, "TotalTimeSeconds") or 0)
        activity = normalise_activity(
            {
                "type": activity_node.attrib.get("Sport", "run"),
                "date": activity_node.attrib.get("StartTime"),
                "distance_m": distance_m,
                "duration_seconds": duration_seconds,
            },
            source="tcx",
            fallback_id=f"{path.stem}-{index}",
        )
        if activity:
            activities.append(activity)
    return activities


def import_kml(path: Path) -> List[Dict[str, Any]]:
    """Import Huawei-exported KML routes without retaining their coordinates."""
    root = ET.parse(path).getroot()
    coordinates: List[tuple[float, float]] = []
    for element in root.iter():
        if local_name(element) != "coordinates" or not element.text:
            continue
        for point in element.text.replace("\n", " ").split():
            values = point.split(",")
            if len(values) < 2:
                continue
            try:
                coordinates.append((float(values[1]), float(values[0])))
            except ValueError:
                continue
    distance_m = sum(haversine_meters(coordinates[index - 1], coordinates[index]) for index in range(1, len(coordinates)))
    times = [element.text.strip() for element in root.iter() if local_name(element) in ("when", "begin") and element.text]
    names = [element.text.strip() for element in root.iter() if local_name(element) == "name" and element.text]
    activity = normalise_activity(
        {
            "type": " ".join(names) or path.stem,
            "date": times[0] if times else None,
            "distance_m": distance_m,
            "duration_seconds": 0,
        },
        source="kml",
        fallback_id=path.stem,
    )
    return [activity] if activity else []


def import_csv(path: Path) -> List[Dict[str, Any]]:
    activities = []
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        for index, row in enumerate(csv.DictReader(handle)):
            lower = {str(key).strip().lower(): value for key, value in row.items() if key}
            raw = {
                "type": lower.get("type") or lower.get("sport") or lower.get("activity_type") or lower.get("运动类型") or lower.get("运动项目"),
                "date": lower.get("date") or lower.get("start_date") or lower.get("start_time") or lower.get("开始时间") or lower.get("起始时间") or lower.get("日期"),
                "distance_km": lower.get("distance_km") or lower.get("distance (km)") or lower.get("distance（km）") or lower.get("距离（公里）") or lower.get("距离(km)") or lower.get("距离（km）") or lower.get("距离"),
                "distance_m": lower.get("distance_m") or lower.get("distance (m)") or lower.get("distance（m）") or lower.get("距离（米）"),
                "duration_seconds": lower.get("duration_seconds") or lower.get("moving_time") or lower.get("运动时长（秒）") or lower.get("运动时长") or lower.get("时长"),
                "duration_minutes": lower.get("duration_minutes") or lower.get("duration (min)") or lower.get("运动时长（分钟）") or lower.get("时长（分钟）"),
                "elevation_gain_m": lower.get("elevation_gain_m") or lower.get("爬升") or lower.get("累计爬升"),
                "calories": lower.get("calories") or lower.get("消耗卡路里") or lower.get("卡路里"),
                "source_id": lower.get("id") or lower.get("activity_id"),
            }
            activity = normalise_activity(raw, source="huawei_csv" if any("运动" in key or "距离" in key for key in lower) else "csv", fallback_id=f"{path.stem}-{index}")
            if activity:
                activities.append(activity)
    return activities


def import_json(path: Path) -> List[Dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, dict):
        payload = payload.get("activities") or payload.get("data") or [payload]
    if not isinstance(payload, list):
        raise RuntimeError(f"JSON input must be an activity object or array: {path}")
    activities = []
    for index, raw in enumerate(payload):
        if isinstance(raw, dict):
            activity = normalise_activity(raw, source="json", fallback_id=f"{path.stem}-{index}")
            if activity:
                activities.append(activity)
    return activities


def import_fit(path: Path) -> List[Dict[str, Any]]:
    try:
        from fitdecode import FitReader  # type: ignore
    except ImportError as error:
        raise RuntimeError("FIT import needs the optional dependency: python -m pip install fitdecode") from error
    activities = []
    with FitReader(str(path)) as fit:
        for index, frame in enumerate(fit):
            if frame.frame_type != "data" or frame.name != "session":
                continue
            values = {field.name: field.value for field in frame.fields}
            activity = normalise_activity(
                {
                    "type": values.get("sport"),
                    "date": values.get("start_time") or values.get("timestamp"),
                    "distance_m": values.get("total_distance"),
                    "duration_seconds": values.get("total_timer_time") or values.get("total_elapsed_time"),
                    "elevation_gain_m": values.get("total_ascent"),
                    "calories": values.get("total_calories"),
                },
                source="fit",
                fallback_id=f"{path.stem}-{index}",
            )
            if activity:
                activities.append(activity)
    return activities


IMPORTERS = {".gpx": import_gpx, ".kml": import_kml, ".tcx": import_tcx, ".fit": import_fit, ".csv": import_csv, ".json": import_json}


def find_input_files(paths: Iterable[Path]) -> Iterable[Path]:
    for path in paths:
        if path.is_file():
            yield path
        elif path.is_dir():
            yield from (candidate for candidate in path.rglob("*") if candidate.is_file() and candidate.suffix.lower() in IMPORTERS)
        else:
            raise RuntimeError(f"Input path does not exist: {path}")


def print_summary(data: Dict[str, Any]) -> None:
    year = data["current_year"]
    summary = data["summary"]
    print(f"Sports data updated ({'DEMO' if data['is_demo'] else 'private source'})")
    print(year)
    print(f"Activities: {summary['activities']}")
    print(f"Distance: {summary['distance_km']} km")
    print(f"Active days: {summary['active_days']}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("inputs", nargs="*", type=Path, help="Files or directories containing activity exports")
    parser.add_argument("--cache", type=Path, default=DEFAULT_CACHE, help="Private normalized cache path")
    parser.add_argument("--output", type=Path, default=DEFAULT_PUBLIC, help="Public aggregate JSON path")
    parser.add_argument("--replace", action="store_true", help="Replace rather than merge the private cache")
    parser.add_argument("--demo", action="store_true", help="Generate a clearly marked small demo data set")
    parser.add_argument("--from-cache", action="store_true", help="Regenerate only the public JSON from the private cache")
    args = parser.parse_args()

    cache = load_private_cache(args.cache)
    if args.from_cache:
        public = build_public_data(cache["activities"], bool(cache.get("is_demo")))
        write_json(args.output, public)
        print_summary(public)
        return 0

    if args.demo:
        incoming = demo_activities()
        is_demo = True
    else:
        if not args.inputs:
            parser.error("provide export file(s), --demo, or --from-cache")
        incoming = []
        for path in find_input_files(args.inputs):
            importer = IMPORTERS.get(path.suffix.lower())
            if not importer:
                continue
            parsed = importer(path)
            incoming.extend(parsed)
            print(f"Imported {len(parsed)} activity record(s) from {path}")
        if not incoming:
            raise RuntimeError("No valid activity records were found")
        is_demo = False

    activities = incoming if args.replace or args.demo else merge_activities(cache["activities"], incoming)
    write_json(args.cache, {"schema_version": 1, "is_demo": is_demo, "activities": activities})
    public = build_public_data(activities, is_demo)
    write_json(args.output, public)
    print_summary(public)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, OSError, ET.ParseError, json.JSONDecodeError) as error:
        print(f"sports import failed: {error}", file=sys.stderr)
        raise SystemExit(1)
