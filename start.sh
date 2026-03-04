#!/bin/bash
set -e

echo "Starting Free LMS..."

# Run PHP migrations (non-fatal if DB not ready)
php artisan migrate --force 2>/dev/null || echo "Note: DB migration skipped (configure MySQL credentials to run migrations)"

# Start Vite dev server in background
npm run dev &
VITE_PID=$!

echo "Vite dev server started (PID: $VITE_PID)"

# Start PHP Laravel server on port 5000
php artisan serve --host=0.0.0.0 --port=5000

# Cleanup on exit
kill $VITE_PID 2>/dev/null || true
