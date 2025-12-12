#!/bin/bash

# Load environment
export $(cat .env.local | xargs)

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set!"
  exit 1
fi

echo "✅ DATABASE_URL loaded"
echo "🔍 Checking database connection..."

# Use psql to query the database
psql "$DATABASE_URL" -c "
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN level IS NULL THEN 1 END) as null_levels,
  COUNT(CASE WHEN xp IS NULL THEN 1 END) as null_xps,
  COUNT(CASE WHEN esr IS NULL THEN 1 END) as null_esrs,
  COUNT(CASE WHEN rank IS NULL THEN 1 END) as null_ranks
FROM users;
"

echo ""
echo "📊 First 10 users:"
psql "$DATABASE_URL" -c "
SELECT 
  id, username, level, xp, esr, rank, role
FROM users
LIMIT 10;
" 

echo ""
echo "✅ Database check complete!"
