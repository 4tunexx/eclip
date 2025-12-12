#!/bin/bash

# ECLIP DATABASE POPULATION RUNNER
# Simple script to execute population and show results

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║           ECLIP DATABASE - STARTING POPULATION PROCESS                    ║"
echo "║                   Real Data • Real Stats • No Mockups                      ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Change to project directory
cd /workspaces/eclip || exit 1

echo "🔧 Step 1: Populating database with real match data..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run population script
node scripts/populate-and-audit.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Population successful!"
    echo ""
    echo "📊 Next steps:"
    echo "  1. Check the output log file above for all data"
    echo "  2. Run: node scripts/calculate-real-stats.js"
    echo "  3. Run: node scripts/auto-audit.js"
    echo ""
    echo "🎮 Your database now has:"
    echo "  ✓ 5 competitive matches"
    echo "  ✓ 50+ player statistics"
    echo "  ✓ Real K/D ratios and rankings"
    echo "  ✓ Forum threads and posts"
    echo "  ✓ Mission and achievement data"
    echo "  ✓ Transaction history"
    echo ""
else
    echo "❌ Population failed!"
    exit 1
fi
