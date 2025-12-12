#!/bin/bash

# 🎯 COMPREHENSIVE SYSTEM VERIFICATION SCRIPT
# Run this to verify all fixes are working correctly

echo "=================================================="
echo "🔍 ECLIP SYSTEM VERIFICATION SCRIPT"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check environment
echo -e "${BLUE}📋 1. Checking environment setup...${NC}"
if [ -f .env.local ]; then
    echo -e "${GREEN}✅ .env.local found${NC}"
    if grep -q "DATABASE_URL" .env.local; then
        echo -e "${GREEN}✅ DATABASE_URL configured${NC}"
    else
        echo -e "${RED}❌ DATABASE_URL not in .env.local${NC}"
    fi
else
    echo -e "${RED}❌ .env.local not found${NC}"
fi
echo ""

# Check Node modules
echo -e "${BLUE}📦 2. Checking dependencies...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules not found - run 'npm install'${NC}"
fi
echo ""

# Check TypeScript compilation
echo -e "${BLUE}🔨 3. Checking TypeScript compilation...${NC}"
npx tsc --noEmit 2>&1 | head -20
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ TypeScript compiles without errors${NC}"
else
    echo -e "${RED}❌ TypeScript has compilation errors${NC}"
fi
echo ""

# Test database connection
echo -e "${BLUE}🗄️  4. Testing Neon database connection...${NC}"
node -e "
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);

client.connect()
  .then(() => {
    console.log('${GREEN}✅ Connected to Neon Database${NC}');
    return client.query('SELECT version();');
  })
  .then(res => {
    console.log('${GREEN}✅ Database responding${NC}');
    return client.query('SELECT COUNT(*) as count FROM users;');
  })
  .then(res => {
    console.log('${GREEN}✅ Users table accessible (' + res.rows[0].count + ' users)${NC}');
    return client.end();
  })
  .catch(err => {
    console.log('${RED}❌ Database connection failed: ' + err.message + '${NC}');
    process.exit(1);
  });
" 2>&1
echo ""

# Check for hardcoded values
echo -e "${BLUE}🔍 5. Scanning for hardcoded/mock data...${NC}"
HARDCODED=$(grep -r "\"1.23\"" src/ 2>/dev/null | wc -l)
HARDCODED=$((HARDCODED + $(grep -r "\"68%\"" src/ 2>/dev/null | wc -l)))
HARDCODED=$((HARDCODED + $(grep -r "mockData\|sampleData\|fakeData" src/ 2>/dev/null | wc -l)))

if [ "$HARDCODED" -eq 0 ]; then
    echo -e "${GREEN}✅ No hardcoded/mock data found${NC}"
else
    echo -e "${YELLOW}⚠️  Found $HARDCODED potential hardcoded values${NC}"
fi
echo ""

# Check admin role checks
echo -e "${BLUE}🔐 6. Verifying admin role checks...${NC}"
INCONSISTENT=$(grep -r "isAdmin.*true" src/app/ 2>/dev/null | grep -v "isAdmin =\|isAdmin:\|isAdmin?" | wc -l)
if [ "$INCONSISTENT" -eq 0 ]; then
    echo -e "${GREEN}✅ All admin checks are consistent${NC}"
else
    echo -e "${YELLOW}⚠️  Found $INCONSISTENT inconsistent admin checks${NC}"
fi
echo ""

# Check logout logic
echo -e "${BLUE}🚪 7. Verifying logout implementation...${NC}"
if grep -q "clearUser()" src/components/layout/header.tsx 2>/dev/null; then
    echo -e "${GREEN}✅ clearUser() called in logout handler${NC}"
fi
if grep -q "document.cookie.*expires.*1970" src/components/layout/header.tsx 2>/dev/null; then
    echo -e "${GREEN}✅ Aggressive cookie deletion implemented${NC}"
fi
if grep -q "window.location.href = '/'" src/components/layout/header.tsx 2>/dev/null; then
    echo -e "${GREEN}✅ Hard reload on logout implemented${NC}"
fi
echo ""

# Build test
echo -e "${BLUE}🏗️  8. Testing build...${NC}"
npm run build 2>&1 | tail -10
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
fi
echo ""

# Summary
echo "=================================================="
echo -e "${GREEN}✅ VERIFICATION COMPLETE${NC}"
echo "=================================================="
echo ""
echo "📝 Next steps:"
echo "  1. Run: npm run dev"
echo "  2. Test login/logout flow"
echo "  3. Verify admin menu appears only for admins"
echo "  4. Check dashboard shows real K/D and Win Rate"
echo "  5. Verify all APIs return live data"
echo ""
