#!/bin/bash
set -e

echo "🔗 Pulling environment variables from Vercel..."
vercel env pull --yes

if [ -f .env.local ]; then
  echo "✅ Successfully created .env.local"
  echo ""
  echo "📋 Environment variables loaded:"
  grep -E "^[A-Z_]+=" .env.local | cut -d'=' -f1 | sort
else
  echo "❌ Failed to pull environment variables"
  exit 1
fi
