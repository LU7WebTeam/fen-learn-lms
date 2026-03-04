#!/bin/bash
set -e

echo "Starting Free LMS..."

# Run PHP migrations (non-fatal if DB not ready)
php artisan migrate --force 2>/dev/null || echo "Note: DB migration skipped (configure MySQL credentials to run migrations)"

# Remove stale Vite hot-reload file so Laravel uses the production manifest
rm -f public/hot

# Build frontend assets into public/build/ (watch mode for auto-rebuild on changes)
echo "Building frontend assets..."
npm run build 2>&1 | tail -5

# Watch for JS/CSS changes and rebuild automatically (background)
npm run build -- --watch &
BUILD_PID=$!

echo "Asset watcher started (PID: $BUILD_PID)"

# Relay port 8000 → 5000 to satisfy legacy .replit port mapping
node -e "
const net = require('net');
const server = net.createServer(socket => {
  const dest = net.connect(5000, '127.0.0.1');
  socket.pipe(dest);
  dest.pipe(socket);
  dest.on('error', () => socket.destroy());
  socket.on('error', () => dest.destroy());
});
server.listen(8000, '0.0.0.0', () => console.log('Port 8000 relay → 5000 active'));
" &
RELAY_PID=$!

# Start PHP Laravel server on port 5000 (required by Replit webview)
php artisan serve --host=0.0.0.0 --port=5000

# Cleanup on exit
kill $BUILD_PID $RELAY_PID 2>/dev/null || true
