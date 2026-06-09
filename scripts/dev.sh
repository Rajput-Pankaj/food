#!/usr/bin/env bash
# Start FoodExpress local dev: Docker (Postgres + API) + Vite frontend
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

log() { echo -e "${CYAN}[dev]${NC} $*"; }
ok()  { echo -e "${GREEN}[dev]${NC} $*"; }

command -v docker >/dev/null || { echo "Docker is not installed."; exit 1; }
docker compose version >/dev/null || { echo "Docker Compose v2 required."; exit 1; }

log "Starting Postgres + API (Docker)..."
docker compose -f docker-compose.dev.yml up -d --build 2>/dev/null || docker compose -f docker-compose.dev.yml up -d

log "Waiting for API health..."
for i in $(seq 1 60); do
  if curl -sf http://localhost:3001/api/health >/dev/null 2>&1; then
    ok "API is ready on http://localhost:3001"
    break
  fi
  if [[ $i -eq 60 ]]; then
    echo "API did not become ready. Check: docker compose -f docker-compose.dev.yml logs api"
    exit 1
  fi
  sleep 2
done

SETUP=$(curl -sf http://localhost:3001/api/setup/status 2>/dev/null || echo '{}')
if echo "$SETUP" | grep -q '"needsSetup":true'; then
  log "First-time setup required — open http://localhost:5180/setup after frontend starts"
else
  ok "Demo accounts: admin@foodexpress.com / Admin@12345"
  ok "           customer@foodexpress.com / Customer@123"
fi

log "Open http://localhost:5180 in your browser"
log "Press Ctrl+C to stop the frontend (Docker keeps running)."
echo ""
npm run dev
