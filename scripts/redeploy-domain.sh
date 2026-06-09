#!/usr/bin/env bash
# Re-apply Traefik/domain after setup wizard changes DOMAIN in .env (no git pull).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export SKIP_GIT_PULL=1
exec ./scripts/deploy.sh "$@"
