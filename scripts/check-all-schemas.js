import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });

(async () => {
  try {
    console.log('=== MISSIONS TABLE ===');
    const missionsCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'missions' 
      ORDER BY ordinal_position
    `;
    missionsCols.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));

    console.log('\n=== ACHIEVEMENTS TABLE ===');
    const achievementsCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'achievements' 
      ORDER BY ordinal_position
    `;
    achievementsCols.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));

    await sql.end();
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
