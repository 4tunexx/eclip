const postgres = require('postgres');
const fs = require('fs');

async function test() {
  const url = process.env.DATABASE_URL;
  console.log('DATABASE_URL set:', !!url);
  console.log('URL (first 50 chars):', url ? url.substring(0, 50) + '...' : 'NOT SET');
  
  if (!url) {
    console.error('ERROR: DATABASE_URL not set in environment!');
    process.exit(1);
  }

  try {
    console.log('\nConnecting...');
    const sql = postgres(url);
    
    console.log('Running test query...');
    const result = await sql`SELECT 1 as test`;
    console.log('✓ Connection successful!');
    console.log('Result:', result);
    
    // Check tables
    console.log('\nChecking tables...');
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log(`\nFound ${tables.length} tables:`);
    tables.forEach(t => console.log(`  - ${t.table_name}`));
    
    // Check for direct_messages
    const hasDM = tables.some(t => t.table_name === 'direct_messages');
    console.log(`\nDirect Messages table: ${hasDM ? '✓ EXISTS' : '✗ MISSING'}`);
    
    if (hasDM) {
      const cols = await sql`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'direct_messages'
        ORDER BY ordinal_position
      `;
      console.log('Columns:');
      cols.forEach(c => console.log(`  - ${c.column_name}`));
    }
    
    await sql.end();
    console.log('\n✓ All checks passed!');
    
  } catch (error) {
    console.error('✗ Connection failed!');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

test();
