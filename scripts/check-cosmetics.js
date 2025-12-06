const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    console.log('Checking cosmetics tables...\n');
    
    const r1 = await pool.query('SELECT COUNT(*) as count FROM cosmetics');
    console.log('✅ New cosmetics table:', r1.rows[0].count);
    
    const r2 = await pool.query('SELECT COUNT(*) as count FROM "Cosmetic"');
    console.log('✅ Legacy Cosmetic table:', r2.rows[0].count);
    
    if (r2.rows[0].count > 0) {
      const r3 = await pool.query('SELECT id, name, type, price FROM "Cosmetic" LIMIT 5');
      console.log('\nSample legacy cosmetics:');
      r3.rows.forEach(row => {
        console.log(`  - ${row.name} (${row.type}): ${row.price} coins`);
      });
    }
    
  } finally {
    await pool.end();
  }
})();
