#!/bin/bash

echo "=== DATABASE CONNECTION DIAGNOSTIC ==="
echo ""
echo "Environment:"
echo "  NODE_ENV: $NODE_ENV"
echo "  DATABASE_URL set: $([ -z "$DATABASE_URL" ] && echo "NO" || echo "YES")"
echo ""

if [ -z "$DATABASE_URL" ]; then
  echo "Checking .env.local..."
  if [ -f ".env.local" ]; then
    echo "✓ .env.local exists"
    echo "  DATABASE_URL line exists: $(grep -c "DATABASE_URL" .env.local)"
    echo "  Content:"
    grep "DATABASE_URL" .env.local | head -1 | sed 's/password@[^@]*/password@***/' 
  else
    echo "✗ .env.local NOT FOUND"
  fi
fi

echo ""
echo "Testing connection with simple Node.js script..."
node -e "
const url = process.env.DATABASE_URL;
if (!url) {
  console.log('ERROR: DATABASE_URL not set');
  console.log('Trying to load from .env.local...');
  require('dotenv').config({ path: '.env.local' });
}

if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL found, trying connection...');
  const postgres = require('postgres');
  const sql = postgres(process.env.DATABASE_URL);
  sql\`SELECT 1\`.then(() => {
    console.log('✓ Connection works!');
    sql.end();
  }).catch(e => {
    console.log('✗ Connection failed:', e.message);
  });
} else {
  console.log('Still no DATABASE_URL after loading .env.local');
}
"

echo ""
echo "=== END DIAGNOSTIC ==="
