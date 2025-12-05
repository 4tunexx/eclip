import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });

async function checkSchema() {
  try {
    const achvCols = await sql.unsafe(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'achievements' ORDER BY ordinal_position
    `);
    
    const badgeCols = await sql.unsafe(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'badges' ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Achievements columns:');
    achvCols.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));
    
    console.log('\n📋 Badges columns:');
    badgeCols.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
