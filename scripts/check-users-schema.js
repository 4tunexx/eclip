#!/usr/bin/env node
import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name='users' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📊 Users Table Schema:');
    console.log('─'.repeat(50));
    result.forEach(col => {
      console.log(`${col.column_name.padEnd(25)} ${col.data_type.padEnd(15)} ${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'}`);
    });
    console.log('─'.repeat(50));
  } catch (error) {
    console.error('❌ Error:', error?.message || error);
  } finally {
    process.exit(0);
  }
}

main();
