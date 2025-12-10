#!/bin/bash

echo "=== NETWORK DIAGNOSTIC ==="
echo ""

# Extract hostname from env
HOST=$(grep DATABASE_URL .env.local | grep -oP '(?<=//@)[^:]+' | grep -oP '[^/]+' | head -1)

echo "Extracted hostname: $HOST"
echo ""

echo "DNS Tests:"
echo "1. ping (may not work due to ICMP):"
ping -c 1 "$HOST" 2>&1 | head -5

echo ""
echo "2. nslookup:"
nslookup "$HOST" 2>&1

echo ""
echo "3. dig:"
dig "$HOST" 2>&1 | grep -A 5 "ANSWER SECTION"

echo ""
echo "4. curl (test connectivity):"
curl -I "https://$HOST" 2>&1 | head -5

echo ""
echo "5. getent hosts:"
getent hosts "$HOST"

echo ""
echo "=== END DIAGNOSTIC ==="
