import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

const logFile = path.join(process.cwd(), 'logs', 'migration-check.log');

function log(msg: string) {
  const line = `${new Date().toISOString()} ${msg}`;
  console.log(line);
  fs.appendFileSync(logFile, line + '\n');
}

async function checkDatabase() {
  try {
    log('Starting database check...');

    // Test connection
    try {
      const conn = await db.execute(sql`SELECT 1`);
      log('✓ Database connection successful');
    } catch (e) {
      log('✗ Database connection failed: ' + (e as any).message);
      process.exit(1);
    }

    // Check tables
    const tableResult = await db.execute(sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);

    const tables = (tableResult as any).rows || [];
    log(`Found ${tables.length} tables`);

    const tableNames = tables.map((t: any) => t.table_name);

    // Check for critical tables
    const critical = ['users', 'sessions', 'notifications', 'direct_messages'];
    log('\n--- CRITICAL TABLES ---');
    for (const table of critical) {
      const exists = tableNames.includes(table);
      log(`${exists ? '✓' : '✗'} ${table}`);
    }

    // If direct_messages exists, get its structure
    if (tableNames.includes('direct_messages')) {
      log('\n--- DIRECT_MESSAGES COLUMNS ---');
      const cols = await db.execute(sql`
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'direct_messages'
        ORDER BY ordinal_position
      `);
      for (const col of (cols as any).rows) {
        log(`  ${col.column_name}: ${col.data_type}`);
      }

      // Count records
      const count = await db.execute(sql`SELECT COUNT(*) as cnt FROM direct_messages`);
      const cnt = (count as any).rows[0].cnt;
      log(`\nTotal messages: ${cnt}`);
    } else {
      log('\n✗ direct_messages table MISSING!');
      log('Run: npm run migrate:db');
    }

    log('\n✓ Check complete');
    process.exit(0);
  } catch (e) {
    log('ERROR: ' + (e as any).message);
    process.exit(1);
  }
}

checkDatabase();
