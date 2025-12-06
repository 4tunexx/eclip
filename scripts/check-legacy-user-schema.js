#!/usr/bin/env node
import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name='User' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📊 Legacy "User" Table Schema:');
    console.log('─'.repeat(50));
    result.forEach(col => {
      console.log(`${col.column_name.padEnd(25)} ${col.data_type.padEnd(15)} ${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'}`);
    });
    console.log('─'.repeat(50));
    
    // Check sample data
    const sample = await sql`SELECT * FROM "User" LIMIT 1`;
    console.log('\n📋 Sample row from "User":');
    if (sample.length > 0) {
      Object.entries(sample[0]).forEach(([k, v]) => {
        console.log(`  ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error?.message || error);
  } finally {
    process.exit(0);
  }
}

main();
