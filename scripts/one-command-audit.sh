#!/bin/bash

# ECLIP ONE-COMMAND AUDIT
# This runs everything and saves to a single timestamped file
# Usage: bash scripts/one-command-audit.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="audit_results_$TIMESTAMP.log"

{
  echo "╔════════════════════════════════════════════════════════════════════════════╗"
  echo "║                    ECLIP COMPLETE AUDIT REPORT                            ║"
  echo "║                    Generated: $(date)                     ║"
  echo "║                    Output: $OUTPUT_FILE"
  echo "╚════════════════════════════════════════════════════════════════════════════╝"
  echo ""

  # 1. Quick Verify
  echo "Step 1/3: Quick Verification..."
  echo ""
  node scripts/instant-verify.js 2>&1

  # 2. Database Check
  echo ""
  echo ""
  echo "Step 2/3: Database Deep Check..."
  echo ""
  node scripts/db-quick-check.js 2>&1

  # 3. Summary
  echo ""
  echo ""
  echo "╔════════════════════════════════════════════════════════════════════════════╗"
  echo "║                          AUDIT REPORT COMPLETE                             ║"
  echo "║                                                                            ║"
  echo "║  File saved to: $OUTPUT_FILE"
  echo "║                                                                            ║"
  echo "║  Next Steps:                                                              ║"
  echo "║    1. Review the output above                                             ║"
  echo "║    2. Look for ❌ critical and ⚠️ warnings                               ║"
  echo "║    3. Share this file with support                                        ║"
  echo "║                                                                            ║"
  echo "╚════════════════════════════════════════════════════════════════════════════╝"
  echo ""

} 2>&1 | tee "$OUTPUT_FILE"

echo ""
echo "✅ Results saved to: $OUTPUT_FILE"
echo ""
echo "To share results, send this file:"
echo "  $OUTPUT_FILE"
