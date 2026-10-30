"""Download / copy every library image, resize to max 1920 px wide, compress to JPEG (well under 2 MB), and
write the manifest the backend imports (database/data/media/trip-images.json)."""
import io, os, re, sys, json, urllib.request, concurrent.futures as cf, unicodedata
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from library import L, T, PAGES

OLD = r'C:\Users\pc\Documents\JalimX\clients\toubkal peaks\scrape\images'
OWN = r'C:\Users\pc\Documents\JalimX\clients\toubkal peaks\media\images'
OUT = os.path.join(HERE, 'library')
REPO = r'C:\projects\client projects\toubkal peaks'
MAX_W, MAX_BYTES = 1920, 2 * 1024 * 1024
os.makedirs(OUT, exist_ok=True)


def slug(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')[:60].rstrip('-')


def source_bytes(src):
    kind, ref = src.split(':', 1)
    if kind == 'px':
        url = f'https://images.pexels.com/photos/{ref}/pexels-photo-{ref}.jpeg?auto=compress&cs=tinysrgb&w=2400'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        return urllib.request.urlopen(req, timeout=60).read()
    base = OLD if kind == 'old' else OWN
    return open(os.path.join(base, ref.replace('/', os.sep)), 'rb').read()


def build(key):
    src, alt = L[key]
    name = f'{key}-{slug(alt)}.jpg'
    path = os.path.join(OUT, name)
    if not os.path.exists(path):
        im = ImageOps.exif_transpose(Image.open(io.BytesIO(source_bytes(src)))).convert('RGB')
        if im.width > MAX_W:
            im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
        for q in (82, 76, 70, 62):
            buf = io.BytesIO()
            im.save(buf, 'JPEG', quality=q, optimize=True, progressive=True)
            if buf.tell() <= MAX_BYTES:
                break
        open(path, 'wb').write(buf.getvalue())
    im = Image.open(path)
    return key, {'file': name, 'width': im.width, 'height': im.height, 'kb': os.path.getsize(path) // 1024, 'alt': {'en': alt}, 'source': src}


keys = sorted({k for v in T.values() for k in v.split()} | set(PAGES.values()))
images = {}
with cf.ThreadPoolExecutor(6) as ex:
    for key, info in ex.map(build, keys):
        images[key] = info

big = [k for k, v in images.items() if v['kb'] > 2048]
print(len(images), 'images,', sum(v['kb'] for v in images.values()) // 1024, 'MB in total, largest', max(v['kb'] for v in images.values()), 'KB; over 2 MB:', big)
small = sorted((v['width'], k) for k, v in images.items() if v['width'] < 1200)
print('narrower than 1200 px:', small)

manifest = {
    '_comment': 'Trip photos. Files live on R2 under site/trips/; imported by toubkal:sync-images. Keys are short ids, tours are old WordPress ids, the first image of a tour is its main photo.',
    'base': 'site/trips/',
    'images': {k: {kk: v[kk] for kk in ('file', 'width', 'height', 'alt', 'source')} for k, v in sorted(images.items())},
    'tours': {str(t): v.split() for t, v in T.items()},
}
dest = os.path.join(REPO, 'backend', 'database', 'data', 'media')
os.makedirs(dest, exist_ok=True)
json.dump(manifest, open(os.path.join(dest, 'trip-images.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump({k: images[v]['file'] for k, v in PAGES.items()}, open(os.path.join(HERE, 'pages.json'), 'w'), indent=1)
print('manifest written')
