import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });

(async () => {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%mission%'
    `;
    
    if (result.length > 0) {
      console.log('Mission tables found:');
      result.forEach(t => console.log(`  - ${t.table_name}`));
      
      // Get schema for first mission table
      const tableName = result[0].table_name;
      const cols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position
      `;
      console.log(`\nColumns in ${tableName}:`);
      cols.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));
    } else {
      console.log('No mission tables found');
    }
    
    await sql.end();
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
