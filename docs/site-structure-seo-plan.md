# Toubkal Peaks — Content audit, SEO baseline & proposed site structure

Source: scrape of toubkal-peaks.com (WordPress + Yoast + WPBakery), 2026-10-26.
Archive: `C:\Users\pc\Documents\JalimX\clients\toubkal peaks\scrape\` (data/, content/, images/)

## 1. What exists today

| Item | Count | Notes |
|---|---|---|
| Tours (WP "posts") | 66 | All in one category "Morocco Tour", 0 tags, flat root-level URLs |
| Pages | 11 | Home, 6 hub pages, Contact, Privacy, 1 junk "Top tourist destinations" (103 words) |
| Media library | 210 | Being downloaded to `scrape/images/` |
| Meta descriptions | 3 / 77 present | Titles are emoji-prefixed, many 90–120 chars (truncated in Google) |
| Tour length | avg ~1,070 words, 49 have day-by-day accordions, 54 mention prices, 65 list inclusions | Content is real and reusable |
| Sitemap / robots | Yoast sitemap, `robots.txt` allows everything | Good: AI crawlers are not blocked |

### Problems to fix in the rebuild
1. **No hierarchy.** 66 tours sit at `/slug/`; only the trekking pages are nested (`/trekking-in-morocco/...`). Google and AI engines cannot infer topics.
2. **Duplicates / cannibalization.** Three near-identical "4 Days From Fes to Marrakech via Merzouga" tours, two "Erg Chegaga 3 days", two "Marrakech to Fez via Merzouga 4 days", several 2/3-day Toubkal variants.
3. **Broken or junk items.** `3-days-erg-chegaga-wild-sahara-desert` has 0 words; `schools` and `one-day-trip` are not tours.
4. **Metadata.** Emoji in H1/titles, no meta descriptions, no structured data beyond Yoast defaults.
5. **Content is trapped in WPBakery shortcodes** (`[vc_accordion_tab ...]`) — needs parsing into structured fields.

## 2. SEO baseline (search index, US market, 2026-10-26)

- 39 ranking keywords, ~21 organic visits/month, 0 keywords in top 3, 1 in top 10.
- Only real footholds: `skiing in morocco atlas mountains` (170/mo, pos 16–20), `tinmel mosque` (140/mo, pos 17), `ouirgane valley` (50/mo, pos 7), `jbel saghro` (30/mo, pos 18).
- Competitor with real traffic: `mount-toubkal.com` (~1,640 visits/mo, 97 keywords). Others (imlil-trekking.com, skimorocco.com) are small. The SERPs for tour keywords are dominated by marketplaces (Civitatis, Headout, GetYourGuide, OnTheGoTours).
- **Implication:** the old site has almost no organic equity, so restructuring URLs carries very low risk. Still, keep a full 301 map.

### Demand (monthly searches, US index — treat as directional, other markets add more)

| Theme | Keyword | Volume |
|---|---|---|
| Toubkal | mount toubkal / morocco mount toubkal | 2,400 |
| Toubkal | trekking / hiking mount toubkal (variants) | 140–210 each |
| Toubkal | mount toubkal height | 170 |
| Day trips | day trips from marrakech (morocco) | 720 |
| Day trips | marrakech day trips | 260 |
| Day trips | atlas mountains day trips from marrakech | 140 |
| Desert | sahara desert morocco | 1,900 |
| Desert | morocco desert (tour) | 1,900 / 720 |
| Desert | merzouga desert tour; 3-day marrakech to merzouga | 140 each |
| Ski | skiing in atlas mountains | 170 (CPC ≈ $8.7) |

Reading: individual keywords are small; winning comes from **topical authority** (many tightly related, well-linked pages) plus conversion, not one head term. Informational queries (height, difficulty, best time, cost, packing) feed the guides section and bring the high-intent traffic later.

## 3. Proposed information architecture

```
/                                   Home
/treks/                             Hub: all treks
  /treks/toubkal/                   Hub: Toubkal summit treks (2d, 3d, 6–7d combos)
  /treks/atlas-valleys-villages/    Hub: non-summit valley & Berber village treks
  /treks/regional-treks/            Hub: Mgoun, Sirwa, Saghro, Dades, Ait Bougmez, Rose Valley, Rif (Chefchaouen), ski
  /treks/<tour-slug>/               Tour page
/sahara-desert-tours/               Hub: Merzouga (Erg Chebbi), Erg Chegaga, Zagora
  /sahara-desert-tours/<tour-slug>/
/morocco-tours/                     Hub: multi-day circuits (imperial cities, south, coast, family)
  /morocco-tours/<tour-slug>/
/day-trips-from-marrakech/          Hub
  /day-trips-from-marrakech/<slug>/ (Imlil, Ourika, Ouzoud, Ait Ben Haddou, Essaouira, Agafay sunset, 3 valleys, horse, biking, Marrakech private tour)
/destinations/                      Place pages that link to the tours (topical authority)
  toubkal-national-park, imlil, ourika-valley, ouirgane-valley, merzouga-erg-chebbi, erg-chegaga, ait-ben-haddou, essaouira, chefchaouen …
/guides/                            Blog / travel guides (informational intent)
  mount-toubkal-height-and-difficulty, best-time-to-climb-toubkal, toubkal-in-winter, packing-list, cost, fitness, altitude, etc.
/about/  /why-us/  /reviews/  /faq/  /responsible-travel/
/contact/  /plan-your-trip/ (custom trip request)  /privacy-policy/  /terms/
```

Rules:
- One primary page per intent. Variants (e.g. the three Fes→Marrakech Merzouga tours) merge into **one** page per direction/length; extra options become "variants" or "add-ons" inside the page.
- Tours link up to their hub, across to 2–3 related tours, and out to destination pages + one guide. Hubs link to all children.
- Breadcrumbs everywhere (`BreadcrumbList` JSON-LD).
- Slugs: lowercase, no number-first noise where avoidable (`/treks/toubkal/3-days-toubkal-summit/`), no emojis.

### Tour page template (answer-first, GEO-friendly)
1. H1 = `3-Day Mount Toubkal Trek from Marrakech` (keyword first, no emoji).
2. Key-facts block: duration, difficulty, max altitude, distance/elevation, group size, season, price from, departure point, languages.
3. 2–3 sentence summary that answers "what is this and who is it for".
4. Day-by-day itinerary (structured, collapsible, with per-day stats).
5. Included / not included, accommodation, packing & fitness, safety.
6. Gallery, map, reviews, FAQ (4–8 questions, `FAQPage` JSON-LD).
7. Sticky booking/inquiry CTA, related tours, related guides.

### Structured data
`TravelAgency`/`LocalBusiness` (sitewide), `TouristTrip` + `Offer` (price), `ItemList` on hubs, `BreadcrumbList`, `FAQPage`, `Article` on guides, `Review`/`AggregateRating` only with real reviews.

### Technical SEO (Next.js)
- SSG/ISR for all tour, hub, destination and guide pages; metadata and canonical per page.
- `sitemap.ts` (tours, hubs, destinations, guides, image entries), `robots.ts` allowing Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot; add `llms.txt`.
- 301 redirect map from every old URL (kept in `redirects.json`, generated from `scrape/content/index.csv`).
- `next/image` with real `alt` text (media map is in `scrape/data/media_map.json`), AVIF/WebP, explicit sizes; Core Web Vitals budget LCP < 2.5 s.
- i18n-ready routing from day one (`/fr/…`, `/es/…`) with `hreflang`; launch in English, add French first (largest Morocco-travel audience), then Spanish.

## 4. Content plan
1. **Consolidate** 66 tours → **59 canonical tours** (+2 items to review). Comparing the real day-by-day itineraries showed most "similar" tours are genuinely different products, so only these are merged: the three Fes→Marrakech 4-day Merzouga pages → 1; the two Marrakech→Fez 4-day pages → 1; the empty Erg Chegaga draft → the 3-day page; the 2022 "6 Days Toubkal & Desert Camel Trek" → the 2025 "6-Days Mt Toubkal & Sahara Desert Adventure". `schools` and `one-day-trip` need a client decision. Two tours have misleading slugs (they are really "11 Days from Tangier" and "13 Days Casablanca city to city") — new URLs follow the real titles. Full table: `consolidation_map.csv`; 301 list (72 old URLs): `redirects.json`.
   | New section | Tours |
   |---|---|
   | `/treks/toubkal/` | 7 |
   | `/treks/atlas-valleys-villages/` | 9 |
   | `/treks/regional-treks/` | 8 |
   | `/sahara-desert-tours/` | 9 |
   | `/morocco-tours/` | 13 |
   | `/day-trips-from-marrakech/` | 13 |
2. **Rewrite titles and meta descriptions** for every page (title ≤ 60 chars, description 140–160, no emojis).
3. **Parse** WPBakery content into structured JSON (days, stats, includes, excludes, price) and load it into the Laravel database.
4. **Create** the 6 hubs and ~10 destination pages from existing hub copy + new text.
5. **Guides:** start with 8 articles targeting Toubkal informational queries and desert/day-trip planning questions.
6. Keep and improve the four pages that already rank (skiing, Tinmel, Ouirgane, Saghro).

## 5. Decisions (answered 2026-10-26)
1. **Languages:** English (default, no URL prefix), French `/fr/`, Spanish `/es/`, German `/de/`. `hreflang` between all versions; translations stored per field in the database (see section 6).
2. **Reservations:** a booking system managed from an admin dashboard (to be built later). Customers submit a booking request/reservation on the site; staff confirm it in the dashboard; emails via Resend.
3. **Prices:** take them from the current site where present; otherwise show "Price on request" (inquiry). Prices must be editable from the dashboard later. Extraction needs a manual check per tour: the old text mixes per-person-per-day rates, supplements and totals (e.g. `€55`, `from 35 EUR p/p`, `789€`).
4. **Merge duplicates + 301 redirects:** approved (59 tours; 72 old URLs mapped).
5. **Brand:** see 5a.
6. **Reviews:** aggregate from all sources (Google, TripAdvisor, others) — stored in the database with source, author, date, rating; `AggregateRating` only from reviews that really exist and are shown on the page.
7. **Target markets:** UK, US, France, Spain, Germany (+ others) — drives the four languages; pricing displayed in EUR with optional USD/GBP.

### 5a. Brand and domain recommendation
- **Primary domain: `toubkal-peaks.com`.** It is indexed, already carries the rebuilt infrastructure (Cloudflare, Resend, API), and has the only existing (small) equity. `toubkalpeakstravel.com` is currently a parked domain with no site: point it at the main site with a 301 (do not run two sites).
- **Brand/entity name: "Toubkal Peaks Travel"** in schema (`legalName`/`name`), the footer and the About page — it adds the "travel" intent term for brand searches. **Short name "Toubkal Peaks"** (`alternateName`) for the logo/header and the title suffix (`… | Toubkal Peaks`) to save title length. Use these two consistently; retire "Trekking in Morocco Toubkal Peaks".

## 6. Data model implications (for the Laravel build)
- Translatable content (title, summary, itinerary, includes, SEO fields) per locale `en/fr/es/de`; English is the source and the fallback.
- `tours` (category, slug per locale, duration, difficulty, altitude, season, group size, price nullable + `price_on_request`, currency, status), `tour_days`, `tour_inclusions`, `tour_images`, `destinations`, `guides` (articles), `reviews` (source, rating, author, date, tour nullable), `bookings` (status workflow pending → confirmed → paid/cancelled), `redirects` (old → new), `price_overrides`/seasonal prices later.
- Admin dashboard (later): CRUD for all of the above, booking management, price editing, review import, redirect manager.

## 7. Implemented schema (Laravel, 2026-10-26)
Tables (all get the `tp_` prefix in production through `DB_PREFIX`): `categories` + `category_translations`, `media`, `tours` + `tour_translations` + `tour_prices` + `tour_media`, `bookings` + `booking_status_logs`, `reviews`, `redirects`.
- Text lives in `*_translations` rows (`locale` = en/fr/es/de, English is the fallback). Lists (itinerary, included, excluded, packing, facts) are JSON columns inside `tour_translations`; URL slugs are unique per locale.
- Prices: `tours.price_mode` (`tiers` | `on_request`) + `tour_prices` rows per group size (null price = not available). `price_reviewed_at` stays null until a person has checked an imported price.
- Bookings: reference `TP-YYYY-XXXXXX`, status workflow pending → confirmed → paid → completed (or cancelled), every change written to `booking_status_logs`.
- Importer: `php artisan toubkal:import [--publish] [--update]` reads `backend/database/data/tours_structured.json` and `redirects.json` (the canonical copies). Existing tours are skipped unless `--update`, so admin edits are never overwritten.

### 7a. Images on Cloudflare R2
- Disk `r2` (`config/filesystems.php`) uses a small own adapter (`app/Support/R2`, SigV4 over Laravel's HTTP client) instead of aws-sdk-php, which would add thousands of files to the shared host's vendor folder. Verified against the official AWS signature test vector and against the real bucket.
- Public URL: `https://cdn.toubkal-peaks.com/<path>` (path = `media.path`, e.g. `2019/09/ourika-valley.jpg`); objects carry `Cache-Control: public, max-age=31536000, immutable`.
- `MEDIA_DISK=r2` in production. `php artisan media:upload --source=<images folder> [--force] [--dry-run]` uploads every file listed in the `media` table (idempotent, retries transient network errors). 72 tour images are in the bucket; the other 138 files of the old media library belong to the home/hub pages and will be uploaded when those pages are built.
- Never run `migrate`/`toubkal:import` from a local `.env` that points at the production database: use a local DB or `DB_CONNECTION=sqlite DB_DATABASE=<file>`.

### 7b. Running one-time commands on the server (no terminal)
`backend/deploy/cron-composer.php` runs the lines of `backend/deploy/artisan-queue.txt` once after each successful migration, logs the result in `storage/logs/deploy.log` (`queue [ok|failed|rejected] ...`) and removes the line from the file on the server, even when it failed (no retry loop). The file ships with the code: a `git push` that changes it triggers the commands once (the FTP deploy only re-uploads files whose content changed). `storage/app/artisan-queue.txt` can still be created by hand for ad-hoc commands.
Allowed: `toubkal:import`, `db:seed`, `cache:clear` with plain `--options`. Destructive commands (`migrate:fresh`, `db:wipe`...) are rejected by design.

First production import = the `toubkal:import` line already in `artisan-queue.txt`. Tours arrive as drafts; existing tours are never overwritten without `--update`; images are already in R2 (`MEDIA_DISK` defaults to `r2` when `R2_BUCKET` is set).

## 8. Public API v1 (Laravel, consumed by Next.js)
Base: `https://api.toubkal-peaks.com/api/v1`. All GET endpoints send `Cache-Control: public, max-age=60, stale-while-revalidate=300`. Only **published** tours are visible (`php artisan toubkal:publish --all|--category=<key>`, also usable from the cron queue).

| Endpoint | Purpose |
|---|---|
| `GET /categories?locale=` | Hub tree: key, translated slug/name/intro, URL `path`, published `tours_count`, children |
| `GET /tours?locale=&category=&featured=1&per_page=` | Tour cards (title, `path`, summary, duration, difficulty, `from_price`, hero image). `category=treks` includes its children |
| `GET /tours/{slug}?locale=` | Full tour: itinerary, included/excluded, packing, pricing tiers, images, reviews, 3 related tours, `seo` (generated `<title> \| Toubkal Peaks` fallback), `alternates` for hreflang. Untranslated locales return English with `locale` (actual) vs `requested_locale` |
| `GET /reviews?tour=&featured=1&per_page=` | Published reviews from every source + `summary` {count, average} |
| `GET /redirects` | Active 301 map (old WordPress URL → new path), 5 min server cache |
| `POST /bookings` | Reservation request: stores a `pending` booking (reference `TP-YYYY-XXXXXX`), returns an estimated total from the per-person tier, emails the customer (replies go to `reservations@toubkal-peaks.com`, set by `BOOKING_REPLY_TO_EMAIL`) and the team (`BOOKING_NOTIFY_EMAIL`: one or several addresses separated by commas). Rate limit 3/min and 20/day per IP; hidden `website` honeypot field; mail failures never lose the booking |

Email goes through Resend SMTP (see `.env.production.example`); templates are English for now (the booking stores the visitor's `locale` for later translation).
Legacy WordPress SEO titles are not imported; a migration clears the ones from the first import.
