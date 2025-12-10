import 'dotenv/config';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Verify Eclip database schema
 * Shows what tables exist and their columns
 * Output logged to: logs/verify-db.log
 * 
 * Usage: npx ts-node scripts/verify-database-schema.ts
 */

const logsDir = path.join(process.cwd(), 'logs');
const logFile = path.join(logsDir, 'verify-db.log');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message: string) {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] ${message}`;
  console.log(fullMessage);
  logStream.write(fullMessage + '\n');
}

function logError(message: string, error?: any) {
  const timestamp = new Date().toISOString();
  const errorMsg = error ? `\n${error.message || JSON.stringify(error)}` : '';
  const fullMessage = `[${timestamp}] ERROR: ${message}${errorMsg}`;
  console.error(fullMessage);
  logStream.write(fullMessage + '\n');
}

async function verifySchema() {
  log('='.repeat(80));
  log('DATABASE VERIFICATION STARTED');
  log('='.repeat(80));
  log(`Timestamp: ${new Date().toISOString()}`);
  log(`Working Directory: ${process.cwd()}`);
  
  try {
    log('\n--- DATABASE CONNECTION ---');
    log('Attempting to connect to database...');

    // Test connection first
    try {
      await db.execute(sql`SELECT 1 as test`);
      log('✓ Database connection successful');
    } catch (connError) {
      logError('Failed to connect to database', connError);
      log('\nTroubleshooting:');
      log('1. Check if DATABASE_URL is set');
      log('2. Ensure Neon database is accessible');
      log('3. Check credentials in connection string');
      logStream.end();
      process.exit(1);
    }

    log('\n--- CHECKING TABLES ---');
    // Get all tables in public schema
    const tableResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tables = (tableResult as any).rows || [];
    log(`Found ${tables.length} tables in public schema:`);

    // Check for critical tables
    log('\n--- CRITICAL TABLES STATUS ---');
    const criticalTables = [
      'users',
      'sessions',
      'notifications',
      'direct_messages',
      'cosmetics',
      'missions',
      'achievements',
      'badges'
    ];

    for (const tableName of criticalTables) {
      const exists = tables.some((t: any) => t.table_name === tableName);
      const icon = exists ? '✓' : '✗';
      log(`${icon} ${tableName}`);
    }

    // Check columns in users table
    log('\n--- Users Table Columns ---');
    const userColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position;
    `);

    const cols = (userColumns as any).rows || [];
    const requiredCols = ['is_admin', 'is_moderator', 'avatar_url'];
    
    for (const col of cols) {
      if (requiredCols.includes(col.column_name)) {
        log(`✓ ${col.column_name} (${col.data_type})`);
      }
    }

    // Check if direct_messages exists and show its structure
    log('\n--- Direct Messages Table ---');
    const dmExists = tables.some((t: any) => t.table_name === 'direct_messages');
    
    if (dmExists) {
      log('✓ Table exists');
      const dmColumns = await db.execute(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'direct_messages'
        ORDER BY ordinal_position;
      `);
      
      const dmCols = (dmColumns as any).rows || [];
      for (const col of dmCols) {
        log(`✓ ${col.column_name} (${col.data_type})`);
      }
      
      // Check indexes
      const indexes = await db.execute(sql`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'direct_messages';
      `);
      
      const indexList = (indexes as any).rows || [];
      log(`\nIndexes: ${indexList.length}`);
      for (const idx of indexList) {
        log(`  - ${idx.indexname}`);
      }

      // Count messages
      const count = await db.execute(sql`
        SELECT COUNT(*) as count FROM public.direct_messages;
      `);
      const msgCount = (count as any).rows?.[0]?.count || 0;
      log(`\nTotal messages in table: ${msgCount}`);
    } else {
      log('✗ direct_messages table NOT FOUND');
      log('\nTo create it, run:');
      log('  npm run migrate:db');
    }

    // Summary
    log('\n' + '='.repeat(80));
    log('SUMMARY');
    log('='.repeat(80));
    
    if (dmExists) {
      log('✓ Database appears to be properly configured');
      log('✓ direct_messages table exists');
      log('\nNo action needed. Database is ready to use.');
    } else {
      log('✗ direct_messages table is missing');
      log('\nTo fix this, run: npm run migrate:db');
    }

    log('\n' + '='.repeat(80));
    log(`Log file saved to: ${logFile}`);
    log('='.repeat(80));

    logStream.end();
    process.exit(0);
  } catch (error) {
    logError('✗ Error verifying schema', error);
    log('\n' + '='.repeat(80));
    log(`Log file saved to: ${logFile}`);
    log('='.repeat(80));
    logStream.end();
    process.exit(1);
  }
}

verifySchema();
