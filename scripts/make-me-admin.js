const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    const result = await pool.query(`
      SELECT id, email, username, role, level, xp, coins 
      FROM users 
      WHERE email = 'airijuz@gmail.com'
    `);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('\n📊 Your Account:');
      console.log('   ID:', user.id);
      console.log('   Email:', user.email);
      console.log('   Username:', user.username);
      console.log('   Role:', user.role || 'USER');
      console.log('   Level:', user.level);
      console.log('   XP:', user.xp);
      console.log('   Coins:', user.coins);
      
      if (user.role !== 'ADMIN') {
        console.log('\n⚠️  Not an admin. Updating to ADMIN role...');
        await pool.query(`
          UPDATE users SET role = 'ADMIN' WHERE email = 'airijuz@gmail.com'
        `);
        console.log('✅ You are now an ADMIN!');
      } else {
        console.log('\n✅ You already have ADMIN role!');
      }
    } else {
      console.log('❌ User not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
})();
