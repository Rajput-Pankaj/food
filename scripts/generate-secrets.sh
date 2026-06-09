#!/usr/bin/env bash
# Generate production secrets for manual / platform deploy (Coolify, Hostinger, etc.)
set -euo pipefail

random_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 48 | tr -d '/+=' | head -c 48
  else
    head -c 48 /dev/urandom | base64 | tr -d '/+=' | head -c 48
  fi
}

echo "# Paste these into your platform environment variables:"
echo ""
echo "POSTGRES_PASSWORD=$(random_secret)"
echo "JWT_SECRET=$(random_secret)"
echo "SETUP_TOKEN=$(random_secret)"
echo ""
echo "# Also set:"
echo "NODE_ENV=production"
echo "SEED_DEMO_USERS=false"
echo "COOKIE_SECURE=false   # use true when serving over HTTPS"
echo "CORS_ORIGIN=http://YOUR_DOMAIN_OR_IP:8080"
echo "APP_URL=http://YOUR_DOMAIN_OR_IP:8080"
