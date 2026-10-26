"""Parse scraped WPBakery tour content into structured JSON + a price review sheet."""
import csv, html, json, os, re, sys

ROOT = r"C:\Users\pc\Documents\JalimX\clients\toubkal peaks\scrape"
DATA = os.path.join(ROOT, "data")

EMO = re.compile("[\U0001F000-\U0001FAFF\u2300-\u23FF\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u200D\u25A0-\u25FF]")


def noemo(s):
    s = EMO.sub("", s)
    s = s.replace("\u2003", " ").replace("\u2002", " ").replace("\xa0", " ").replace("\u202f", " ")
    return re.sub(r"[ \t]+", " ", s).strip()


def to_lines(s):
    """HTML/shortcode fragment -> list of clean text lines (bullets as '- ...')."""
    s = re.sub(r"<(style|script)[\s\S]*?</\1>", "", s, flags=re.I)
    s = re.sub(r"\[/?[a-z_0-9]+[^\]]*\]", "\n", s)
    s = re.sub(r"<li[^>]*>", "\n- ", s, flags=re.I)
    s = re.sub(r"<br[^>]*>|</p>|</div>|</li>|</h[1-6]>|</tr>|</ul>|</ol>|</table>|</td>", "\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s)
    lines = []
    for ln in s.split("\n"):
        ln = noemo(ln)
        if ln:
            lines.append(ln)
    # join lone "-" with next line
    out, i = [], 0
    while i < len(lines):
        if lines[i] == "-" and i + 1 < len(lines):
            out.append("- " + lines[i + 1]); i += 2
        else:
            out.append(lines[i]); i += 1
    return out


def clean_title(t):
    t = html.unescape(re.sub(r"<[^>]+>", "", t))
    return re.sub(r"\s+", " ", noemo(t)).strip(" -–—:")


def snake(k):
    k = noemo(k).lower()
    k = re.sub(r"[^a-z0-9]+", "_", k).strip("_")
    return k


def parse_stats(line):
    """'Transport: 1.5 hours | Guide: Included | ...' -> dict or None"""
    if "|" not in line and not re.match(r"^(transport|meals|driving distance|drive time|walking distance)\b", line, re.I):
        return None
    out = {}
    for part in re.split(r"\s*\|\s*", line):
        m = re.match(r"^([A-Za-z][A-Za-z /&'\-]{1,28}?)\s*:\s*(.+)$", part.strip())
        if m:
            out[snake(m.group(1))] = m.group(2).strip()
    return out if len(out) >= 1 and ("|" in line or len(out) == 1) else None


def list_items(lines):
    items = []
    for ln in lines:
        ln = re.sub(r"^[-•–—*]+\s*", "", ln).strip()
        # split dash-joined runs: "A – B – C" only when started by dash lines
        if ln:
            items.append(ln)
    return items


FACT_KEYS = {
    "duration", "type", "best time", "best time to travel", "departs from", "ends in", "departure times", "departure time",
    "guides speaking", "languages available", "grade", "trip level", "maximum altitude", "highlights", "hike", "hiking distance",
    "hiking time", "solo travelers", "difficulty", "group size", "season", "start", "finish", "overnight", "accommodation",
    "arrive time", "walking distance", "walking time", "transport", "meeting point", "pick up", "drop off", "starts in",
}


def parse_facts(lines):
    facts = {}
    for ln in lines:
        m = re.match(r"^(?:[-•*]\s*)?([A-Za-z][A-Za-z /&']{2,30}?)\s*:\s*(.+)$", ln)
        if m and m.group(1).strip().lower() in FACT_KEYS:
            facts.setdefault(snake(m.group(1)), m.group(2).strip())
    return facts


def prep(content):
    c = html.unescape(content)
    c = re.sub(r"css=[”\"“][^”\"“]*[”\"“]", "", c)
    return c


TAB_RE = re.compile(r"\[vc_accordion_tab\s+title=[”\"“]([^”\"“\]]*)[”\"“][^\]]*\](.*?)\[/vc_accordion_tab\]", re.S)
DAY_RE = re.compile(r"^\W*(?:day|jour|d[ií]a)\s*:?\s*0*(\d+)\s*[:\-–—.]*\s*(.*)$", re.I)


def upload_key(u):
    u = u.split("?")[0]
    return re.sub(r"-\d+x\d+(?=\.\w+$)", "", u)


def parse_pricing(c, tabs):
    """Return pricing dict from vc_cta / pricing_table / pricing tab."""
    blocks = []
    for attrs, body in re.findall(r"\[vc_cta([^\]]*)\](.*?)\[/vc_cta\]", c, re.S):
        h4 = re.search(r"h4=[”\"“]([^”\"“]*)", attrs)
        blocks.append(((h4.group(1) if h4 else ""), " ".join(to_lines(body))))
    for body in re.findall(r"\[vc_pricing_table[^\]]*\](.*?)\[/vc_pricing_table\]", c, re.S):
        blocks.append(("", " ".join(to_lines(body))))
    for title, body in tabs:
        if re.search(r"pricing", title, re.I):
            blocks.append((title, " ".join(to_lines(body))))
    res = {"status": "none", "basis": None, "heading": "", "tiers": [], "from_price": None, "raw": []}
    if not blocks:
        return res
    res["raw"] = [(h + " :: " + t).strip(" :") for h, t in blocks]
    res["heading"] = blocks[0][0]
    text = " ".join(t for _, t in blocks)
    allh = " ".join(h for h, _ in blocks) + " " + text
    if re.search(r"per\s*/?\s*person|p/person|/\s*person|per person", allh, re.I):
        res["basis"] = "per_person"
    tiers = []
    # pattern A: Group size ... Price in € €a €b €c €d
    mA = re.search(r"Price in\b", text, re.I)
    if mA:
        prices = [float(x.replace(",", "")) for x in re.findall(r"€\s?(\d[\d,]*(?:\.\d+)?)", text[mA.end():])]
        labels = [("1", 1, 1), ("2-3", 2, 3), ("4-7", 4, 7), ("8-12", 8, 12)]
        for (lab, lo, hi), p in zip(labels, prices):
            tiers.append({"label": lab, "min": lo, "max": hi, "price": p})
    else:
        for m in re.finditer(r"(\d+)\s*(?:[–\-]\s*(\d+))?\s*(?:Person|Persons|People|Personns|Personn|Pax)\S*\s*[:’']*\s*(Not Accepted|(?:€\s*)?[\d,\.]+\s*€?)", text, re.I):
            lo = int(m.group(1)); hi = int(m.group(2)) if m.group(2) else lo
            raw = m.group(3)
            price = None if re.search(r"not accepted", raw, re.I) else float(re.sub(r"[^\d.]", "", raw.replace(",", "")) or 0) or None
            tiers.append({"label": f"{lo}" if lo == hi else f"{lo}-{hi}", "min": lo, "max": hi, "price": price})
    if tiers:
        res["tiers"] = tiers
        got = [t["price"] for t in tiers if t["price"]]
        res["from_price"] = min(got) if got else None
        res["status"] = "tiered" if len(got) >= 4 else "tiered_partial"
    elif re.search(r"contact (us )?for pricing|get in touch|on request", text, re.I):
        res["status"] = "on_request"
    return res


SUPP = re.compile(r"hotel|riad|night|single|twin|upgrade|supplement|extra|additional|room|camp", re.I)


def price_mentions(text):
    out = []
    for m in re.finditer(r"(?:from\s+)?(?:€\s?\d[\d,\.]*|\d[\d,\.]*\s?(?:€|EUR(?!\w)|euros?(?!\w)))(?:\s*(?:p/p|per person|pp|/ ?person))?", text, re.I):
        s = max(0, m.start() - 70); e = min(len(text), m.end() + 50)
        ctx = re.sub(r"\s+", " ", text[s:e]).strip()
        out.append({"value": m.group(0).strip(), "kind": "supplement" if SUPP.search(ctx) else "price", "context": ctx})
    # dedupe by context
    seen, res = set(), []
    for o in out:
        if o["context"] not in seen:
            seen.add(o["context"]); res.append(o)
    return res[:8]


def parse_post(p, media_by_id, cat, new_url, merged_posts):
    c = prep(p["content"]["rendered"])
    title = clean_title(p["title"]["rendered"])
    tabs_raw = [(clean_title(t), b) for t, b in TAB_RE.findall(c)]
    no_tabs = TAB_RE.sub("\n", c)

    itinerary, included, excluded, packing, upgrades, others = [], [], [], [], [], []
    for t, b in tabs_raw:
        lines = to_lines(b)
        tl = t.lower()
        m = DAY_RE.match(t)
        if m:
            stats, acc, body = {}, "", []
            for ln in lines:
                st = parse_stats(ln) if not stats else None
                am = re.match(r"^(?:accommodation|overnight|overnight stay|stay)\s*:\s*(.+)$", ln, re.I)
                if st and not body:
                    stats.update(st)
                elif am:
                    acc = am.group(1).strip()
                else:
                    body.append(ln)
            itinerary.append({"day": int(m.group(1)), "title": m.group(2).strip() or t, "stats": stats, "accommodation": acc, "body": body})
        elif re.search(r"not included|exclu", tl):
            excluded += list_items(lines)
        elif re.search(r"inclu", tl) and not re.search(r"price in", tl):
            included += list_items(lines)
        elif re.search(r"bring|pack", tl):
            group, groups = "General", {}
            for ln in lines:
                if not ln.startswith("- ") and ln.endswith(":") and len(ln) < 60:
                    group = ln.rstrip(":"); groups.setdefault(group, []); continue
                groups.setdefault(group, []).append(re.sub(r"^[-•]\s*", "", ln))
            packing = [{"group": g, "items": v} for g, v in groups.items() if v]
        elif re.search(r"upgrade", tl):
            upgrades += list_items(lines)
        elif re.search(r"pricing", tl):
            pass
        else:
            # single-itinerary tabs (day trips) and other info tabs
            others.append({"title": t, "lines": lines})
    fmt = "days"
    if not itinerary and others:
        # day trip style: first "other" tab = the itinerary
        o = others.pop(0)
        stats = {}
        body = []
        for ln in o["lines"]:
            st = parse_stats(ln) if not stats else None
            if st and not body:
                stats.update(st)
            else:
                body.append(ln)
        itinerary.append({"day": 1, "title": o["title"], "stats": stats, "accommodation": "", "body": body})
        fmt = "single"

    # text outside tabs: intro, highlights, facts
    outside = to_lines(re.sub(r"\[vc_(?:cta|pricing_table)[^\]]*\].*?\[/vc_(?:cta|pricing_table)\]", "", no_tabs, flags=re.S))
    facts = parse_facts(outside)
    for ln in to_lines(c)[:0]:
        pass
    h1 = title.lower()
    intro = [ln for ln in outside if len(ln) > 90 and not ln.startswith("- ") and ln.lower() != h1
             and not re.match(r"^(?:[-•*]\s*)?[A-Za-z /&']{3,30}:\s", ln)][:2]
    highlights = []
    for i, ln in enumerate(outside):
        if re.match(r"^(?:tour |day |trip )?highlights(?: of the day| along the way)?:?$", ln, re.I):
            for nxt in outside[i + 1:i + 12]:
                if nxt.startswith("- "):
                    highlights.append(nxt[2:])
                elif highlights:
                    break
            if highlights:
                break
    # images
    imgs, seen = [], set()
    for u in re.findall(r"(?:data-src|src|href)=[\"'](https?://[^\"']*wp-content/uploads/[^\"']+\.(?:jpe?g|png|webp|gif|avif))", prep(p["content"]["rendered"]), re.I):
        k = upload_key(u)
        if k not in seen:
            seen.add(k); imgs.append(k)
    gids = []
    for ids in re.findall(r"\[(?:vc_gallery|vc_images_carousel|vc_single_image|gallery)[^\]]*?(?:images|ids|image)=[”\"“]([\d,]+)", c):
        gids += [int(x) for x in ids.split(",") if x]
    gallery = []
    for g in gids:
        mm = media_by_id.get(g)
        if mm:
            k = upload_key(mm["source_url"])
            if k not in seen:
                seen.add(k); gallery.append(k)
    by_file = {upload_key(m["source_url"]): m for m in media_by_id.values()}
    by_file.update({m["source_url"]: m for m in media_by_id.values()})   # raw names win (some originals contain WxH)
    for m in media_by_id.values():            # media attached to this tour in the library
        if m.get("post") == p["id"]:
            k = m["source_url"]
            if k not in seen and upload_key(k) not in seen:
                seen.add(k); gallery.append(k)

    def rel(u):
        f = u.split("/wp-content/uploads/")[-1]
        m = by_file.get(u, {})
        md = m.get("media_details") or {}
        return {"file": "images/" + f, "alt": m.get("alt_text", ""), "title": clean_title((m.get("title") or {}).get("rendered", "")),
                "width": md.get("width"), "height": md.get("height"), "exists": os.path.exists(os.path.join(ROOT, "images", *f.split("/")))}
    # pricing
    pricing = parse_pricing(c, tabs_raw)
    alltext = " ".join(to_lines(c))
    no_pricing = re.sub(r"\[vc_(?:cta|pricing_table)[^\]]*\].*?\[/vc_(?:cta|pricing_table)\]", "", no_tabs, flags=re.S)
    pm = price_mentions(" ".join(to_lines(no_pricing)) + " " + " ".join(excluded + included))
    hints = []
    for mp in merged_posts:
        for m2 in price_mentions(" ".join(to_lines(prep(mp["content"]["rendered"])))):
            hints.append({"from_old_id": mp["id"], **m2})
    pricing["mentions"] = pm
    pricing["merged_hints"] = hints[:8]
    if pricing["status"] == "none" and (pm or hints):
        pricing["status"] = "mentions_only"
    pm_only = [m for m in pm if m["kind"] == "price"]   # supplements stay listed, prices outside the block get flagged
    # duration
    dm = re.search(r"(\d+)\s*[-–]?\s*days?", title, re.I)
    nm = re.search(r"(\d+)\s*nights?", title, re.I)
    days = int(dm.group(1)) if dm else (1 if cat == "day-trips-from-marrakech" else None)
    if days is None and fmt == "days" and itinerary:
        days = len(itinerary)
    y = p.get("yoast_head_json") or {}
    flags = []
    if not imgs: flags.append("no_image")
    if not itinerary: flags.append("no_itinerary")
    if days and fmt == "days" and itinerary and len(itinerary) != days: flags.append(f"days_mismatch(title {days} vs parsed {len(itinerary)})")
    if not included: flags.append("no_included")
    if not excluded: flags.append("no_excluded")
    if not intro: flags.append("no_intro")
    if not (y.get("description")): flags.append("no_meta_description")
    return {
        "id": p["id"], "category": cat, "old_url": "/" + p["slug"] + "/", "new_url": new_url, "title": title,
        "duration_days": days, "duration_nights": int(nm.group(1)) if nm else None, "format": fmt,
        "seo": {"title": noemo(y.get("title", "")), "description": y.get("description", "")},
        "summary": intro, "highlights": highlights, "facts": facts,
        "itinerary": itinerary, "included": included, "excluded": excluded, "packing": packing, "upgrades": upgrades,
        "other_tabs": others, "pricing": pricing,
        "images": {"hero": rel(imgs[0]) if imgs else None, "content": [rel(u) for u in imgs], "gallery": [rel(u) for u in gallery]},
        "legacy": {"modified": p["modified"][:10], "merged_from": [m["id"] for m in merged_posts]},
        "locale": "en", "flags": flags,
    }


def main():
    posts = {p["id"]: p for p in json.load(open(os.path.join(DATA, "posts.json"), encoding="utf-8"))}
    media = {m["id"]: m for m in json.load(open(os.path.join(DATA, "media.json"), encoding="utf-8"))}
    cmap = list(csv.DictReader(open(os.path.join(DATA, "consolidation_map.csv"), encoding="utf-8-sig")))
    merged = {}
    for r in cmap:
        if r["action"] == "merge":
            merged.setdefault(int(r["canonical_id"]), []).append(posts[int(r["id"])])
    tours = []
    for r in cmap:
        if r["action"] != "keep":
            continue
        i = int(r["id"])
        tours.append(parse_post(posts[i], media, r["category"], r["new_url"], merged.get(i, [])))
    tours.sort(key=lambda t: (t["category"], t["new_url"]))
    json.dump({"source": "toubkal-peaks.com scrape 2026-10-26", "count": len(tours), "tours": tours},
              open(os.path.join(DATA, "tours_structured.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    # price review sheet
    cols = ["id", "category", "title", "days", "status", "basis", "p_1", "p_2_3", "p_4_7", "p_8_12", "from_price", "flags",
            "raw_pricing_block", "other_mentions", "merged_duplicate_hints", "FINAL_price_eur_pp", "FINAL_decision", "notes"]
    with open(os.path.join(DATA, "price_review.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f); w.writerow(cols)
        for t in tours:
            pr = t["pricing"]; tiers = {x["label"]: x["price"] for x in pr["tiers"]}
            prices = [x["price"] for x in pr["tiers"] if x["price"]]
            fl = []
            if pr["tiers"]:
                if any(a < b for a, b in zip(prices, prices[1:])): fl.append("price_increases_with_group")
                if len(prices) < 4: fl.append("missing_or_not_accepted_tier")
                if pr["basis"] is None: fl.append("basis_unspecified")
            if pr["status"] == "mentions_only": fl.append("no_pricing_block")
            if any(m["kind"] == "supplement" for m in pr["mentions"]): fl.append("has_supplement_text")
            if pr["merged_hints"]: fl.append("merged_duplicate_has_prices")
            tier_set = {int(x) for x in prices}
            def nums(s): return {int(float(n.replace(",", ""))) for n in re.findall(r"\d[\d,]*(?:\.\d+)?", s)}
            diff = sorted({n for m in pr["mentions"] if m["kind"] == "price" for n in nums(m["value"]) if n >= 100 and n not in tier_set})
            if pr["tiers"] and diff: fl.append("text_price_differs:" + "/".join(map(str, diff)))
            w.writerow([t["id"], t["category"], t["title"], t["duration_days"], pr["status"], pr["basis"] or "",
                        tiers.get("1", ""), tiers.get("2-3", ""), tiers.get("4-7", ""), tiers.get("8-12", ""),
                        pr["from_price"] or "", "; ".join(fl), " || ".join(pr["raw"])[:300],
                        " || ".join(f'{m["value"]} [{m["kind"]}]: {m["context"]}' for m in pr["mentions"])[:600],
                        " || ".join(f'#{m["from_old_id"]} {m["value"]}: {m["context"]}' for m in pr["merged_hints"])[:400],
                        "", "", ""])
    print(len(tours), "tours written")


if __name__ == "__main__":
    main()
