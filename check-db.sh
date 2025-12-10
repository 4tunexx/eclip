#!/bin/bash
# Ultra-simple database check

echo "=== DATABASE CHECK ===" > /tmp/db-check.txt
echo "Timestamp: $(date)" >> /tmp/db-check.txt
echo "" >> /tmp/db-check.txt

# Try to connect using psql
PSQL_RESULT=$(psql "$DATABASE_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 2>&1)
echo "Tables found:" >> /tmp/db-check.txt
echo "$PSQL_RESULT" >> /tmp/db-check.txt
echo "" >> /tmp/db-check.txt

# Check for critical tables
for table in users sessions notifications direct_messages; do
  RESULT=$(psql "$DATABASE_URL" -c "SELECT 1 FROM information_schema.tables WHERE table_name = '$table';" 2>&1)
  if echo "$RESULT" | grep -q "1 row"; then
    echo "✓ $table EXISTS" >> /tmp/db-check.txt
  else
    echo "✗ $table MISSING" >> /tmp/db-check.txt
  fi
done

# Show direct_messages structure if it exists
echo "" >> /tmp/db-check.txt
echo "Direct Messages structure:" >> /tmp/db-check.txt
psql "$DATABASE_URL" -c "\d direct_messages" 2>&1 >> /tmp/db-check.txt

cat /tmp/db-check.txt
