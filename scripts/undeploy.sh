#!/usr/bin/env bash
# Stop FoodExpress and optionally remove volumes/images
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PURGE=false
if [[ "${1:-}" == "--purge" ]]; then
  PURGE=true
fi

COMPOSE_FILES=(-f docker-compose.yml)
if [[ -f docker-compose.override.generated.yml ]]; then
  COMPOSE_FILES+=(-f docker-compose.override.generated.yml)
fi
if [[ -f .env ]] && grep -qE '^USE_TRAEFIK=true' .env 2>/dev/null; then
  COMPOSE_FILES+=(-f docker-compose.traefik.yml)
fi

echo "[undeploy] Stopping FoodExpress containers..."
if [[ "$PURGE" == true ]]; then
  docker compose "${COMPOSE_FILES[@]}" down -v --remove-orphans
  docker rmi foodexpress-web foodexpress-api 2>/dev/null || true
  rm -f docker-compose.override.generated.yml
  echo "[undeploy] Removed containers, volumes, and images."
else
  docker compose "${COMPOSE_FILES[@]}" down --remove-orphans
  echo "[undeploy] Stopped containers (database volume kept). Use --purge to delete all data."
fi
