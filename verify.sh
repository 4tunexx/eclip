#!/bin/bash
# Simple database verification script
# Just source your .env and run the verification

set -e

echo "Loading environment..."
source .env.local

echo "Running database verification..."
npm run verify:db > logs/verify-db.log 2>&1

echo ""
echo "✓ Verification complete! Check logs:"
echo ""
cat logs/verify-db.log
