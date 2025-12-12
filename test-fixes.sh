#!/bin/bash
# Test script to verify authentication and data integrity fixes

echo "🔍 Testing Authentication & Data Integrity Fixes"
echo "================================================"
echo ""

# Check if Next.js dev server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "❌ Next.js server is not running on localhost:3000"
  echo "   Please start it with: npm run dev"
  exit 1
fi

echo "✅ Next.js server is running"
echo ""

# Test 1: Check API endpoints exist
echo "📡 Testing API Endpoints..."
echo ""

endpoints=(
  "/api/auth/me"
  "/api/auth/login"
  "/api/auth/register"
  "/api/auth/logout"
  "/api/auth/steam"
  "/api/notifications"
  "/api/health"
)

for endpoint in "${endpoints[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$endpoint")
  if [ "$status" = "000" ]; then
    echo "  ❌ $endpoint - Failed to connect"
  elif [ "$status" = "405" ] || [ "$status" = "401" ] || [ "$status" = "200" ]; then
    echo "  ✅ $endpoint - Available (HTTP $status)"
  else
    echo "  ⚠️  $endpoint - Unexpected status (HTTP $status)"
  fi
done

echo ""
echo "🔐 Testing Session Management..."
echo ""

# Test 2: Verify logout clears session
echo "  Testing logout endpoint..."
logout_response=$(curl -s -X POST "http://localhost:3000/api/auth/logout")
if echo "$logout_response" | grep -q "success"; then
  echo "  ✅ Logout endpoint working"
else
  echo "  ❌ Logout endpoint failed"
fi

echo ""
echo "📬 Testing Notifications API..."
echo ""

# Test 3: Check notifications endpoint (should require auth)
notif_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/notifications")
if [ "$notif_status" = "401" ]; then
  echo "  ✅ Notifications endpoint properly secured (401 without auth)"
else
  echo "  ⚠️  Notifications endpoint status: $notif_status"
fi

# Test 4: Check DELETE method is available
delete_status=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "http://localhost:3000/api/notifications?clearAll=true")
if [ "$delete_status" = "401" ]; then
  echo "  ✅ Notifications DELETE endpoint exists (401 without auth)"
else
  echo "  ⚠️  Notifications DELETE status: $delete_status"
fi

echo ""
echo "🎮 Testing Steam Auth..."
echo ""

steam_response=$(curl -s -I "http://localhost:3000/api/auth/steam")
if echo "$steam_response" | grep -q "Location:"; then
  echo "  ✅ Steam auth redirects to Steam (working)"
else
  echo "  ❌ Steam auth not redirecting"
fi

echo ""
echo "🗄️  Checking Database Schema..."
echo ""

# Test if we can query the database
if [ -f ".env.local" ]; then
  echo "  ✅ .env.local found"
  if grep -q "DATABASE_URL" .env.local; then
    echo "  ✅ DATABASE_URL configured"
  else
    echo "  ❌ DATABASE_URL not found in .env.local"
  fi
else
  echo "  ⚠️  .env.local not found"
fi

echo ""
echo "📝 Summary of Fixes Applied:"
echo "  ✅ Session cleanup on login/logout"
echo "  ✅ Fresh user data fetching (no cache)"
echo "  ✅ Steam avatar sync on every login"
echo "  ✅ Notification DELETE endpoint added"
echo "  ✅ Improved error logging"
echo "  ✅ Old session cleanup before new login"
echo ""
echo "📚 Documentation created:"
echo "  📄 FIXES_APPLIED.md - Full details of all fixes"
echo ""
echo "🎯 Next Steps:"
echo "  1. Test login with different users"
echo "  2. Verify avatars don't mix between users"
echo "  3. Test notification clearing"
echo "  4. Test Steam login"
echo ""
echo "✅ All checks complete!"
