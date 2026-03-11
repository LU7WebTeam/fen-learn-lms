#!/bin/bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PHP_BIN="${PHP_BIN:-/opt/cpanel/ea-php83/root/usr/bin/php}"

cd "$APP_DIR"

echo "[deploy] App dir: $APP_DIR"
echo "[deploy] PHP bin: $PHP_BIN"

if [ ! -x "$PHP_BIN" ]; then
  echo "[deploy] ERROR: PHP binary not found or not executable: $PHP_BIN"
  exit 1
fi

# Pull latest code from GitHub main branch.
echo "[deploy] Pulling latest code..."
git pull --ff-only origin main

# Keep required runtime directories present (FTP/git deployments can miss empty dirs).
echo "[deploy] Ensuring writable runtime directories..."
mkdir -p storage/framework/{views,cache,sessions} storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache || true

# Install/update PHP dependencies if Composer is available.
if command -v composer >/dev/null 2>&1; then
  echo "[deploy] Installing Composer dependencies..."
  "$PHP_BIN" "$(command -v composer)" install --no-dev --optimize-autoloader --no-interaction
elif [ -f "composer.phar" ]; then
  echo "[deploy] Installing Composer dependencies via composer.phar..."
  "$PHP_BIN" composer.phar install --no-dev --optimize-autoloader --no-interaction
else
  echo "[deploy] WARNING: Composer not found, skipping composer install"
fi

echo "[deploy] Running Laravel maintenance commands..."
"$PHP_BIN" artisan migrate --force
"$PHP_BIN" artisan optimize:clear
"$PHP_BIN" artisan storage:link --force || true
"$PHP_BIN" artisan optimize

echo "[deploy] Done."
