#!/usr/bin/env bash
# FoodExpress — one-line install: clone + deploy + print setup URL
set -euo pipefail

REPO="${FOODEXPRESS_REPO:-https://github.com/pankajkumarrajput1116-glitch/food.git}"
INSTALL_DIR="${FOODEXPRESS_DIR:-$HOME/foodexpress}"

echo "[install] Cloning FoodExpress..."
if [[ -d "$INSTALL_DIR/.git" ]]; then
  echo "[install] Directory exists — pulling latest..."
  git -C "$INSTALL_DIR" pull --ff-only
else
  git clone "$REPO" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"
chmod +x scripts/*.sh 2>/dev/null || true

echo "[install] Running deploy..."
./scripts/deploy.sh

PORT="$(grep -E '^APP_PORT=' .env 2>/dev/null | head -1 | cut -d= -f2- || echo 8080)"
PUBLIC_IP="$(curl -sf --max-time 5 ifconfig.me 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo 'YOUR_SERVER_IP')"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo " Next: open setup in your browser (no token paste needed)"
echo "   http://${PUBLIC_IP}:${PORT}/setup"
echo "═══════════════════════════════════════════════════════════"
