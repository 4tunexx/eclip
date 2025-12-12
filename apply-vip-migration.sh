#!/bin/bash

# VIP System Migration Script
# This script applies the VIP system updates to the Neon database

echo "🚀 Starting VIP System Migration..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL environment variable not set"
  exit 1
fi

echo "📝 Migration steps:"
echo "  1. Add VIP columns to users table"
echo "  2. Create vip_subscriptions table"
echo "  3. Create indexes"
echo "  4. Set role colors"
echo ""

# Run the TypeScript migration script
npx tsx apply-vip-migration.ts

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ VIP System Migration completed successfully!"
  echo ""
  echo "🎯 Next steps:"
  echo "  1. Rebuild: npm run build"
  echo "  2. Deploy: git push && vercel deploy --prod"
  echo "  3. Test VIP purchase with admin user"
else
  echo "❌ Migration failed - check errors above"
  exit 1
fi
