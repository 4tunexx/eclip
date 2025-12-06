#!/bin/bash

# Eclip Cleanup Script
# Removes unnecessary files and folders
# Date: December 2025

echo "🧹 Starting Eclip Platform Cleanup..."
echo "════════════════════════════════════════"

# Remove old documentation files
echo "📄 Removing old documentation..."
rm -f ADMIN_QUICK_START.md
rm -f ANTICHEAT_INTEGRATION.md
rm -f ANTICHEAT_QUICKSTART.md
rm -f AUDIT_REPORT.md
rm -f AUTH_FIX.md
rm -f CHANGES_SUMMARY.md
rm -f CODEBASE_SCAN_COMPLETE.md
rm -f CODEBASE_SCAN_REPORT.md
rm -f COMPLETE_IMPLEMENTATION.md
rm -f COMPLETE_SCAN_RESULTS.md
rm -f COMPLETE_STATUS_REPORT.md
rm -f COMPREHENSIVE_CODEBASE_ANALYSIS.md
rm -f DATABASE_FIX_GUIDE.md
rm -f DATABASE_MIGRATION_FIX.md
rm -f DATABASE_VALIDATION_COMPLETE.md
rm -f DELIVERABLES_REQUIREMENT_TYPES.md
rm -f DELIVERABLES_SUMMARY.md
rm -f DEPLOYMENT_CHECKLIST.md
rm -f DEPLOYMENT_GUIDE_100_PERCENT.md
rm -f DEPLOYMENT_STATUS.md
rm -f DOCUMENTATION_INDEX.md
rm -f EMAIL_SETUP.md
rm -f EMERGENCY_TROUBLESHOOTING.md
rm -f FINAL_CODEBASE_SCAN.md
rm -f FINAL_SCAN_COMPLETE.md
rm -f FINAL_STATUS.md
rm -f IMPLEMENTATION_COMPLETE.md
rm -f IMPLEMENTATION_ROADMAP.md
rm -f IMPLEMENTATION_STATUS.md
rm -f INDEX_PRODUCTION_LAUNCH.md
rm -f INTEGRATION_SUMMARY.md
rm -f MIGRATION_FIX_SUMMARY.md
rm -f NEXT_STEPS.md
rm -f PLATFORM_FEATURES.md
rm -f PROBLEMS_IDENTIFIED.md
rm -f PRODUCTION_READY_STATUS.md
rm -f QUICK_FIX_GUIDE.md
rm -f QUICK_REFERENCE.md
rm -f QUICK_REFERENCE_CARD.md
rm -f QUICK_START.md
rm -f QUICK_START_LIVE.md
rm -f QUICK_START_PRODUCTION.md
rm -f REQUIREMENT_TYPES_ADMIN_SPEC.md
rm -f REQUIREMENT_TYPES_IMPLEMENTATION.md
rm -f SESSION_COMPLETE_READY_FOR_100_PERCENT.md
rm -f START_HERE.md
rm -f START_PRODUCTION_LAUNCH.md
rm -f STATUS_SEEDING_COMPLETE.md
rm -f TECHNICAL_ARCHITECTURE.md
rm -f TIER_1_2_3_IMPLEMENTATION.md
rm -f TROUBLESHOOTING_GUIDE.md

# Remove log files
echo "🗂️  Removing log files..."
rm -f build.log
rm -f cleanup.log
rm -f db-report.txt
rm -f db.txt
rm -f err.txt
rm -f failed.txt
rm -f login.txt
rm -f schema_head.txt
rm -f ver.txt
rm -f test-login-node.js
rm -f test-login.ps1
rm -f fix-and-test.sh

# Remove sample folder
echo "🚀 Removing sample application..."
rm -rf sample

# Remove WORK folder
echo "📋 Removing old work documentation..."
rm -rf WORK

# Remove unnecessary scripts
echo "🔧 Removing debug/utility scripts..."
rm -f scripts/add-admin.js
rm -f scripts/audit-neon-tables.js
rm -f scripts/check-achievements-schema.js
rm -f scripts/check-all-schemas.js
rm -f scripts/check-cosmetics.js
rm -f scripts/check-data.js
rm -f scripts/check-db.js
rm -f scripts/check-email-duplicates.js
rm -f scripts/check-esr-thresholds.js
rm -f scripts/check-legacy-tables.js
rm -f scripts/check-legacy-user-schema.js
rm -f scripts/check-migration-status.js
rm -f scripts/check-missions.js
rm -f scripts/check-notifications.js
rm -f scripts/check-schema.js
rm -f scripts/check-session-tables.js
rm -f scripts/check-tier1-schemas.js
rm -f scripts/check-users-schema.js
rm -f scripts/cleanup-legacy-tables.js
rm -f scripts/cleanup-neon-tables.js
rm -f scripts/connect.txt
rm -f scripts/create-admin-user.sql
rm -f scripts/create-levelup-logic.js
rm -f scripts/create-missing-tables.js
rm -f scripts/create-sessions-table.js
rm -f scripts/db-audit.js
rm -f scripts/features-showcase.js
rm -f scripts/final-db-report.js
rm -f scripts/final-status.js
rm -f scripts/fix-database.js
rm -f scripts/fix-schema.js
rm -f scripts/full-production-test.js
rm -f scripts/full-system-audit.js
rm -f scripts/get-latest-token.js
rm -f scripts/grant-admin.js
rm -f scripts/hash-password.js
rm -f scripts/inspect-db.js
rm -f scripts/inspect-esr-table.js
rm -f scripts/inspect-table.js
rm -f scripts/inspect-users-full.js
rm -f scripts/list-all-tables.js
rm -f scripts/list-tables.js
rm -f scripts/make-me-admin.js
rm -f scripts/migrate-auth-schema.js
rm -f scripts/migrate-mmr-to-esr.js
rm -f scripts/migrate-tier1.js
rm -f scripts/prod-migrate-init.js
rm -f scripts/production-audit.js
rm -f scripts/seed-achievements.js
rm -f scripts/seed-all-data.js
rm -f scripts/seed-complete.js
rm -f scripts/seed-cosmetics.js
rm -f scripts/seed-data.sql
rm -f scripts/seed-fresh.js
rm -f scripts/seed-missions.js
rm -f scripts/seed-neon.js
rm -f scripts/seed-thread.js
rm -f scripts/setup-admin.js
rm -f scripts/setup-admin.sql
rm -f scripts/setup-notifications.js
rm -f scripts/simulate-login.js
rm -f scripts/spec-audit.js
rm -f scripts/sync-neon.js
rm -f scripts/test-api-data.js
rm -f scripts/test-api.js
rm -f scripts/test-auth-setup.js
rm -f scripts/test-progression.js
rm -f scripts/test-token.js
rm -f scripts/validate-schema.js
rm -f scripts/vercel-setup.sh
rm -f scripts/verify-admin-login.js
rm -f scripts/verify-auth.js
rm -f scripts/verify-data.js
rm -f scripts/verify-levelup.js
rm -f scripts/verify-migration.js

echo "════════════════════════════════════════"
echo "✅ Cleanup complete!"
echo "════════════════════════════════════════"
echo ""
echo "📊 Summary:"
echo "  • Removed 50+ old documentation files"
echo "  • Removed 13 log/test files"
echo "  • Removed sample/ folder (old Vite app)"
echo "  • Removed WORK/ folder (old notes)"
echo "  • Removed 60+ debug/utility scripts"
echo ""
echo "✨ Workspace is now clean and production-ready!"
echo ""
echo "🚀 Next steps:"
echo "  1. npm install"
echo "  2. npm run build"
echo "  3. npm run db:migrate"
echo "  4. npm run dev"
