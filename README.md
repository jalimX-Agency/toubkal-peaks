# Toubkal Peaks

Rebuild of https://toubkal-peaks.com/

| Part | Stack | Host |
|------|-------|------|
| `frontend/` | Next.js (App Router, TS, Tailwind 4) | Vercel |
| `backend/`  | Laravel 12 + Sanctum, MySQL | cPanel (`api.toubkal-peaks.com`) |

## Local dev

```bash
# backend (needs MySQL, e.g. XAMPP; create DB `toubkal_peaks`)
cd backend && php artisan migrate && php artisan serve   # http://localhost:8000

# frontend
cd frontend && cp .env.example .env.local && npm run dev # http://localhost:3000
```

Health check: `GET http://localhost:8000/api/v1/health`.

## Deploy: Laravel on cPanel

1. cPanel → Subdomains: create `api.toubkal-peaks.com`, **document root = `<app>/public`**
   (upload the whole `backend/` folder outside `public_html`, e.g. `~/toubkal-api`, and point the subdomain's document root to `~/toubkal-api/public`).
2. cPanel → MySQL Databases: create DB + user, grant all privileges.
3. Upload `backend/` (zip it **with** `vendor/`, or run `composer install --no-dev -o` via cPanel Terminal / SSH). Select PHP 8.2+ in MultiPHP Manager.
4. Copy `.env.production.example` to `.env`, fill DB/mail values, then:
   ```bash
   php artisan key:generate --force
   php artisan migrate --force
   php artisan config:cache && php artisan route:cache
   ```
5. Make `storage/` and `bootstrap/cache/` writable (775).
6. Set `FRONTEND_URL` to the Vercel/production site origin (CORS).

## Deploy: Next.js on Vercel

1. Import the repo, set **Root Directory = `frontend`**.
2. Env vars: `NEXT_PUBLIC_API_URL=https://api.toubkal-peaks.com/api/v1`, `NEXT_PUBLIC_SITE_URL`, `REVALIDATE_SECRET`.
3. Add domain `www.toubkal-peaks.com` in Vercel; point DNS there.
