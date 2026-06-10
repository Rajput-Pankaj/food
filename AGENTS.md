# FoodExpress — Agent guide

Restaurant ordering platform: React storefront + Express API + PostgreSQL.

## Quick start

```bash
npm run dev:local    # Postgres (Docker) + API + Vite
# → http://localhost:5180
```

## Structure

| Path | Purpose |
|------|---------|
| `src/` | React frontend (Vite, Tailwind v4, React Router) |
| `server/src/` | Express API, routes, DB migrations/seeds |
| `server/seed/` | Menu & blog JSON seeds |
| `scripts/` | Deploy, dev-local, seed utilities |
| `docker-compose.yml` | Production stack (web + api + db) |

## Key scripts

- `npm run dev:local` — fast local development
- `npm run seed:demo` — demo orders, promos, inbox
- `npm test` — API unit tests (Vitest)
- `npm run lint` — ESLint
- `npm run verify` — tests + production build

## Admin

- URL: `/admin`
- Demo: `admin@foodexpress.com` / `Admin@12345`
- Dashboard stats support date filters via `GET /api/admin/stats?from=&to=&tz=`

## Conventions

- Store settings live in `store_settings` table (JSON payload); dark mode off by default (`darkModeEnabled: false`).
- Mobile admin bottom nav: Home, Orders, Kitchen, Menu, More (sidebar for rest).
- Do not commit `.env` or secrets. Cursor rules live in `.cursor/rules/`.
