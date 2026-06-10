#!/usr/bin/env bash
# Fast local dev: only Postgres runs in Docker.
# API (node --watch) and frontend (Vite) run natively for instant hot reload.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

log() { echo -e "${CYAN}[dev-local]${NC} $*"; }
ok()  { echo -e "${GREEN}[dev-local]${NC} $*"; }

command -v docker >/dev/null || { echo "Docker is not installed."; exit 1; }

log "Starting Postgres (Docker, db only)..."
docker compose -f docker-compose.dev.yml -p foodie-dev up -d db

if [[ ! -f server/.env ]]; then
  log "Creating server/.env from server/.env.example"
  cp server/.env.example server/.env
fi

if [[ ! -d server/node_modules ]]; then
  log "Installing API dependencies..."
  npm --prefix server install
fi
if [[ ! -d node_modules ]]; then
  log "Installing frontend dependencies..."
  npm install
fi

log "Starting API (node --watch)..."
npm --prefix server run dev &
API_PID=$!
trap 'kill "$API_PID" 2>/dev/null || true' EXIT

for i in $(seq 1 30); do
  if curl -sf http://localhost:3001/api/health >/dev/null 2>&1; then
    ok "API ready on http://localhost:3001 (hot reload)"
    break
  fi
  if [[ $i -eq 30 ]]; then
    echo "API did not become ready. Check output above."
    exit 1
  fi
  sleep 1
done

ok "Demo accounts: admin@foodexpress.com / Admin@12345"
ok "              customer@foodexpress.com / Customer@123"
ok "Reseed demo orders/promos/inbox anytime: npm run seed:demo"
log "Open http://localhost:5180 — Ctrl+C stops API + frontend (Postgres keeps running)"
echo ""
npm run dev
