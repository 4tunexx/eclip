#!/usr/bin/env bash
set -euo pipefail

echo "Running post-unzip bootstrap tasks..."
npm ci || npm install
npx prisma generate || true
if [ -z "${DATABASE_URL:-}" ]; then
  echo "Skipping npx prisma db push because DATABASE_URL is not set."
else
  npx prisma db push
fi

echo "Running build to verify everything compiles..."
npm run build 2>&1 | tee build-errors.txt
if [ $? -ne 0 ]; then
  echo "Build failed. Check build-errors.txt for details."
  exit 1
else
  echo "Build succeeded."
fi
