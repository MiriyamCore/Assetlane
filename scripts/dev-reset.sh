#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODE="${1:-}"

echo "Assetlane dev reset"
echo "-------------------"

if pgrep -f "apps/api/src/index.ts" >/dev/null 2>&1 || pgrep -f "nodemon src/index.ts" >/dev/null 2>&1; then
  echo "Warning: API dev process may still be running. Stop npm run dev first if reset fails."
fi

rm -f \
  "$ROOT/apps/api/assetlane.db" \
  "$ROOT/apps/api/assetlane.db-wal" \
  "$ROOT/apps/api/assetlane.db-shm"

echo "Removed SQLite database."

if [[ "$MODE" == "--full" ]]; then
  rm -rf "$ROOT/storage/uploads/images" "$ROOT/storage/uploads/digital" "$ROOT/storage/uploads/branding"
  rm -rf "$ROOT/storage/themes/installed"/*
  mkdir -p "$ROOT/storage/uploads/images" "$ROOT/storage/uploads/digital" "$ROOT/storage/uploads/branding" "$ROOT/storage/themes/installed"
  echo "Cleared uploaded files and installed themes."
fi

cd "$ROOT"
npm run prisma:push

echo ""
echo "Fresh database ready."
echo "Next:"
echo "  npm run dev"
echo "  open http://localhost:5173/setup"
