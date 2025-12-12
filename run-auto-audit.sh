#!/bin/bash

# SIMPLE AUTO-AUDIT COMMAND
# Just paste this into terminal and it automatically logs everything

cd /workspaces/eclip && node scripts/auto-audit.js

echo ""
echo "✅ Audit complete! Check the AUDIT_RESULTS_*.log file"
