"""Scrape toubkal-peaks.com (WordPress REST API) into a local content archive."""
import csv, html, json, os, re, sys, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = "https://toubkal-peaks.com"
OUT = r"C:\Users\pc\Documents\JalimX\clients\toubkal peaks\scrape"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36"


def get(url, binary=False, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
                return data if binary else data.decode("utf-8")
        except Exception as e:  # noqa: BLE001
            if i == tries - 1:
                raise
            time.sleep(2 * (i + 1))


def fetch_all(endpoint):
    items, page = [], 1
    while True:
        url = f"{BASE}/wp-json/wp/v2/{endpoint}?per_page=100&page={page}"
        try:
            chunk = json.loads(get(url))
        except Exception as e:  # noqa: BLE001
            if "400" in str(e):  # past last page
                break
            raise
        if not chunk:
            break
        items += chunk
        if len(chunk) < 100:
            break
        page += 1
    return items


def save_json(name, data):
    os.makedirs(os.path.join(OUT, "data"), exist_ok=True)
    with open(os.path.join(OUT, "data", name), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def safe(name):
    return re.sub(r"[^a-zA-Z0-9._-]+", "-", name)[:120].strip("-") or "item"


def main():
    os.makedirs(OUT, exist_ok=True)
    data = {}
    for ep in ["posts", "pages", "categories", "tags", "media"]:
        data[ep] = fetch_all(ep)
        save_json(f"{ep}.json", data[ep])
        print(ep, len(data[ep]), flush=True)

    cats = {c["id"]: c["name"] for c in data["categories"]}
    tags = {t["id"]: t["name"] for t in data["tags"]}
    media_by_id = {m["id"]: m for m in data["media"]}

    # content files + index
    rows = []
    content_imgs = set()
    for kind in ("posts", "pages"):
        d = os.path.join(OUT, "content", kind)
        os.makedirs(d, exist_ok=True)
        for it in data[kind]:
            body = it["content"]["rendered"]
            with open(os.path.join(d, safe(it["slug"]) + ".html"), "w", encoding="utf-8") as f:
                f.write(body)
            for m in re.findall(r'(?:src|data-src|href)="([^"]+wp-content/uploads/[^"]+\.(?:jpe?g|png|webp|gif|avif|svg))"', body, re.I):
                content_imgs.add(m)
            y = it.get("yoast_head_json") or {}
            feat = media_by_id.get(it.get("featured_media"), {}).get("source_url", "")
            rows.append({
                "type": kind[:-1], "id": it["id"], "slug": it["slug"], "url": it["link"],
                "title": html.unescape(it["title"]["rendered"]),
                "seo_title": y.get("title", ""), "seo_description": y.get("description", ""),
                "categories": "|".join(cats.get(c, str(c)) for c in it.get("categories", [])),
                "tags": "|".join(tags.get(t, str(t)) for t in it.get("tags", [])),
                "published": it.get("date", ""), "modified": it.get("modified", ""),
                "featured_image": feat, "words": len(re.sub(r"<[^>]+>", " ", body).split()),
            })
    with open(os.path.join(OUT, "content", "index.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print("content files:", len(rows), flush=True)

    # images
    urls = {m["source_url"] for m in data["media"] if m.get("source_url")}
    for u in content_imgs:
        # drop WordPress size suffix to get the original
        urls.add(re.sub(r"-\d+x\d+(?=\.\w+$)", "", u.split("?")[0]))
    urls = sorted(urls)
    print("images to download:", len(urls), flush=True)
    fails = []

    def dl(u):
        p = urllib.parse.urlparse(u)
        rel = p.path.split("/wp-content/uploads/")[-1]
        dest = os.path.join(OUT, "images", *rel.split("/"))
        if os.path.exists(dest) and os.path.getsize(dest) > 0:
            return
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        try:
            blob = get(urllib.parse.quote(u, safe=":/%"), binary=True)
            with open(dest, "wb") as f:
                f.write(blob)
        except Exception as e:  # noqa: BLE001
            fails.append((u, str(e)))

    with ThreadPoolExecutor(max_workers=4) as ex:
        list(ex.map(dl, urls))
    with open(os.path.join(OUT, "images", "_failed.txt"), "w", encoding="utf-8") as f:
        for u, e in fails:
            f.write(f"{u}\t{e}\n")
    print("done; failed:", len(fails), flush=True)

    # media map: image file -> alt/title/caption (for the new site)
    mm = [{
        "id": m["id"], "file": m["source_url"].split("/wp-content/uploads/")[-1],
        "alt": m.get("alt_text", ""), "title": html.unescape(m["title"]["rendered"]),
        "caption": re.sub(r"<[^>]+>", "", m["caption"]["rendered"]).strip(),
        "width": (m.get("media_details") or {}).get("width"), "height": (m.get("media_details") or {}).get("height"),
        "post": m.get("post"),
    } for m in data["media"]]
    save_json("media_map.json", mm)


if __name__ == "__main__":
    main()
