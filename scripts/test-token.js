const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    console.log('\n🔐 SESSION TOKEN TEST\n');
    
    // Get your user ID
    const result = await pool.query(`
      SELECT id FROM "User" WHERE email = 'airijuz@gmail.com'
    `);
    
    if (!result.rows[0]) {
      console.log('❌ User not found!');
      return;
    }
    
    const userId = result.rows[0].id;
    console.log('User ID:', userId);
    
    // Check if there are existing sessions
    const sessions = await pool.query(`
      SELECT id, token, "expiresAt" FROM "Session" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 1
    `, [userId]);
    
    if (sessions.rows.length > 0) {
      const session = sessions.rows[0];
      console.log('\n✅ Found recent session:');
      console.log('   ID:', session.id);
      console.log('   Token:', session.token.substring(0, 50) + '...');
      console.log('   Expires:', new Date(session.expiresAt).toISOString());
      
      // Verify token
      try {
        const decoded = jwt.verify(session.token, process.env.JWT_SECRET);
        console.log('\n✅ Token is valid!');
        console.log('   Decoded:', decoded);
      } catch (e) {
        console.log('\n❌ Token verification failed:',  e.message);
      }
    } else {
      console.log('\n⚠️  No sessions found. Try logging in again.');
    }
    
    // Test a fresh login simulation
    console.log('\n🧪 Creating test token...');
    const testToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('   Test token created:', testToken.substring(0, 50) + '...');
    
    const verified = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('   ✅ Test token verified:', verified);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
})();
