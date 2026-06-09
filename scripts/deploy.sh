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

detect_public_ip() {
  curl -sf --max-time 3 ifconfig.me 2>/dev/null \
    || hostname -I 2>/dev/null | awk '{print $1}' \
    || echo "127.0.0.1"
}

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
FORCE_STANDALONE="${FORCE_STANDALONE:-$(get_env_value FORCE_STANDALONE)}"

if [[ "$FORCE_STANDALONE" == "1" || "$FORCE_STANDALONE" == "true" ]]; then
  log "FORCE_STANDALONE set — skipping Traefik (port mode only)."
else
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -qiE 'traefik'; then
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
fi

if [[ "$TRAEFIK_DETECTED" == true && -z "$TRAEFIK_NETWORK" ]]; then
  TRAEFIK_NETWORK="traefik"
  warn "Traefik detected but no standard network — will try 'traefik'."
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

# ─── Hostinger / Traefik auto-subdomain (like Hermes agent) ───────────────────
TRAEFIK_HOST="${TRAEFIK_HOST:-$(get_env_value TRAEFIK_HOST)}"
if [[ -z "$TRAEFIK_HOST" && "$TRAEFIK_DETECTED" == true ]]; then
  HOST_FQDN="$(hostname -f 2>/dev/null || true)"
  if [[ -n "$HOST_FQDN" && "$HOST_FQDN" == *.* ]]; then
    TRAEFIK_HOST="$HOST_FQDN"
    set_env_value TRAEFIK_HOST "$TRAEFIK_HOST"
    log "Detected TRAEFIK_HOST=${TRAEFIK_HOST}"
  fi
fi

DOMAIN="${DOMAIN:-$(get_env_value DOMAIN)}"
if [[ -z "$DOMAIN" && "$TRAEFIK_DETECTED" == true && -n "$TRAEFIK_HOST" ]]; then
  TRAEFIK_SUBDOMAIN="$(get_env_value TRAEFIK_SUBDOMAIN)"
  if [[ -z "$TRAEFIK_SUBDOMAIN" ]]; then
    TRAEFIK_SUBDOMAIN="${COMPOSE_PROJECT_NAME:-$(basename "$ROOT")}"
    set_env_value TRAEFIK_SUBDOMAIN "$TRAEFIK_SUBDOMAIN"
  fi
  DOMAIN="${TRAEFIK_SUBDOMAIN}.${TRAEFIK_HOST}"
  set_env_value DOMAIN "$DOMAIN"
  ok "Auto Traefik subdomain: https://${DOMAIN}"
fi

if [[ -n "$DOMAIN" ]]; then
  set_env_value DOMAIN "$DOMAIN"
  if [[ "$TRAEFIK_DETECTED" == true ]]; then
    set_env_value CORS_ORIGIN "https://${DOMAIN}"
    set_env_value USE_TRAEFIK "true"
  else
    # Custom domain without Traefik — still expose host port
    set_env_value USE_TRAEFIK "false"
    set_env_value CORS_ORIGIN "http://${DOMAIN}:$(get_env_value APP_PORT)"
  fi

  # Dual Host() rule during custom domain migration (setup wizard keeps legacy .hstgr.cloud)
  TRAEFIK_LEGACY_DOMAIN="$(get_env_value TRAEFIK_LEGACY_DOMAIN)"
  if [[ -n "$TRAEFIK_LEGACY_DOMAIN" && "$TRAEFIK_LEGACY_DOMAIN" != "$DOMAIN" ]]; then
    TRAEFIK_HOST_RULE="Host(\`${DOMAIN}\`) || Host(\`${TRAEFIK_LEGACY_DOMAIN}\`)"
    ok "Traefik dual-host: ${DOMAIN} + legacy ${TRAEFIK_LEGACY_DOMAIN}"
  else
    TRAEFIK_HOST_RULE="Host(\`${DOMAIN}\`)"
  fi
  set_env_value TRAEFIK_HOST_RULE "$TRAEFIK_HOST_RULE"
else
  set_env_value USE_TRAEFIK "false"
  PUBLIC_IP="$(detect_public_ip)"
  APP_PORT_VAL="$(get_env_value APP_PORT)"
  set_env_value CORS_ORIGIN "http://${PUBLIC_IP}:${APP_PORT_VAL}"
  set_env_value APP_URL "http://${PUBLIC_IP}:${APP_PORT_VAL}"
  set_env_value COOKIE_SECURE "false"
  if [[ "$TRAEFIK_DETECTED" != true ]]; then
    log "Traefik not installed — using http://${PUBLIC_IP}:${APP_PORT_VAL}"
  fi
fi

[[ -z "$(get_env_value TRAEFIK_NETWORK)" && -n "$TRAEFIK_NETWORK" ]] && set_env_value TRAEFIK_NETWORK "$TRAEFIK_NETWORK"
[[ -z "$(get_env_value TRAEFIK_CERT_RESOLVER)" ]] && set_env_value TRAEFIK_CERT_RESOLVER "$TRAEFIK_CERT_RESOLVER"

USE_TRAEFIK_VAL="$(get_env_value USE_TRAEFIK)"

# Never use Traefik routing unless Traefik is actually present
if [[ "$USE_TRAEFIK_VAL" == "true" && "$TRAEFIK_DETECTED" != true ]]; then
  warn "USE_TRAEFIK was true but Traefik is not available — forcing standalone port mode."
  USE_TRAEFIK_VAL="false"
  set_env_value USE_TRAEFIK "false"
fi

# Cookie / URL settings for HTTP vs HTTPS
if [[ -n "$DOMAIN" && "$USE_TRAEFIK_VAL" == "true" && "$TRAEFIK_DETECTED" == true ]]; then
  set_env_value APP_URL "https://${DOMAIN}"
  set_env_value COOKIE_SECURE "true"
elif [[ "$USE_TRAEFIK_VAL" != "true" ]]; then
  PUBLIC_IP="$(detect_public_ip)"
  APP_PORT_VAL="$(get_env_value APP_PORT)"
  if [[ -z "$(get_env_value APP_URL)" || "$(get_env_value APP_URL)" == https://* ]]; then
    set_env_value APP_URL "http://${PUBLIC_IP}:${APP_PORT_VAL}"
  fi
  set_env_value COOKIE_SECURE "false"
fi

# ─── Traefik external network (Compose manages foodexpress_net) ────────────────
if [[ "$TRAEFIK_DETECTED" == true && -n "$TRAEFIK_NETWORK" ]]; then
  if ! docker network inspect "$TRAEFIK_NETWORK" >/dev/null 2>&1; then
    log "Creating Traefik network: ${TRAEFIK_NETWORK}"
    docker network create "$TRAEFIK_NETWORK" 2>/dev/null || true
  fi
fi

# Final check: only use Traefik routing if network is reachable
if [[ "$USE_TRAEFIK_VAL" == "true" && "$TRAEFIK_DETECTED" == true ]]; then
  if ! docker network inspect "${TRAEFIK_NETWORK:-traefik}" >/dev/null 2>&1; then
    warn "Traefik network unavailable — falling back to http://$(detect_public_ip):$(get_env_value APP_PORT)"
    USE_TRAEFIK_VAL="false"
    set_env_value USE_TRAEFIK "false"
    PUBLIC_IP="$(detect_public_ip)"
    APP_PORT_VAL="$(get_env_value APP_PORT)"
    set_env_value CORS_ORIGIN "http://${PUBLIC_IP}:${APP_PORT_VAL}"
    set_env_value APP_URL "http://${PUBLIC_IP}:${APP_PORT_VAL}"
    set_env_value COOKIE_SECURE "false"
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
  ok "Traefik SSL mode — https://${DOMAIN} (port $(get_env_value APP_PORT) not exposed publicly)"
else
  rm -f docker-compose.override.generated.yml
  if [[ "$TRAEFIK_DETECTED" == true && -z "$DOMAIN" ]]; then
    warn "Traefik detected but DOMAIN could not be set. Using port $(get_env_value APP_PORT) — set TRAEFIK_HOST or DOMAIN in .env for HTTPS."
  elif [[ "$TRAEFIK_DETECTED" != true ]]; then
    ok "Standalone mode — Traefik not installed, app on http://$(detect_public_ip):$(get_env_value APP_PORT)"
  else
    log "Standalone mode — app on port $(get_env_value APP_PORT)"
  fi
fi

# ─── Build & start ───────────────────────────────────────────────────────────
log "Building and starting services..."
docker compose "${COMPOSE_FILES[@]}" up --build -d

log "Waiting for API health..."
for i in $(seq 1 30); do
  HEALTH_OK=false
  if [[ "$USE_TRAEFIK_VAL" == "true" && -n "$DOMAIN" ]]; then
    if docker compose "${COMPOSE_FILES[@]}" exec -T api node -e \
      "fetch('http://127.0.0.1:3001/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" \
      >/dev/null 2>&1; then
      HEALTH_OK=true
    fi
  else
    PORT="$(get_env_value APP_PORT)"
    if curl -sf "http://localhost:${PORT}/api/health" >/dev/null 2>&1; then
      HEALTH_OK=true
    fi
  fi
  if [[ "$HEALTH_OK" == true ]]; then
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
  echo -e "  Setup:    ${GREEN}https://${DOMAIN}/setup${NC}"
  echo -e "  Routing:  Traefik (HTTPS) — no public port $(get_env_value APP_PORT) binding"
else
  PUBLIC_IP="$(curl -sf --max-time 3 ifconfig.me 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo localhost)"
  echo -e "  URL:      ${GREEN}http://${PUBLIC_IP}:$(get_env_value APP_PORT)${NC}"
  echo -e "  Setup:    ${GREEN}http://${PUBLIC_IP}:$(get_env_value APP_PORT)/setup${NC}"
  echo -e "  Routing:  Direct port $(get_env_value APP_PORT) (Traefik not installed or disabled)"
fi

echo -e "  Network:  foodexpress_net (managed by Docker Compose)"
docker compose "${COMPOSE_FILES[@]}" ps

if [[ "$USE_TRAEFIK_VAL" == "true" && -n "$DOMAIN" ]]; then
  echo ""
  ok "Traefik mode: same pattern as Hostinger Hermes — Host(\`${DOMAIN}\`) with Let's Encrypt."
fi

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
