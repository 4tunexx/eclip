const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    console.log('\n📋 CHECKING SESSION TABLE STRUCTURE...\n');

    // Check new sessions table
    console.log('1️⃣  "sessions" table structure:');
    let result = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'sessions'
      ORDER BY ordinal_position
    `);
    if (result.rows.length > 0) {
      result.rows.forEach(r => console.log(`   - ${r.column_name}: ${r.data_type}`));
    } else {
      console.log('   (Table not found)');
    }
    
    // Check legacy Session table
    console.log('\n2️⃣  "Session" table structure:');
    result = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'Session'
      ORDER BY ordinal_position
    `);
    if (result.rows.length > 0) {
      result.rows.forEach(r => console.log(`   - ${r.column_name}: ${r.data_type}`));
      
      // Show recent sessions
      console.log('\n3️⃣  Recent sessions in "Session" table:');
      result = await pool.query(`
        SELECT * FROM "Session" ORDER BY "createdAt" DESC LIMIT 3
      `);
      console.log('   Records:', result.rows.length);
      if (result.rows.length > 0) {
        console.log(JSON.stringify(result.rows[0], null, 2));
      }
    } else {
      console.log('   (Table not found)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
})();
