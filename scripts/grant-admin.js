const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    // Check new users table
    let result = await pool.query(`
      SELECT id, email, username, role, level, xp, coins 
      FROM users 
      WHERE email = 'airijuz@gmail.com'
    `);
    
    if (result.rows.length === 0) {
      console.log('Not in users table, checking legacy User table...');
      
      // Check legacy table
      result = await pool.query(`
        SELECT id, email, username, role 
        FROM "User" 
        WHERE email = 'airijuz@gmail.com'
      `);
      
      if (result.rows.length > 0) {
        console.log('\n📊 Found in legacy User table:');
        console.log(result.rows[0]);
        
        // Update role in legacy table
        await pool.query(`
          UPDATE "User" SET role = 'ADMIN' WHERE email = 'airijuz@gmail.com'
        `);
        console.log('\n✅ Updated to ADMIN in legacy table!');
        console.log('⚠️  Please log out and log back in for changes to take effect.');
      } else {
        console.log('❌ User not found in any table');
      }
    } else {
      const user = result.rows[0];
      console.log('\n📊 Your Account:');
      console.log(user);
      
      if (user.role !== 'ADMIN') {
        await pool.query(`
          UPDATE users SET role = 'ADMIN' WHERE email = 'airijuz@gmail.com'
        `);
        console.log('\n✅ Updated to ADMIN! Please refresh the page.');
      } else {
        console.log('\n✅ You already have ADMIN role!');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
})();
