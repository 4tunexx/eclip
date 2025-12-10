import 'dotenv/config';
import * as fs from 'fs';

// Show environment
console.log('='.repeat(60));
console.log('ENVIRONMENT CHECK');
console.log('='.repeat(60));

const envPath = '.env.local';
const hasEnvFile = fs.existsSync(envPath);
console.log(`\n✓ .env.local file exists: ${hasEnvFile}`);

if (hasEnvFile) {
  const content = fs.readFileSync(envPath, 'utf-8');
  console.log(`✓ .env.local file size: ${content.length} bytes`);
  const lines = content.split('\n').filter(l => l.trim());
  console.log(`✓ .env.local has ${lines.length} lines`);
}

console.log(`\n✓ DATABASE_URL set in process.env: ${!!process.env.DATABASE_URL}`);

if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  // Hide password
  const masked = url.replace(/:[^@]+@/, ':***@');
  console.log(`✓ DATABASE_URL (masked): ${masked.substring(0, 80)}...`);
}

console.log(`\n✓ JWT_SECRET set: ${!!process.env.JWT_SECRET}`);

console.log('\n' + '='.repeat(60));
console.log('ATTEMPTING CONNECTION');
console.log('='.repeat(60));

import postgres from 'postgres';

async function test() {
  if (!process.env.DATABASE_URL) {
    console.error('\n✗ DATABASE_URL is not set!');
    process.exit(1);
  }

  try {
    console.log('\nConnecting to database...');
    const sql = postgres(process.env.DATABASE_URL, { 
      max: 1,
      idle_timeout: 5
    });

    console.log('Sending test query...');
    const result = await sql`SELECT NOW() as time`;
    console.log('✓ Connection successful!');
    console.log(`✓ Server time: ${result[0].time}`);

    // Get table count
    const tables = await sql`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log(`✓ Found ${tables[0].count} tables in database`);

    // List critical tables
    const tableList = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'sessions', 'notifications', 'direct_messages')
      ORDER BY table_name
    `;

    console.log('\nCritical tables:');
    const tableNames = new Set(tableList.map(t => t.table_name));
    for (const t of ['users', 'sessions', 'notifications', 'direct_messages']) {
      const exists = tableNames.has(t);
      console.log(`  ${exists ? '✓' : '✗'} ${t}`);
    }

    if (tableNames.has('direct_messages')) {
      const cols = await sql`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'direct_messages'
        ORDER BY ordinal_position
      `;
      console.log('\nDirect Messages table columns:');
      cols.forEach(c => console.log(`  - ${c.column_name}`));
    }

    await sql.end();
    console.log('\n✓ All checks passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Connection failed!');
    console.error('Error message:', (error as any).message);
    console.error('\nFull error:');
    console.error(error);
    process.exit(1);
  }
}

test();
