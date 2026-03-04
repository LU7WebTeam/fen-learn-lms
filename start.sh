#!/bin/bash
set -e

echo "Starting Free LMS..."

# Run PHP migrations (non-fatal if DB not ready)
php artisan migrate --force 2>/dev/null || echo "Note: DB migration skipped (configure MySQL credentials to run migrations)"

# Start Vite dev server in background
npm run dev &
VITE_PID=$!

echo "Vite dev server started (PID: $VITE_PID)"

# Also bind port 8000 with a simple relay to satisfy the legacy .replit port mapping
# This prevents Replit's proxy from getting confused by the duplicate external-80 entries
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

echo "Port relay started (PID: $RELAY_PID)"

# Start PHP Laravel server on port 5000 (required by Replit webview)
php artisan serve --host=0.0.0.0 --port=5000

# Cleanup on exit
kill $VITE_PID $RELAY_PID 2>/dev/null || true
