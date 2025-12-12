#!/bin/bash

# ECLIP COMPLETE AUDIT & DIAGNOSTIC SCRIPT
# Run this: bash scripts/full-audit.sh 2>&1 | tee audit-results.log
# Then share the audit-results.log file

set -e

LOG_FILE="audit-results-$(date +%Y%m%d-%H%M%S).log"

{
  echo "╔════════════════════════════════════════════════════════════════════════════╗"
  echo "║                   ECLIP COMPLETE AUDIT & DIAGNOSTICS                      ║"
  echo "║                        Generated: $(date)                  ║"
  echo "╚════════════════════════════════════════════════════════════════════════════╝"
  echo ""

  # ============================================================================
  # 1. ENVIRONMENT CHECK
  # ============================================================================
  echo "📋 SECTION 1: ENVIRONMENT & DEPENDENCIES"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  echo ""
  echo "Node version:"
  node --version || echo "❌ Node not found"
  
  echo ""
  echo "npm version:"
  npm --version || echo "❌ npm not found"
  
  echo ""
  echo "Database URL (redacted):"
  if [ ! -z "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL is set"
    echo "   Host: $(echo $DATABASE_URL | grep -oP '(?<=@)[^/]+' || echo 'unknown')"
  else
    echo "❌ DATABASE_URL is NOT set"
  fi
  
  echo ""
  echo "Environment file check:"
  if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
    echo "   Keys present: $(grep -o '^[^=]*' .env.local | wc -l) environment variables"
  else
    echo "❌ .env.local NOT found"
  fi
  
  # ============================================================================
  # 2. PACKAGE DEPENDENCIES
  # ============================================================================
  echo ""
  echo "📦 SECTION 2: PACKAGE DEPENDENCIES"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  echo ""
  echo "Checking node_modules:"
  if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
    echo "   Size: $(du -sh node_modules 2>/dev/null | cut -f1 || echo 'unknown')"
    MODULE_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
    echo "   Modules: $((MODULE_COUNT - 1))"
  else
    echo "⚠️  node_modules NOT found - run: npm install"
  fi
  
  # ============================================================================
  # 3. CODEBASE ANALYSIS
  # ============================================================================
  echo ""
  echo "🔍 SECTION 3: CODEBASE ANALYSIS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  echo ""
  echo "TypeScript files:"
  TS_COUNT=$(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
  echo "  Total: $TS_COUNT files"
  
  echo ""
  echo "Hardcoded values scan (searching for common placeholders):"
  
  HARDCODED_FOUND=0
  
  # Search for common hardcoded patterns
  if grep -r "1\.23\|1\.45\|2\.50" src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules; then
    echo "  ⚠️  Found potential hardcoded K/D values"
    HARDCODED_FOUND=$((HARDCODED_FOUND + 1))
  fi
  
  if grep -r "68%\|75%\|50%" src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules; then
    echo "  ⚠️  Found potential hardcoded percentages"
    HARDCODED_FOUND=$((HARDCODED_FOUND + 1))
  fi
  
  if grep -r "placeholder\|TODO\|FIXME\|XXX\|HACK" src --include="*.ts" --include="*.tsx" 2>/dev/null | head -20; then
    echo "  ⚠️  Found TODO/FIXME comments"
  fi
  
  if [ $HARDCODED_FOUND -eq 0 ]; then
    echo "  ✅ No obvious hardcoded values found"
  fi
  
  echo ""
  echo "Mock data scan:"
  MOCK_FOUND=$(grep -r "mock\|MOCK\|fixture\|FIXTURE" src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "mockQueryClient\|@testing-library" | wc -l)
  echo "  Potential mock references: $MOCK_FOUND"
  if [ $MOCK_FOUND -gt 0 ]; then
    echo "  ⚠️  Found mock references - check if they're in use"
  fi
  
  # ============================================================================
  # 4. DATABASE CONNECTION TEST
  # ============================================================================
  echo ""
  echo "🗄️  SECTION 4: DATABASE CONNECTION"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  echo ""
  if [ -f "scripts/run-audit.js" ]; then
    echo "Running database audit..."
    echo ""
    if command -v node &> /dev/null; then
      node scripts/run-audit.js 2>&1 || echo "⚠️  Database connection test failed"
    else
      echo "❌ Node.js not available"
    fi
  else
    echo "ℹ️  run-audit.js not found"
  fi
  
  # ============================================================================
  # 5. BUILD CHECK
  # ============================================================================
  echo ""
  echo "🔨 SECTION 5: BUILD & COMPILATION"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  echo ""
  echo "TypeScript check (this may take a moment):"
  if command -v npx &> /dev/null && [ -d "node_modules" ]; then
    npx tsc --noEmit 2>&1 | head -50 || echo "⚠️  TypeScript compilation has errors (see above)"
    echo "... (see full output if truncated)"
  else
    echo "⚠️  Cannot run TypeScript check - npm or node_modules not ready"
  fi
  
  # ============================================================================
  # 6. API ROUTES
  # ============================================================================
  echo ""
  echo "🛣️  SECTION 6: API ROUTES"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  echo ""
  echo "API route files found:"
  find src/app/api -name "route.ts" 2>/dev/null | sed 's|src/app/api/||' | sed 's|/route.ts||' | sort | while read route; do
    echo "  ✓ /api/$route"
  done
  
  # ============================================================================
  # 7. DATABASE SCHEMA
  # ============================================================================
  echo ""
  echo "📊 SECTION 7: DATABASE SCHEMA"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  echo ""
  if [ -f "src/lib/db/schema.ts" ]; then
    echo "Schema tables defined:"
    grep -o "export const [a-zA-Z0-9_]* = pgTable" src/lib/db/schema.ts | sed 's/export const //;s/ = pgTable//' | while read table; do
      echo "  ✓ $table"
    done
  else
    echo "❌ schema.ts not found"
  fi
  
  # ============================================================================
  # 8. AUTHENTICATION FILES
  # ============================================================================
  echo ""
  echo "🔐 SECTION 8: AUTHENTICATION"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  echo ""
  echo "Auth-related files:"
  find src -path "*auth*" -name "*.ts" -o -path "*auth*" -name "*.tsx" 2>/dev/null | head -15 | while read file; do
    echo "  ✓ $file"
  done
  
  echo ""
  echo "Context/Hook files:"
  find src/contexts src/hooks -name "*.ts" -o -name "*.tsx" 2>/dev/null | while read file; do
    echo "  ✓ $file"
  done
  
  # ============================================================================
  # 9. SUMMARY
  # ============================================================================
  echo ""
  echo "╔════════════════════════════════════════════════════════════════════════════╗"
  echo "║                            AUDIT COMPLETE                                  ║"
  echo "║                     Results saved to: $LOG_FILE                     ║"
  echo "╚════════════════════════════════════════════════════════════════════════════╝"
  echo ""
  echo "✅ Next steps:"
  echo "   1. Review the output above for any ⚠️  or ❌ items"
  echo "   2. Check database audit results"
  echo "   3. Address any hardcoded values"
  echo "   4. Fix any TypeScript compilation errors"
  echo ""
  echo "📝 To share results with support:"
  echo "   Upload the $LOG_FILE file"
  echo ""

} 2>&1 | tee "$LOG_FILE"

echo ""
echo "Log saved to: $LOG_FILE"
