#!/usr/bin/env node
import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    // Check User table columns
    const userCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'User' ORDER BY ordinal_position`;
    console.log('User table columns:', userCols.map(c => c.column_name).join(', '));

    // Check if User table exists
    const userExists = await sql`SELECT 1 FROM information_schema.tables WHERE table_name = 'User'`;
    if (userExists.length > 0) {
      const userData = await sql`SELECT * FROM "User" LIMIT 1`;
      if (userData.length > 0) {
        console.log('\nUser table sample:', JSON.stringify(userData[0], null, 2));
      }
    }

    // Check Session table columns
    const sessionCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'Session' ORDER BY ordinal_position`;
    console.log('\n\nSession table columns:', sessionCols.map(c => c.column_name).join(', '));

  } catch (error) {
    console.error('Error:', error?.message || error);
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
}

main();
