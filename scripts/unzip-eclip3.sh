#!/usr/bin/env bash
set -euo pipefail

# This script extracts Eclip_3.zip into the workspace root, then runs the npm bootstrap
# It is intended to be run locally in a dev workspace with the appropriate env vars set.

ZIPFILE="Eclip_3.zip"
if [ ! -f "$ZIPFILE" ]; then
  echo "ERROR: $ZIPFILE not found in workspace root."
  exit 1
fi

echo "Backing up files that may be overwritten"
mkdir -p backup
tar -czf backup/before-unzip-$(date +%s).tar.gz package.json package-lock.json prisma src || true

echo "Unzipping $ZIPFILE"
unzip -o "$ZIPFILE" -d .

echo "Installing dependencies and running prisma operations"
npm install
if [ -z "${DATABASE_URL:-}" ]; then
  echo "WARNING: DATABASE_URL is not set. Skipping prisma db push."
else
  npx prisma generate
  npx prisma db push
fi

echo "Running a build..."
npm run build || { echo "Build failed. Inspect build-errors.txt"; exit 1; }

echo "Done."
