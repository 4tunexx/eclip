const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    const res = await pool.query('SELECT * FROM "Notification" LIMIT 1');
    console.log('✅ Notification table (capital N) exists with columns:', Object.keys(res.rows[0]));
  } catch(e) {
    try {
      const res2 = await pool.query('SELECT * FROM notifications LIMIT 1');
      console.log('✅ notifications table (lowercase) exists');
    } catch(e2) {
      console.log('❌ No notifications table found - needs to be created');
      // Check schema
      const cols = await pool.query(`
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_name = 'Notification'
      `);
      console.log('Notification columns:', cols.rows);
    }
  }
  await pool.end();
})();
