const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    console.log('\n🧪 SIMULATING LOGIN FLOW\n');
    
    const email = 'airijuz@gmail.com';
    const password = 'Rojus1990';
    const JWT_SECRET = process.env.JWT_SECRET;
    
    // 1. Find user
    console.log('1️⃣  Finding user...');
    let user = await pool.query(`
      SELECT id, email, username, password, role FROM "User" WHERE email = $1 LIMIT 1
    `, [email]);
    
    if (!user.rows.length) {
      console.log('   ❌ User not found');
      return;
    }
    
    user = user.rows[0];
    console.log(`   ✅ Found: ${user.email} (${user.username})`);
    
    // 2. Verify password
    console.log('\n2️⃣  Verifying password...');
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log('   ❌ Invalid password');
      return;
    }
    console.log('   ✅ Password is correct');
    
    // 3. Create JWT token
    console.log('\n3️⃣  Creating JWT token...');
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    console.log(`   ✅ Token created: ${token.substring(0, 50)}...`);
    
    // 4. Create session in DB
    console.log('\n4️⃣  Creating session in database...');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await pool.query(`
      INSERT INTO "Session" (id, "userId", token, "expiresAt", "createdAt")
      VALUES (gen_random_uuid(), $1, $2, $3, NOW())
      RETURNING id, token, "expiresAt"
    `, [user.id, token, expiresAt]);
    
    console.log(`   ✅ Session created: ${session.rows[0].id}`);
    
    // 5. Test retrieving session
    console.log('\n5️⃣  Retrieving session with token...');
    const sessionRetrieve = await pool.query(`
      SELECT id, "userId", token, "expiresAt" FROM "Session" WHERE token = $1
    `, [token]);
    
    if (sessionRetrieve.rows.length > 0) {
      const sess = sessionRetrieve.rows[0];
      console.log(`   ✅ Found session:`);
      console.log(`      - ID: ${sess.id}`);
      console.log(`      - User ID: ${sess.userId}`);
      console.log(`      - Expires: ${sess.expiresAt}`);
    } else {
      console.log('   ❌ Session not found');
    }
    
    // 6. Verify JWT token
    console.log('\n6️⃣  Verifying JWT token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`   ✅ Token verified, userId: ${decoded.userId}`);
    
    console.log('\n✅ LOGIN FLOW COMPLETE - All steps successful!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
})();
