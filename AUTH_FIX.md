#!/bin/bash
# Manual auth fix script

echo "🔧 ECLIP Auth Fix - Manual Steps"
echo "================================="
echo ""
echo "1️⃣  Check admin user exists in database:"
echo "   psql -h <host> -U <user> -d <dbname> -c \"SELECT id, email, username, password_hash, role FROM users WHERE email = 'admin@eclip.pro';\"" 
echo ""
echo "2️⃣  If empty, insert admin user (run this in your database):"
echo ""
echo "   -- First, generate a bcrypt hash of 'Admin123!' (10 rounds)"
echo "   -- or use this Node script:"
echo ""
echo "3️⃣  Run the setup script:"
echo "   node scripts/setup-admin.js"
echo ""
echo "4️⃣  Expected result:"
echo "   ✅ Admin user created!"
echo "   📋 Admin Credentials:"
echo "   Email: admin@eclip.pro"
echo "   Password: Admin123!"
echo ""
echo "5️⃣  Test login:"
echo "   curl -X POST https://www.eclip.pro/api/auth/login \\
echo "   -H 'Content-Type: application/json' \\
echo "   -d '{\"email\":\"admin@eclip.pro\",\"password\":\"Admin123!\"}'"
echo ""
echo "6️⃣  If login succeeds, check /api/auth/me endpoint:"
echo "   curl -X GET https://www.eclip.pro/api/auth/me \\
echo "   -b 'session=<token_from_login>' \\
echo "   -H 'Cookie: session=<token_from_login>'"
echo ""
