import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });

async function checkTable(tableName) {
  try {
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position
    `;
    console.log(`\n${tableName}:`);
    cols.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));
    return cols;
  } catch (e) {
    console.error(`Error checking ${tableName}:`, e.message);
  }
}

(async () => {
  const tables = [
    'achievement_progress',
    'achievements', 
    'badges',
    'esr_thresholds',
    'level_thresholds',
    'role_permissions',
    'user_metrics'
  ];

  console.log('=== TIER 1 TABLE SCHEMAS ===');
  
  for (const table of tables) {
    await checkTable(table);
  }

  await sql.end();
})();
