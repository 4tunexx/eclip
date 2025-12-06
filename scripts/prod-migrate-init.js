#!/usr/bin/env node
/**
 * Production Migration Initializer
 * 
 * This script runs Drizzle migrations in production environments
 * where you cannot run terminal commands directly.
 * 
 * Usage: node scripts/prod-migrate-init.js
 * 
 * Environment: Requires DATABASE_URL to be set
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');

async function main() {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  console.log('🔄 PRODUCTION MIGRATION INITIALIZER');
  console.log('═'.repeat(70));
  console.log(`\n📍 Database: ${url.split('@')[1]?.split('/')[0] || 'unknown'}`);
  console.log(`🕐 Timestamp: ${new Date().toISOString()}\n`);

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  try {
    console.log('⏳ Running Drizzle migrations...\n');
    
    const migrationsFolder = path.join(__dirname, '../drizzle');
    
    if (!fs.existsSync(migrationsFolder)) {
      throw new Error(`Migrations folder not found: ${migrationsFolder}`);
    }

    // Run migrations
    const result = await migrate(db, { migrationsFolder });
    
    console.log('\n✅ Migrations completed successfully!');
    console.log('═'.repeat(70));
    
    // Verify tables were created
    console.log('\n📊 Verifying tables...\n');
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log(`✓ Found ${tables.length} tables in public schema:`);
    tables.forEach((t, i) => {
      if (i % 3 === 0) console.log('');
      process.stdout.write(`  ${t.table_name.padEnd(25)}`);
    });
    console.log('\n\n✅ DATABASE MIGRATION COMPLETE\n');
    console.log('You can now:');
    console.log('  • Create accounts');
    console.log('  • Login with email/password');
    console.log('  • Register new users');
    console.log('  • Use all API endpoints\n');
    
  } catch (err) {
    console.error('\n❌ Migration failed:');
    console.error(err?.message || err);
    console.error('\n🔍 Troubleshooting:');
    console.error('  1. Check DATABASE_URL is valid');
    console.error('  2. Ensure database is accessible');
    console.error('  3. Check for permission issues');
    console.error('  4. Verify PostgreSQL version (14+)\n');
    process.exitCode = 1;
  } finally {
    try {
      await client.end({ timeout: 5 });
    } catch (e) {
      // Ignore
    }
  }
}

main();
