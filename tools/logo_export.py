"""Toubkal Peaks logo: transparent master, layout variants, mono versions, icons, social/OG/email sizes."""
import os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

SRC = r"C:\Users\pc\Documents\JalimX\clients\toubkal peaks\media\logo\logo.jpeg"
OUT = r"C:\Users\pc\Documents\JalimX\clients\toubkal peaks\media\logo\exports"
PHOTO = r"C:\Users\pc\AppData\Local\Temp\tp-site-opt\aroumd-village.jpg"

NAVY = (2, 46, 85)
GOLD = (188, 118, 37)
SKY_BLUE = (31, 78, 122)
PAPER = (251, 248, 243)

for d in ("master", "web", "mono", "icons", "social"):
    os.makedirs(os.path.join(OUT, d), exist_ok=True)


def save(img, rel, webp=True):
    path = os.path.join(OUT, rel)
    img.save(path, optimize=True)
    if webp and path.endswith(".png"):
        img.save(path[:-4] + ".webp", "WEBP", quality=92, method=6)
    return path


# ── 1. transparent master: remove only the white background connected to the edges ─────────────
rgb = Image.open(SRC).convert("RGB")
a = np.asarray(rgb).astype(np.float32)
H, W, _ = a.shape
near_white = (a.min(axis=2) >= 238).astype(np.uint8) * 255
mask = Image.fromarray(near_white, "L").copy()   # fromarray() is read-only: floodfill would be a silent no-op
for corner in [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1)]:
    if mask.getpixel(corner) == 255:
        ImageDraw.floodfill(mask, corner, 128, thresh=0)
bg = np.asarray(mask) == 128
# Below the illustration (name, pillars, tagline) there is no intended white: also clear the enclosed
# counters of letters (O, B, A, P...), which are not connected to the outer background.
TEXT_TOP = 668
bg[TEXT_TOP:, :] |= a[TEXT_TOP:].min(axis=2) >= 238

alpha = np.where(bg, 0.0, 1.0)
# anti-aliased rim: pixels touching the removed background get colour-to-alpha against white
bg_img = Image.fromarray((bg * 255).astype(np.uint8), "L").filter(ImageFilter.MaxFilter(5))
rim = (np.asarray(bg_img) > 0) & ~bg
c2a = np.clip((255.0 - a.min(axis=2)) / 255.0 * 1.15, 0, 1)
alpha = np.where(rim, c2a, alpha)
safe = np.maximum(alpha, 1e-3)[..., None]
unpremul = np.clip((a - (1 - alpha[..., None]) * 255.0) / safe, 0, 255)
rgba = np.dstack([np.where(rim[..., None], unpremul, a), alpha * 255]).astype(np.uint8)
master = Image.fromarray(rgba, "RGBA")


def trim(img, pad=12):
    box = img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    x0, y0, x1, y1 = box
    return img.crop((max(0, x0 - pad), max(0, y0 - pad), min(img.width, x1 + pad), min(img.height, y1 + pad)))


full = trim(master)
save(full, "master/logo-full.png")
save(full, "master/logo-full-transparent-1254.png", webp=False)

# ── 2. layout variants (bands measured on the original artwork) ───────────────────────────────
emblem = trim(master.crop((80, 80, 1170, 668)))
wordmark = trim(master.crop((80, 668, 1170, 952)))
compact = trim(master.crop((80, 80, 1170, 952)))         # emblem + name, no pillars / tagline
pillars = trim(master.crop((150, 958, 1060, 1140)))
save(emblem, "master/logo-emblem.png")
save(wordmark, "master/logo-wordmark.png")
save(compact, "master/logo-compact.png")
save(pillars, "master/logo-pillars.png")


def horizontal(em, wm, height=300, gap_ratio=0.12):
    eh = height
    ew = round(em.width * eh / em.height)
    wh = round(height * 0.70)
    ww = round(wm.width * wh / wm.height)
    gap = round(height * gap_ratio)
    canvas = Image.new("RGBA", (ew + gap + ww, height), (0, 0, 0, 0))
    canvas.alpha_composite(em.resize((ew, eh), Image.LANCZOS), (0, 0))
    canvas.alpha_composite(wm.resize((ww, wh), Image.LANCZOS), (ew + gap, (height - wh) // 2))
    return canvas


horiz = horizontal(emblem, wordmark)
save(horiz, "master/logo-horizontal.png")


# ── 3. mono versions (one colour, alpha preserved) ────────────────────────────────────────────
def recolor(img, color):
    out = Image.new("RGBA", img.size, color + (0,))
    out.putalpha(img.getchannel("A"))
    return out


def ink_only(img, threshold=235):
    """Keep only the inked shapes (letters/lines) of a crop as alpha, from darkness."""
    arr = np.asarray(img).astype(np.float32)
    dark = 1.0 - arr[..., :3].min(axis=2) / 255.0
    alpha = np.clip(dark * 1.25, 0, 1) * (arr[..., 3] / 255.0)
    return Image.fromarray((alpha * 255).astype(np.uint8), "L")


for name, img in (("wordmark", wordmark),):   # the illustration has no meaningful one-colour version
    shape = ink_only(img)
    navy = Image.new("RGBA", img.size, NAVY + (0,)); navy.putalpha(shape)
    white = Image.new("RGBA", img.size, (255, 255, 255, 0)); white.putalpha(shape)
    black = Image.new("RGBA", img.size, (0, 0, 0, 0)); black.putalpha(shape)
    save(navy, f"mono/logo-{name}-navy.png")
    save(white, f"mono/logo-{name}-white.png")
    save(black, f"mono/logo-{name}-black.png")

# colour emblem + white name, for dark backgrounds (footer, photos)
wm_white = Image.new("RGBA", wordmark.size, (255, 255, 255, 0)); wm_white.putalpha(ink_only(wordmark))
save(horizontal(emblem, wm_white), "master/logo-horizontal-on-dark.png")

# ── 4. web header sizes (1x and 2x) ───────────────────────────────────────────────────────────
for h in (48, 64):
    for scale in (1, 2):
        hh = h * scale
        img = horiz.resize((round(horiz.width * hh / horiz.height), hh), Image.LANCZOS)
        save(img, f"web/logo-horizontal-{h}h@{scale}x.png")
for w in (320, 640):
    save(compact.resize((w, round(compact.height * w / compact.width)), Image.LANCZOS), f"web/logo-compact-{w}w.png")


# ── 5. icon mark (drawn, readable at 16 px) ───────────────────────────────────────────────────
def draw_mark(size, rounded=True, full_bleed=False, safe=1.0):
    S = 1024
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if full_bleed:
        d.rectangle((0, 0, S, S), fill=NAVY)
    else:
        d.rounded_rectangle((0, 0, S - 1, S - 1), radius=230 if rounded else 0, fill=NAVY)

    def p(x, y):  # scale artwork into the safe area around the centre
        return (S / 2 + (x - S / 2) * safe, S / 2 + (y - S / 2) * safe)

    sun_c, sun_r = p(700, 330), 92 * safe
    d.ellipse((sun_c[0] - sun_r, sun_c[1] - sun_r, sun_c[0] + sun_r, sun_c[1] + sun_r), fill=GOLD)
    body = [p(96, 820), p(420, 230), p(560, 470), p(660, 370), p(928, 820)]
    d.polygon(body, fill=SKY_BLUE)
    snow_main = [p(420, 230), p(312, 428), p(362, 402), p(404, 446), p(452, 398), p(500, 438), p(530, 418)]
    d.polygon(snow_main, fill=PAPER)
    snow_second = [p(660, 370), p(604, 448), p(640, 432), p(672, 462), p(706, 430), p(724, 444)]
    d.polygon(snow_second, fill=PAPER)
    d.rectangle((*p(96, 820), *p(928, 828)), fill=GOLD)
    return img.resize((size, size), Image.LANCZOS)


mark = draw_mark(1024)
save(mark, "icons/mark-1024.png")
for s in (16, 32, 48, 64, 128, 192, 256, 512):
    save(draw_mark(s), f"icons/icon-{s}.png", webp=False)
save(draw_mark(512, full_bleed=True, safe=0.78), "icons/icon-maskable-512.png", webp=False)
save(draw_mark(192, full_bleed=True, safe=0.78), "icons/icon-maskable-192.png", webp=False)
apple = draw_mark(180, full_bleed=True, safe=0.86).convert("RGB")
apple.save(os.path.join(OUT, "icons", "apple-touch-icon.png"), optimize=True)
draw_mark(256).save(os.path.join(OUT, "icons", "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])


# ── 6. social, OG and email ───────────────────────────────────────────────────────────────────
def on_paper(img, canvas_size, max_w_ratio=0.78, max_h_ratio=0.78, bg=PAPER):
    cw, ch = canvas_size
    scale = min(cw * max_w_ratio / img.width, ch * max_h_ratio / img.height)
    lg = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    canvas = Image.new("RGBA", canvas_size, bg + (255,))
    canvas.alpha_composite(lg, ((cw - lg.width) // 2, (ch - lg.height) // 2))
    return canvas.convert("RGB")


for s in (400, 1080):
    on_paper(compact, (s, s), 0.82, 0.82).save(os.path.join(OUT, "social", f"avatar-{s}.png"), optimize=True)
on_paper(full, (1080, 1080), 0.86, 0.9).save(os.path.join(OUT, "social", "logo-square-1080.png"), optimize=True)
on_paper(horiz, (600, 160), 0.86, 0.72, bg=(255, 255, 255)).save(os.path.join(OUT, "social", "email-header-600x160.png"), optimize=True)
on_paper(horiz, (1200, 320), 0.86, 0.72, bg=(255, 255, 255)).save(os.path.join(OUT, "social", "email-header-1200x320@2x.png"), optimize=True)
on_paper(horiz, (1500, 500), 0.8, 0.6).save(os.path.join(OUT, "social", "cover-1500x500.png"), optimize=True)

# default Open Graph image: logo on paper (left) + Aroumd photo (right)
og = Image.new("RGB", (1200, 630), PAPER)
if os.path.exists(PHOTO):
    ph = Image.open(PHOTO).convert("RGB")
    target_w, target_h = 560, 630
    scale = max(target_w / ph.width, target_h / ph.height)
    ph = ph.resize((round(ph.width * scale), round(ph.height * scale)), Image.LANCZOS)
    left = (ph.width - target_w) // 2
    og.paste(ph.crop((left, 0, left + target_w, target_h)), (640, 0))
logo_og = compact.resize((560, round(compact.height * 560 / compact.width)), Image.LANCZOS)
og_rgba = og.convert("RGBA"); og_rgba.alpha_composite(logo_og, (40, (630 - logo_og.height) // 2))
og_rgba.convert("RGB").save(os.path.join(OUT, "social", "og-default-1200x630.jpg"), quality=88, optimize=True, progressive=True)


# ── 7. previews: check the cut-out on light and dark backgrounds ──────────────────────────────
for name, bgc in (("preview-on-navy.png", NAVY), ("preview-on-white.png", (255, 255, 255)), ("preview-on-sand.png", (232, 201, 160))):
    canvas = Image.new("RGBA", (full.width + 80, full.height + 80), bgc + (255,))
    canvas.alpha_composite(full, (40, 40))
    canvas.convert("RGB").resize((600, round(600 * canvas.height / canvas.width)), Image.LANCZOS).save(os.path.join(OUT, name))

print("full", full.size, "emblem", emblem.size, "wordmark", wordmark.size, "compact", compact.size, "horizontal", horiz.size)
print("removed background pixels:", int(bg.sum()), "rim pixels:", int(rim.sum()))
