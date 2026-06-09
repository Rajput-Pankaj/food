# FoodExpress — Food Delivery Platform

Full-stack food delivery application with a **React 19** frontend, **Express API**, and **PostgreSQL** database.

**Production flow:** pull from git → `./scripts/deploy.sh` → open `/setup` in the browser. No manual token paste, no manual DB setup — the wizard handles store config, admin account, and optional domain (Traefik HTTPS).

---

## Features

- **Marketing homepage** — hero slider, offers, testimonials, featured dishes
- **50-item menu** — nutrition, allergens, galleries, dietary filters
- **Blog** — 8 seeded posts, admin CRUD
- **Customer dashboard** — orders, profile, addresses, reviews
- **Checkout** — delivery / takeaway, COD, dynamic UPI QR, Razorpay
- **Order management** — accept / reject, full status timeline, live tracking
- **Admin panel** — dashboard, orders, menu, users, blogs, reviews, store settings
- **Automated first-run setup** — browser wizard with auto server verification

## Demo Accounts

Demo accounts are created only when `SEED_DEMO_USERS=true` (default **`false`** in production). After `/setup`, use the admin account you create in the wizard.

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@foodexpress.com | Admin@12345 |
| **Customer** | customer@foodexpress.com | Customer@123 |

New signups are always created as **customer**.

---

## Quick Start — Production Deploy

### One-line install (VPS with Docker)

```bash
curl -fsSL https://raw.githubusercontent.com/pankajkumarrajput1116-glitch/food/main/scripts/install.sh | bash
```

This clones the repo, runs `./scripts/deploy.sh`, and prints your setup URL.

### Manual install

```bash
git clone https://github.com/pankajkumarrajput1116-glitch/food.git foodexpress
cd foodexpress
chmod +x scripts/*.sh
./scripts/deploy.sh
```

### Complete setup in the browser

Open:

```text
http://YOUR_SERVER_IP:8080/setup
```

The **setup wizard** (4 steps):

| Step | What you do |
|------|-------------|
| **1. Welcome** | Automatic — server + database verified, secure session started |
| **2. Store** | Restaurant name, address, phone |
| **3. Admin** | Owner email, password (with confirm + show/hide) |
| **4. Domain & launch** | Pre-filled Hostinger URL — change to `foodexpress.com`, sample menu, finish |

**No `SETUP_TOKEN` to copy.** The token stays in `.env` for internal security; the browser uses a short-lived setup session instead.

Deploy auto-sets `DOMAIN=foodexpress.srv1710536.hstgr.cloud`. On the last setup step, change it to your custom domain (e.g. `foodexpress.com`). Setup updates `.env` (`DOMAIN`, `CORS_ORIGIN`, `APP_URL`, Traefik host rule) and keeps the old Hostinger URL as a legacy host during DNS propagation. Then run once on the server:

```bash
cd ~/foodexpress
./scripts/redeploy-domain.sh
```

Point your domain’s DNS **A record** to the server IP before or right after redeploy (Hostinger `*.hstgr.cloud` subdomains work automatically without DNS changes).

---

## Traefik on Hostinger (like Hermes agent)

If **Traefik is already running** on your VPS (Hostinger installs it for Docker Manager / Hermes), `./scripts/deploy.sh` now:

1. Detects Traefik and `TRAEFIK_HOST` (e.g. `srv1710536.hstgr.cloud`)
2. Auto-creates subdomain: **`foodexpress.srv1710536.hstgr.cloud`**
3. Attaches Traefik labels (same pattern as Hermes):
   - `traefik.enable=true`
   - `Host(\`foodexpress.srv1710536.hstgr.cloud\`)`
   - `websecure` + Let's Encrypt
4. **Removes public port `8080` binding** — app is only on HTTPS via Traefik

You get URLs like:

```text
https://foodexpress.srv1710536.hstgr.cloud/setup
```

**Why IP:8080 existed before:** fallback when Traefik was not configured or `DOMAIN` was missing. SSH deploy now prefers Traefik HTTPS when available.

**If Traefik is not installed**, deploy automatically uses **`http://YOUR_IP:8080`** (port exposed, CORS/APP_URL set to your public IP).

| Condition | How you access the app |
|-----------|-------------------------|
| Traefik installed (Hostinger VPS) | `https://foodexpress.srv….hstgr.cloud` |
| Traefik **not** installed | `http://YOUR_IP:8080` |
| Force port mode | Set `FORCE_STANDALONE=true` in `.env` |

**Custom subdomain** (optional in `.env`):

```env
TRAEFIK_SUBDOMAIN=foodexpress-e38b
TRAEFIK_HOST=srv1710536.hstgr.cloud
```

**Custom domain** (your own DNS):

```bash
DOMAIN=food.yourdomain.com ./scripts/deploy.sh
```

---

## What `./scripts/deploy.sh` does

- Checks Docker, memory, and disk
- Pulls latest git (when the tree is clean)
- Creates or updates `.env` with strong random secrets
- Detects **Traefik** → auto HTTPS subdomain on Hostinger (`foodexpress.srv….hstgr.cloud`) or custom `DOMAIN`
- Builds and starts **PostgreSQL + API + Nginx web**
- Waits for `/api/health`
- Prints **HTTPS** URL via Traefik, or **HTTP IP:port** if Traefik is unavailable

### Deploy options

| Method | Command |
|--------|---------|
| One-line install | `curl -fsSL …/scripts/install.sh \| bash` |
| SSH redeploy | `./scripts/deploy.sh` |
| Apply domain after setup | `./scripts/redeploy-domain.sh` |
| Docker Compose only | `docker compose up --build -d` |
| Traefik + domain (CLI) | `DOMAIN=food.yourdomain.com ./scripts/deploy.sh` |
| Generate secrets (Coolify/Git) | `./scripts/generate-secrets.sh` |
| Stop stack | `./scripts/undeploy.sh` |
| Remove everything | `./scripts/undeploy.sh --purge` |

### Coolify / Hostinger Docker (git URL)

1. Paste repo: `https://github.com/pankajkumarrajput1116-glitch/food.git`
2. Use root `docker-compose.yml`
3. Run `./scripts/generate-secrets.sh` and set env vars in the platform UI
4. Deploy → open `/setup`

Details: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

### Stack

| Service | Description | Public access |
|---------|-------------|---------------|
| `web` | Nginx — React SPA + `/api` proxy | Traefik HTTPS **or** host `:8080` |
| `api` | Express REST API | internal `3001` |
| `db` | PostgreSQL 16 | internal `5432` |

```bash
npm run docker:logs     # Follow logs
npm run docker:down     # Stop containers
npm run deploy:install  # Same as install.sh
```

---

## Local Development

### Option A — Frontend only (no database)

Uses **localStorage** for all data. Great for UI work.

```bash
npm install
npm run dev
```

Open http://localhost:5180 — no backend required.

### Option B — Frontend + API + PostgreSQL

```bash
# Terminal 1 — database + API (hot reload)
npm run docker:dev

# Terminal 2 — frontend pointing at API
echo "VITE_API_URL=http://localhost:3001/api" >> .env.local
npm run dev
```

Or run the API directly:

```bash
docker compose -f docker-compose.dev.yml up db -d
cd server && npm install && npm run dev
VITE_API_URL=http://localhost:3001/api npm run dev
```

---

## Project Structure

```
foodexpress/
├── src/                    # React frontend (Vite)
├── server/                 # Express API + PostgreSQL
│   ├── src/routes/         # REST endpoints
│   ├── src/db/             # Schema, migrations, seed
│   └── seed/               # JSON seed data (menu, blogs)
├── scripts/
│   ├── deploy.sh           # Production deploy (recommended)
│   ├── install.sh          # Clone + deploy + print setup URL
│   ├── generate-secrets.sh # Env vars for platform deploys
│   └── undeploy.sh         # Stop / purge stack
├── docker/                 # Nginx config
├── docker-compose.yml      # Production stack
├── docker-compose.traefik.yml
└── docs/DEPLOYMENT.md      # Full deployment guide
```

---

## Environment Variables

Copy `.env.example` to `.env`, or let `./scripts/deploy.sh` generate secrets automatically.

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_PORT` | Public web port | `8080` |
| `POSTGRES_USER` | Database user | `foodexpress` |
| `POSTGRES_PASSWORD` | Database password | *auto-generated* |
| `POSTGRES_DB` | Database name | `foodexpress` |
| `JWT_SECRET` | API auth secret | *auto-generated* |
| `JWT_EXPIRES_IN` | Access token lifetime | `15m` |
| `CORS_ORIGIN` | Allowed browser origin | auto from `DOMAIN` |
| `APP_URL` | Public URL (cookies, emails) | auto from `DOMAIN` |
| `COOKIE_SECURE` | Secure cookies for HTTPS | `false` (HTTP) / `true` (HTTPS) |
| `DOMAIN` | Public hostname | auto: `{TRAEFIK_SUBDOMAIN}.{TRAEFIK_HOST}` |
| `TRAEFIK_HOST` | Hostinger VPS host | auto: `hostname -f` |
| `TRAEFIK_SUBDOMAIN` | Subdomain prefix | default: `foodexpress` |
| `USE_TRAEFIK` | Route via Traefik | `false` / `true` with domain |
| `TRAEFIK_AVAILABLE` | Traefik detected on host | set by deploy script |
| `TRAEFIK_NETWORK` | Traefik Docker network | `traefik` |
| `ENABLE_SETUP_ENV_WRITE` | Setup wizard can update `.env` | `true` |
| `SETUP_TOKEN` | Internal bootstrap secret | *auto-generated* |
| `SEED_DEMO_USERS` | Create demo accounts | `false` in production |
| `ALLOW_REGISTRATION` | Public customer signup | `true` |
| `RAZORPAY_KEY_SECRET` | Payment verification | optional |
| `SMTP_*` / `APP_URL` | Email notifications | optional |
| `VITE_API_URL` | Frontend API base (dev) | empty = localStorage mode |

---

## API Overview

When `VITE_API_URL` is set, the frontend talks to:

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Health check |
| `GET /api/setup/context` | Setup wizard status (Traefik, DB, session) |
| `POST /api/setup/begin` | Start automated setup session |
| `POST /api/setup/complete` | Finish first-run setup |
| `POST /api/auth/login` | Login |
| `POST /api/auth/register` | Signup |
| `GET /api/menu` | Public menu |
| `GET /api/settings` | Store settings |
| `POST /api/orders` | Place order |
| `GET /api/blogs` | Published posts |

Admin routes require a JWT with the `admin` role.

---

## Scripts

```bash
npm run dev              # Vite dev server
npm run build            # Production frontend build
npm run verify           # API tests + production build (CI gate)
npm run lint             # ESLint
npm run deploy           # Production deploy (./scripts/deploy.sh)
npm run deploy:install   # One-line clone + deploy
npm run deploy:secrets   # Print secrets for platform UI
npm run deploy:undeploy  # Stop / purge Docker stack
npm run docker:dev       # Dev DB + API
npm run export:seeds     # Export menu/blog JSON to server/seed/
```

---

## Order Status Flow

```
pending → accepted → preparing → ready → shipped → delivered
```

Takeaway orders skip `shipped`. Admins can **reject** pending orders.

---

## Tech Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS 4, React Router 7, Formik, Yup
- **Backend:** Node.js 22, Express, PostgreSQL, JWT, bcrypt
- **Deploy:** Docker Compose, Nginx, Traefik (optional), multi-stage builds

---

## CI/CD

- **CI** — lint, seed validate, tests, build, Docker smoke (`.github/workflows/ci.yml`)
- **Deploy** — manual workflow; runs `npm run verify` before SSH deploy (`.github/workflows/deploy.yml`)

---

## Security

- Automated setup session (no token paste in browser; rate-limited)
- Server-side order total validation
- Razorpay signature verification
- CSRF protection, rate limiting, Helmet headers
- Strong secrets required in production (auto-generated by deploy)
- Setup token invalidated after first successful setup

---

## Documentation

- **[Deployment Guide](docs/DEPLOYMENT.md)** — Docker, VPS, Traefik SSL, Coolify, Hostinger, troubleshooting

---

## Owner & Contributors

| Role | Name | Contact |
|------|------|---------|
| **Owner** | Pankaj Kumar Rajput | pankajkumarrajput1116@gmail.com |
| **Contributor** | Amit Kumar | — |

- GitHub: [pankajkumarrajput1116-glitch/food](https://github.com/pankajkumarrajput1116-glitch/food)
- Instagram: [@pankaj_rajput_1116](https://www.instagram.com/pankaj_rajput_1116/)
- LinkedIn: [Pankaj Kumar Rajput](https://www.linkedin.com/in/pankaj-kumar-rajput-b2458539b/)

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the official credits list.
