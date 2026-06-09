# FoodExpress Deployment Guide

This guide covers every way to deploy FoodExpress: **Docker Compose** (recommended), **VPS manual setup**, and **cloud platforms**.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker Compose (Production)](#docker-compose-production)
3. [VPS Deployment](#vps-deployment)
4. [Manual Setup (No Docker)](#manual-setup-no-docker)
5. [Cloud Platforms](#cloud-platforms)
6. [Environment Reference](#environment-reference)
7. [Post-Deploy Checklist](#post-deploy-checklist)
8. [Troubleshooting](#troubleshooting)
9. [Updating & Backups](#updating--backups)

---

## Prerequisites

- **Docker:** Docker Engine 24+ and Docker Compose v2
- **Manual:** Node.js 22+, PostgreSQL 16+, Nginx (optional)
- **Ports:** 8080 (web) or 80/443 behind a reverse proxy

---

## One-Command Auto Deploy (Recommended)

After cloning on a VPS with Docker:

```bash
git clone <your-repo-url> foodexpress
cd foodexpress
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

The script will:

1. **Check system** — Docker version, available RAM/disk
2. **Detect Traefik** — if a Traefik container/network exists, enables HTTPS mode when `DOMAIN` is set
3. **Generate `.env`** — strong random `POSTGRES_PASSWORD`, `JWT_SECRET`, DB user/db name
4. **Create network** — `foodexpress_net` (all services connected)
5. **Build & start** — `db` → `api` → `web` with health checks
6. **Migrate & seed** — schema, 50 menu items, blogs, optional demo users

### Traefik SSL

If Traefik is already running on the server:

```bash
DOMAIN=food.yourdomain.com ./scripts/deploy.sh
```

Required Traefik setup on the server:

- External network named `traefik` (or set `TRAEFIK_NETWORK` in `.env`)
- Entrypoints: `web` (80) and `websecure` (443)
- Certificate resolver named `letsencrypt` (or set `TRAEFIK_CERT_RESOLVER`)

### Git-based redeploy

On the server after `git pull`:

```bash
./scripts/deploy.sh
```

Or use GitHub Actions: **Actions → Deploy → Run workflow** (configure `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH` secrets).

### Post-receive hook (optional)

```bash
# On server: ~/foodexpress.git/hooks/post-receive
#!/bin/sh
cd ~/foodexpress && git pull --ff-only && ./scripts/deploy.sh
```

---

## Docker Compose (Manual)

### Step 1 — Clone and configure

```bash
git clone <your-repo-url> foodexpress
cd foodexpress
cp .env.example .env
```

Edit `.env` and set strong values, or run `./scripts/deploy.sh` to auto-generate.

### Step 2 — Build and start

```bash
docker compose up --build -d
```

Or:

```bash
npm run deploy
```

### Step 3 — Verify

```bash
# Check containers
docker compose ps

# API health (via nginx proxy)
curl http://localhost:8080/api/health

# View logs
docker compose logs -f api
```

### Step 4 — Access the app

Open `http://localhost:8080` (or your configured `APP_PORT`).

Log in with demo accounts:

- Admin: `admin@foodexpress.com` / `Admin@12345`
- Customer: `customer@foodexpress.com` / `Customer@123`

### Architecture

```
Browser → Nginx (web:80) → /api/* → Express (api:3001) → PostgreSQL (db:5432)
                         → /*     → React static files (dist/)
```

Data persists in the Docker volume `postgres_data`.

### Stop / restart

```bash
docker compose down          # stop containers (keeps DB volume)
docker compose down -v       # stop + delete database volume
docker compose restart api   # restart API only
```

---

## VPS Deployment

Deploy on Ubuntu/Debian VPS with Docker (easiest) or without Docker.

### Option A — Docker on VPS (recommended)

1. Install Docker on the VPS:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

2. Clone the project and configure `.env`:

```env
APP_PORT=80
POSTGRES_PASSWORD=<strong-password>
JWT_SECRET=<strong-secret>
CORS_ORIGIN=https://yourdomain.com
```

3. Start the stack:

```bash
docker compose up --build -d
```

4. **HTTPS with Caddy** (simple reverse proxy):

```bash
# /etc/caddy/Caddyfile
yourdomain.com {
    reverse_proxy localhost:8080
}
```

Or use **Nginx + Certbot** in front of port 8080.

### Option B — Manual VPS (no Docker)

#### 1. Install dependencies

```bash
sudo apt update
sudo apt install -y nodejs npm postgresql nginx
# Or use Node 22 via nvm
```

#### 2. PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE USER foodexpress WITH PASSWORD 'your-password';
CREATE DATABASE foodexpress OWNER foodexpress;
\q
```

#### 3. API

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=3001
DATABASE_URL=postgres://foodexpress:your-password@localhost:5432/foodexpress
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

```bash
npm start
```

Use **PM2** to keep the API running:

```bash
npm install -g pm2
pm2 start src/index.js --name foodexpress-api
pm2 save
pm2 startup
```

#### 4. Frontend build

```bash
cd ..   # project root
npm install
VITE_API_URL=/api npm run build
```

Copy `dist/` to `/var/www/foodexpress`.

#### 5. Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/foodexpress;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Manual Setup (No Docker)

For local or custom environments:

| Component | Command |
|-----------|---------|
| PostgreSQL | Run locally or use `docker compose -f docker-compose.dev.yml up db -d` |
| API | `cd server && npm install && npm run dev` |
| Frontend | `VITE_API_URL=http://localhost:3001/api npm run dev` |

The API auto-migrates and seeds on startup.

---

## Cloud Platforms

### Railway / Render / Fly.io

General pattern:

1. Deploy **PostgreSQL** add-on → copy `DATABASE_URL`
2. Deploy **API** from `server/` directory:
   - Build: `npm install`
   - Start: `npm start`
   - Env: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`
3. Deploy **frontend** as static site:
   - Build: `npm run build` with `VITE_API_URL=https://your-api.example.com/api`
   - Or use Docker `web` image with nginx proxy

### Managed Postgres SSL

If your provider requires SSL, set in API environment:

```env
DATABASE_SSL=true
```

(Update `server/src/db.js` if SSL option is not yet wired — check your provider docs.)

### Docker on any cloud VM

Same as [VPS Docker](#option-a--docker-on-vps-recommended). Works on AWS EC2, DigitalOcean Droplet, Hetzner, Linode, etc.

---

## Environment Reference

### Root `.env` (Docker Compose)

| Variable | Required | Description |
|----------|----------|-------------|
| `APP_PORT` | No | Host port for web container (default `8080`) |
| `POSTGRES_USER` | No | DB user (default `foodexpress`) |
| `POSTGRES_PASSWORD` | **Yes** | DB password — change in production |
| `POSTGRES_DB` | No | DB name (default `foodexpress`) |
| `JWT_SECRET` | **Yes** | Signing key for auth tokens |
| `JWT_EXPIRES_IN` | No | Token TTL (default `7d`) |
| `CORS_ORIGIN` | No | Frontend origin for CORS |
| `VITE_API_URL` | No | Only for local Vite builds; Docker sets `/api` |

### Server `.env` (manual API)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port (default `3001`) |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string |
| `JWT_SECRET` | **Yes** | Must match Docker/production secret |
| `CORS_ORIGIN` | No | Frontend URL |
| `NODE_ENV` | No | `production` in prod |

### Frontend modes

| `VITE_API_URL` | Behavior |
|----------------|----------|
| *(empty)* | localStorage-only demo mode |
| `http://localhost:3001/api` | Local dev with API |
| `/api` | Production (nginx proxies to API) |

---

## Post-Deploy Checklist

- [ ] Changed `POSTGRES_PASSWORD` and `JWT_SECRET` from defaults
- [ ] Set `CORS_ORIGIN` to your real domain
- [ ] HTTPS enabled on production domain
- [ ] Logged in as admin and configured **Store Settings** (UPI VPA, Razorpay key)
- [ ] Placed a test order and verified admin accept/reject flow
- [ ] Confirmed `/api/health` returns `{"status":"ok"}`
- [ ] Database volume backed up (see below)

---

## Troubleshooting

### Containers won't start

```bash
docker compose logs db
docker compose logs api
docker compose logs web
```

Common issues:

- **DB not ready:** API waits for Postgres healthcheck; retry after 30s
- **Port in use:** Change `APP_PORT` in `.env`
- **Build fails:** Ensure `npm ci` works in root (package-lock.json present)

### API returns 401 on login

- Check demo users were seeded: `docker compose logs api | grep seed`
- Verify `JWT_SECRET` is consistent across restarts

### Frontend shows empty menu / orders

- Confirm `VITE_API_URL=/api` was set at **build time** (Dockerfile ARG handles this)
- Check browser Network tab — `/api/menu` should return JSON

### CORS errors

Set `CORS_ORIGIN` to exact frontend URL (including port), e.g. `http://localhost:8080`

### Reset all demo data

Log in as admin → **Menu** → **Seed All Demo Data**

Or via API:

```bash
curl -X POST http://localhost:8080/api/admin/seed \
  -H "Authorization: Bearer <admin-jwt-token>"
```

---

## Updating & Backups

### Update application

```bash
git pull
docker compose up --build -d
```

### Backup PostgreSQL

```bash
docker compose exec db pg_dump -U foodexpress foodexpress > backup.sql
```

### Restore

```bash
cat backup.sql | docker compose exec -T db psql -U foodexpress foodexpress
```

### Regenerate server seed files

After editing `src/data/menuSeed.js` or blog seed:

```bash
npm run export:seeds
```

This writes JSON to `server/seed/` for the API bootstrap.

---

## Development Docker Stack

For API hot-reload + Postgres only (frontend via Vite):

```bash
npm run docker:dev
# In another terminal:
VITE_API_URL=http://localhost:3001/api npm run dev
```

Exposes Postgres on `localhost:5432` and API on `localhost:3001`.

---

## Security Notes

- Never commit `.env` with real secrets
- Use strong `JWT_SECRET` (32+ random characters)
- Razorpay payments use client-side checkout — verify payments server-side for real production
- Change demo account passwords if exposing a public instance
- Put the stack behind HTTPS in production

---

## Support

For issues, check container logs first, then open a GitHub issue with:

- `docker compose ps` output
- Relevant log snippets
- Steps to reproduce
