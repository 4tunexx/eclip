#!/usr/bin/env node
import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    // Check if User table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'User'
      ) as exists;
    `;
    
    console.log(`\n📊 Legacy "User" table exists: ${tableCheck[0].exists ? 'YES' : 'NO'}`);
    
    // Check users table row count
    const usersCount = await sql`SELECT COUNT(*) as cnt FROM users`;
    console.log(`📊 Current "users" table rows: ${usersCount[0].cnt}`);
    
  } catch (error) {
    console.error('❌ Error:', error?.message || error);
  } finally {
    process.exit(0);
  }
}

main();
