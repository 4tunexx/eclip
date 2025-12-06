#!/usr/bin/env node
import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    // Get actual users table constraints
    const result = await sql`
      SELECT 
        c.column_name, 
        c.data_type, 
        c.is_nullable,
        CASE WHEN c.column_default IS NOT NULL THEN 'YES' ELSE 'NO' END as has_default,
        c.column_default
      FROM information_schema.columns c
      WHERE table_name='users' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📊 Users Table Full Schema:');
    console.log('─'.repeat(70));
    result.forEach(col => {
      const def = col.column_default ? ` = ${col.column_default}` : '';
      console.log(`${col.column_name.padEnd(30)} ${col.data_type.padEnd(15)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}${def}`);
    });
    console.log('─'.repeat(70));
  } catch (error) {
    console.error('❌ Error:', error?.message || error);
  } finally {
    process.exit(0);
  }
}

main();
