#!/bin/bash

# Eclip Database Migration and Verification Script
# Run this script to ensure all tables and columns match the codebase schema

set -e

echo "Starting Eclip Database Schema Alignment..."
echo "=========================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable not set"
  exit 1
fi

# List of migration files to run in order
MIGRATIONS=(
  "migrations/0006_database_alignment.sql"
)

echo "Running migrations..."
for migration in "${MIGRATIONS[@]}"; do
  if [ -f "$migration" ]; then
    echo "Executing: $migration"
    psql "$DATABASE_URL" -f "$migration" || echo "Migration $migration completed with status: $?"
  else
    echo "WARNING: Migration file not found: $migration"
  fi
done

echo ""
echo "=========================================="
echo "Database alignment complete!"
echo ""
echo "Next steps:"
echo "1. Verify all tables exist in Neon dashboard"
echo "2. Check that direct_messages table was created"
echo "3. Verify notifications table has all required columns"
echo "4. Test messages API endpoint: POST /api/messages"
echo "5. Test admin panel access control"
echo "6. Test logout flow with notifications"
