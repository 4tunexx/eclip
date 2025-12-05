import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });

(async () => {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('Available tables:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));
    
    // Check for our new tables
    console.log('\n=== NEW TIER 1 TABLES ===');
    const newTables = tables.filter(t => 
      t.table_name.includes('achievement') || 
      t.table_name.includes('role') || 
      t.table_name.includes('esr') || 
      t.table_name.includes('level_threshold') ||
      t.table_name.includes('user_metric') ||
      t.table_name.includes('badge')
    );
    newTables.forEach(t => console.log(`  ✓ ${t.table_name}`));

    await sql.end();
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
