"""Checks per-tour translation files against their English source and merges them into one file per locale.

Input:  <src dir>/<wp id>.json   English source extracted from tours_structured.json
        <out dir>/<wp id>.json   {"fr": {...}, "es": {...}, "de": {...}} same shape as the source
Output: backend/database/data/translations/<locale>.json  {"locale": ..., "tours": [...]}, read by
        `php artisan toubkal:import-translations`.

Checks: same itinerary length and day numbers, same fact keys and day-stat keys (keys stay English,
only values are translated), same list lengths, a slug made of [a-z0-9-].
Usage: python tools/merge_translations.py <src dir> <out dir> backend/database/data/translations
"""

import json
import re
import sys
from pathlib import Path

LOCALES = ["fr", "es", "de"]
LISTS = ["highlights", "included", "excluded", "upgrades"]


def check(src: dict, tr: dict, where: str) -> list[str]:
    problems = []
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", tr.get("slug") or ""):
        problems.append(f"{where}: bad slug {tr.get('slug')!r}")
    if not tr.get("title"):
        problems.append(f"{where}: missing title")
    if bool(src.get("summary")) != bool(tr.get("summary")):
        problems.append(f"{where}: summary present in one side only")
    if sorted(src.get("facts") or {}) != sorted(tr.get("facts") or {}):
        problems.append(f"{where}: fact keys differ")
    for key in LISTS:
        if len(src.get(key) or []) != len(tr.get(key) or []):
            problems.append(f"{where}: {key} length {len(src.get(key) or [])} != {len(tr.get(key) or [])}")
    s_days, t_days = src.get("itinerary") or [], tr.get("itinerary") or []
    if [d.get("day") for d in s_days] != [d.get("day") for d in t_days]:
        problems.append(f"{where}: itinerary days differ")
    else:
        for sd, td in zip(s_days, t_days):
            if sorted(sd.get("stats") or {}) != sorted(td.get("stats") or {}):
                problems.append(f"{where}: day {sd.get('day')} stat keys differ")
            if len(sd.get("body") or []) != len(td.get("body") or []):
                problems.append(f"{where}: day {sd.get('day')} paragraph count differs")
    s_pack, t_pack = src.get("packing") or [], tr.get("packing") or []
    if [len(g["items"]) for g in s_pack] != [len(g["items"]) for g in t_pack]:
        problems.append(f"{where}: packing groups differ")
    return problems


def main(src_dir: str, out_dir: str, target: str) -> int:
    src_dir, out_dir, target = Path(src_dir), Path(out_dir), Path(target)
    merged = {loc: [] for loc in LOCALES}
    problems, missing = [], []
    for src_file in sorted(src_dir.glob("*.json")):
        src = json.loads(src_file.read_text(encoding="utf-8"))
        out_file = out_dir / src_file.name
        if not out_file.exists():
            missing.append(src["id"])
            continue
        tr_all = json.loads(out_file.read_text(encoding="utf-8"))
        for loc in LOCALES:
            tr = tr_all.get(loc)
            if not tr:
                problems.append(f"{src['id']}/{loc}: missing")
                continue
            problems += check(src, tr, f"{src['id']}/{loc}")
            merged[loc].append({"id": src["id"], **tr})

    for loc in LOCALES:
        slugs = [t["slug"] for t in merged[loc]]
        dupes = {s for s in slugs if slugs.count(s) > 1}
        if dupes:
            problems.append(f"{loc}: duplicate slugs {sorted(dupes)}")

    for p in problems:
        print("PROBLEM", p)
    if problems:
        return 1
    target.mkdir(parents=True, exist_ok=True)
    for loc in LOCALES:
        (target / f"{loc}.json").write_text(json.dumps({"locale": loc, "tours": merged[loc]}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"merged {len(merged['fr'])} tours per locale; still to translate: {len(missing)}")
    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:4]))
