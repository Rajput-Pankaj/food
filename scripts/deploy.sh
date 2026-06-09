#!/usr/bin/env bash
# FoodExpress — one-command production deploy (git pull + auto .env + Docker)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[deploy]${NC} $*"; }
ok()   { echo -e "${GREEN}[deploy]${NC} $*"; }
warn() { echo -e "${YELLOW}[deploy]${NC} $*"; }
fail() { echo -e "${RED}[deploy]${NC} $*" >&2; exit 1; }

random_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 48 | tr -d '/+=' | head -c 48
  else
    head -c 48 /dev/urandom | base64 | tr -d '/+=' | head -c 48
  fi
}

get_env_value() {
  local key="$1"
  if [[ -f .env ]]; then
    grep -E "^${key}=" .env 2>/dev/null | head -1 | cut -d= -f2- || true
  fi
}

set_env_value() {
  local key="$1"
  local value="$2"
  if grep -qE "^${key}=" .env 2>/dev/null; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|^${key}=.*|${key}=${value}|" .env
    else
      sed -i "s|^${key}=.*|${key}=${value}|" .env
    fi
  else
    echo "${key}=${value}" >> .env
  fi
}

# ─── System checks ───────────────────────────────────────────────────────────
log "Checking system requirements..."

command -v docker >/dev/null 2>&1 || fail "Docker is not installed. Install Docker Engine 24+ first."
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required."

DOCKER_VERSION="$(docker version --format '{{.Server.Version}}' 2>/dev/null || echo unknown)"
log "Docker ${DOCKER_VERSION}"

TOTAL_MEM_MB="$(free -m 2>/dev/null | awk '/^Mem:/{print $2}' || sysctl -n hw.memsize 2>/dev/null | awk '{print int($1/1024/1024)}' || echo 0)"
if [[ "${TOTAL_MEM_MB}" -gt 0 && "${TOTAL_MEM_MB}" -lt 1800 ]]; then
  warn "Low memory detected (${TOTAL_MEM_MB}MB). Recommend 2GB+ for production."
fi

DISK_FREE_GB="$(df -BG . 2>/dev/null | awk 'NR==2{gsub(/G/,"",$4); print $4}' || echo 0)"
if [[ "${DISK_FREE_GB}" -gt 0 && "${DISK_FREE_GB}" -lt 5 ]]; then
  warn "Low disk space (${DISK_FREE_GB}GB free). Recommend 5GB+."
fi

# ─── Traefik detection ───────────────────────────────────────────────────────
TRAEFIK_DETECTED=false
TRAEFIK_NETWORK=""
TRAEFIK_CERT_RESOLVER="letsencrypt"

if docker ps --format '{{.Names}}' 2>/dev/null | grep -qiE '^traefik$|traefik'; then
  TRAEFIK_DETECTED=true
  log "Traefik container detected."
fi

for net in traefik proxy web; do
  if docker network inspect "$net" >/dev/null 2>&1; then
    TRAEFIK_NETWORK="$net"
    TRAEFIK_DETECTED=true
    log "Traefik network found: ${net}"
    break
  fi
done

if [[ "$TRAEFIK_DETECTED" == true && -z "$TRAEFIK_NETWORK" ]]; then
  TRAEFIK_NETWORK="traefik"
  warn "Traefik detected but no standard network — will try to create/use 'traefik'."
fi

# ─── Git pull (optional) ─────────────────────────────────────────────────────
if [[ "${SKIP_GIT_PULL:-}" != "1" ]] && git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  if git -C "$ROOT" diff --quiet && git -C "$ROOT" diff --cached --quiet; then
    log "Pulling latest from git..."
    git -C "$ROOT" pull --ff-only || warn "Git pull failed — continuing with current code."
  else
    warn "Local changes detected — skipping git pull."
  fi
fi

# ─── Generate / update .env ──────────────────────────────────────────────────
ENV_CREATED=false
if [[ ! -f .env ]]; then
  log "Creating .env with auto-generated secrets..."
  cp .env.example .env
  ENV_CREATED=true
fi

WEAK_PASSWORDS="foodexpress|change-me-strong-password|change-me-to-a-long-random-secret|change-this-secret-in-production|dev-secret-change-me"

current_pg_pass="$(get_env_value POSTGRES_PASSWORD)"
current_jwt="$(get_env_value JWT_SECRET)"

if [[ -z "$current_pg_pass" ]] || echo "$current_pg_pass" | grep -qiE "^(${WEAK_PASSWORDS})$"; then
  new_pass="$(random_secret)"
  set_env_value POSTGRES_PASSWORD "$new_pass"
  log "Generated POSTGRES_PASSWORD"
fi

if [[ -z "$current_jwt" ]] || echo "$current_jwt" | grep -qiE "^(${WEAK_PASSWORDS})$" || [[ ${#current_jwt} -lt 32 ]]; then
  new_jwt="$(random_secret)"
  set_env_value JWT_SECRET "$new_jwt"
  log "Generated JWT_SECRET"
fi

current_setup="$(get_env_value SETUP_TOKEN)"
SETUP_TOKEN_GENERATED=false
if [[ -z "$current_setup" ]]; then
  new_setup="$(random_secret)"
  set_env_value SETUP_TOKEN "$new_setup"
  SETUP_TOKEN_GENERATED=true
  log "Generated SETUP_TOKEN — use this in the setup wizard (shown once below)"
fi

[[ -z "$(get_env_value POSTGRES_USER)" ]] && set_env_value POSTGRES_USER "foodexpress"
[[ -z "$(get_env_value POSTGRES_DB)" ]] && set_env_value POSTGRES_DB "foodexpress"
[[ -z "$(get_env_value APP_PORT)" ]] && set_env_value APP_PORT "8080"
[[ -z "$(get_env_value JWT_EXPIRES_IN)" ]] && set_env_value JWT_EXPIRES_IN "7d"
[[ -z "$(get_env_value NODE_ENV)" ]] && set_env_value NODE_ENV "production"
[[ -z "$(get_env_value SEED_DEMO_USERS)" ]] && set_env_value SEED_DEMO_USERS "false"
[[ -z "$(get_env_value ENABLE_SETUP_ENV_WRITE)" ]] && set_env_value ENABLE_SETUP_ENV_WRITE "true"

if [[ "$TRAEFIK_DETECTED" == true ]]; then
  set_env_value TRAEFIK_AVAILABLE "true"
else
  set_env_value TRAEFIK_AVAILABLE "false"
fi

DOMAIN="${DOMAIN:-$(get_env_value DOMAIN)}"
if [[ -n "$DOMAIN" ]]; then
  set_env_value DOMAIN "$DOMAIN"
  if [[ "$TRAEFIK_DETECTED" == true ]]; then
    set_env_value CORS_ORIGIN "https://${DOMAIN}"
    set_env_value USE_TRAEFIK "true"
  else
    set_env_value CORS_ORIGIN "http://${DOMAIN}:$(get_env_value APP_PORT)"
  fi
else
  [[ -z "$(get_env_value CORS_ORIGIN)" ]] && set_env_value CORS_ORIGIN "http://localhost:$(get_env_value APP_PORT)"
  set_env_value USE_TRAEFIK "false"
fi

[[ -z "$(get_env_value TRAEFIK_NETWORK)" && -n "$TRAEFIK_NETWORK" ]] && set_env_value TRAEFIK_NETWORK "$TRAEFIK_NETWORK"
[[ -z "$(get_env_value TRAEFIK_CERT_RESOLVER)" ]] && set_env_value TRAEFIK_CERT_RESOLVER "$TRAEFIK_CERT_RESOLVER"

USE_TRAEFIK_VAL="$(get_env_value USE_TRAEFIK)"

# Cookie / URL settings for HTTP vs HTTPS
if [[ -n "$DOMAIN" && "$USE_TRAEFIK_VAL" == "true" ]]; then
  set_env_value APP_URL "https://${DOMAIN}"
  set_env_value COOKIE_SECURE "true"
else
  [[ -z "$(get_env_value APP_URL)" ]] && set_env_value APP_URL "http://localhost:$(get_env_value APP_PORT)"
  [[ -z "$(get_env_value COOKIE_SECURE)" ]] && set_env_value COOKIE_SECURE "false"
fi

# ─── Traefik external network (Compose manages foodexpress_net) ────────────────
if [[ "$TRAEFIK_DETECTED" == true && -n "$TRAEFIK_NETWORK" ]]; then
  if ! docker network inspect "$TRAEFIK_NETWORK" >/dev/null 2>&1; then
    log "Creating Traefik network: ${TRAEFIK_NETWORK}"
    docker network create "$TRAEFIK_NETWORK"
  fi
fi

# ─── Compose files ───────────────────────────────────────────────────────────
COMPOSE_FILES=(-f docker-compose.yml)

if [[ "$USE_TRAEFIK_VAL" == "true" && -n "$DOMAIN" ]]; then
  COMPOSE_FILES+=(-f docker-compose.traefik.yml)
  cat > docker-compose.override.generated.yml <<'YAML'
services:
  web:
    ports: !reset []
YAML
  COMPOSE_FILES+=(-f docker-compose.override.generated.yml)
  ok "Traefik SSL mode enabled for https://${DOMAIN}"
else
  rm -f docker-compose.override.generated.yml
  if [[ "$TRAEFIK_DETECTED" == true && -z "$DOMAIN" ]]; then
    warn "Traefik detected but DOMAIN is not set. Set DOMAIN=your.domain.com in .env for HTTPS."
  fi
  log "Standalone mode — app on port $(get_env_value APP_PORT)"
fi

# ─── Build & start ───────────────────────────────────────────────────────────
log "Building and starting services..."
docker compose "${COMPOSE_FILES[@]}" up --build -d

log "Waiting for API health..."
for i in $(seq 1 30); do
  PORT="$(get_env_value APP_PORT)"
  if curl -sf "http://localhost:${PORT}/api/health" >/dev/null 2>&1; then
    ok "API is healthy."
    break
  fi
  if [[ "$i" -eq 30 ]]; then
    warn "Health check timed out — check logs: docker compose logs api"
  fi
  sleep 2
done

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
ok "═══════════════════════════════════════════════════════════"
ok " FoodExpress deployed successfully!"
ok "═══════════════════════════════════════════════════════════"

if [[ "$USE_TRAEFIK_VAL" == "true" && -n "$DOMAIN" ]]; then
  echo -e "  URL:      ${GREEN}https://${DOMAIN}${NC}"
else
  PUBLIC_IP="$(curl -sf --max-time 3 ifconfig.me 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo localhost)"
  echo -e "  URL:      ${GREEN}http://${PUBLIC_IP}:$(get_env_value APP_PORT)${NC}"
fi

echo -e "  Setup:    ${GREEN}Open /setup in your browser — no manual token needed${NC}"

echo "  Network:  foodexpress_net (managed by Docker Compose)"
docker compose "${COMPOSE_FILES[@]}" ps

if [[ "$SETUP_TOKEN_GENERATED" == true ]]; then
  echo ""
  warn "SETUP_TOKEN was generated in .env (used internally — you do not need to paste it in the browser)."
fi

if [[ "$ENV_CREATED" == true ]]; then
  echo ""
  warn "New .env created with random secrets. Back up .env securely — it is gitignored."
fi

echo ""
log "Commands:"
echo "  docker compose ${COMPOSE_FILES[*]} logs -f"
echo "  docker compose ${COMPOSE_FILES[*]} down"
echo "  ./scripts/deploy.sh          # redeploy after git pull"
