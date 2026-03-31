#!/bin/bash
set -e

# Clean old assets
rm -rf public/build/assets/*

echo "[deploy-local] Building assets..."
npm run build

echo "[deploy-local] Adding and committing assets..."
git add public/build/
git commit -m "Build: automated deploy $(date '+%Y-%m-%d %H:%M:%S')" || echo "Nothing to commit"

echo "[deploy-local] Pushing to GitHub..."
git push origin main

echo "[deploy-local] Done! Now run 'git pull origin main' and 'bash deploy.sh' on your server."
