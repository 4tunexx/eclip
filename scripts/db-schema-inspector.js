#!/usr/bin/env node

/**
 * DATABASE SCHEMA INSPECTOR - Compare with source
 * Shows all tables, columns, types, constraints, and data
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function inspect() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const output = [];
  
  function log(msg) {
    console.log(msg);
    output.push(msg);
  }

  try {
    await client.connect();
    
    log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    log('║              ECLIP DATABASE - SCHEMA & DATA INSPECTION                     ║');
    log('║                        ' + new Date().toISOString());
    log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(r => r.table_name);
    log(`📋 TABLES FOUND: ${tables.length}\n`);
    tables.forEach((t, i) => log(`  ${i + 1}. ${t}`));

    // Detailed schema for each table
    log('\n\n═══════════════════════════════════════════════════════════════════════════');
    log('📊 DETAILED SCHEMA & ROW COUNTS');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    for (const table of tables) {
      const colResult = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
      const count = countResult.rows[0].count;

      log(`\n📍 ${table.toUpperCase()} (${count} rows)`);
      log('─'.repeat(100));

      colResult.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? `DEFAULT ${col.column_default}` : '';
        log(`  ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${nullable.padEnd(10)} ${defaultVal}`);
      });
    }

    // Summary statistics
    log('\n\n═══════════════════════════════════════════════════════════════════════════');
    log('📈 DATA SUMMARY');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    const stats = {
      users: await client.query('SELECT COUNT(*) FROM users'),
      user_profiles: await client.query('SELECT COUNT(*) FROM user_profiles'),
      sessions: await client.query('SELECT COUNT(*) FROM sessions'),
      matches: await client.query('SELECT COUNT(*) FROM matches'),
      match_players: await client.query('SELECT COUNT(*) FROM match_players'),
      match_history: await client.query('SELECT COUNT(*) FROM match_history'),
      bans: await client.query('SELECT COUNT(*) FROM bans'),
      forum_categories: await client.query('SELECT COUNT(*) FROM forum_categories'),
      forum_threads: await client.query('SELECT COUNT(*) FROM forum_threads'),
      forum_posts: await client.query('SELECT COUNT(*) FROM forum_posts'),
      cosmetics: await client.query('SELECT COUNT(*) FROM cosmetics'),
    };

    for (const [key, result] of Object.entries(stats)) {
      const count = result.rows[0].count;
      log(`${key.padEnd(25)} : ${count}`);
    }

    // Data quality checks
    log('\n\n═══════════════════════════════════════════════════════════════════════════');
    log('🔍 DATA QUALITY CHECKS');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    const nullEmailCheck = await client.query('SELECT COUNT(*) FROM users WHERE email IS NULL');
    const nullUsernameCheck = await client.query('SELECT COUNT(*) FROM users WHERE username IS NULL');
    const missingProfilesCheck = await client.query(`
      SELECT COUNT(*) FROM users WHERE id NOT IN (SELECT "user_id" FROM user_profiles)
    `);
    const orphanedProfilesCheck = await client.query(`
      SELECT COUNT(*) FROM user_profiles WHERE "user_id" NOT IN (SELECT id FROM users)
    `);
    const adminCheck = await client.query('SELECT COUNT(*) FROM users WHERE role = \'ADMIN\'');
    const verifiedCheck = await client.query('SELECT COUNT(*) FROM users WHERE "email_verified" = true');
    const expiredSessionsCheck = await client.query('SELECT COUNT(*) FROM sessions WHERE "expires_at" < NOW()');

    log(`Users with NULL email      : ${nullEmailCheck.rows[0].count} ${nullEmailCheck.rows[0].count === 0 ? '✅' : '❌'}`);
    log(`Users with NULL username   : ${nullUsernameCheck.rows[0].count} ${nullUsernameCheck.rows[0].count === 0 ? '✅' : '❌'}`);
    log(`Users missing profiles     : ${missingProfilesCheck.rows[0].count} ${missingProfilesCheck.rows[0].count === 0 ? '✅' : '❌'}`);
    log(`Orphaned profiles          : ${orphanedProfilesCheck.rows[0].count} ${orphanedProfilesCheck.rows[0].count === 0 ? '✅' : '❌'}`);
    log(`Admin users                : ${adminCheck.rows[0].count} ${adminCheck.rows[0].count > 0 ? '✅' : '❌'}`);
    log(`Email verified users       : ${verifiedCheck.rows[0].count}`);
    log(`Expired sessions           : ${expiredSessionsCheck.rows[0].count}`);

    // Sample data from each table
    log('\n\n═══════════════════════════════════════════════════════════════════════════');
    log('📋 SAMPLE DATA');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    for (const table of tables) {
      const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
      const count = countResult.rows[0].count;

      if (count > 0) {
        log(`${table}: ${count} rows`);
        const sample = await client.query(`SELECT * FROM ${table} LIMIT 1`);
        if (sample.rows[0]) {
          log(`  Sample: ${JSON.stringify(sample.rows[0], null, 2).split('\n').slice(0, 5).join('\n')}`);
        }
      } else {
        log(`${table}: ❌ EMPTY`);
      }
      log('');
    }

    // Issues and recommendations
    log('\n═══════════════════════════════════════════════════════════════════════════');
    log('⚠️  ISSUES & RECOMMENDATIONS');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    const issues = [];

    if (adminCheck.rows[0].count === 0) {
      issues.push('❌ NO ADMIN USERS - Cannot manage the system!');
    }
    if (missingProfilesCheck.rows[0].count > 0) {
      issues.push(`⚠️  ${missingProfilesCheck.rows[0].count} users missing profiles`);
    }
    if (orphanedProfilesCheck.rows[0].count > 0) {
      issues.push(`⚠️  ${orphanedProfilesCheck.rows[0].count} orphaned profiles (users deleted?)`);
    }
    if (stats.forum_categories.rows[0].count === 0) {
      issues.push('⚠️  NO FORUM CATEGORIES - Forums cannot function');
    }
    if (stats.cosmetics.rows[0].count === 0) {
      issues.push('⚠️  NO COSMETICS - Shop is empty');
    }
    if (nullEmailCheck.rows[0].count > 0) {
      issues.push(`⚠️  ${nullEmailCheck.rows[0].count} users with NULL emails`);
    }
    if (nullUsernameCheck.rows[0].count > 0) {
      issues.push(`⚠️  ${nullUsernameCheck.rows[0].count} users with NULL usernames`);
    }
    if (expiredSessionsCheck.rows[0].count > 0) {
      issues.push(`ℹ️  ${expiredSessionsCheck.rows[0].count} expired sessions (should clean up)`);
    }

    if (issues.length === 0) {
      log('✅ NO ISSUES - Database is clean!');
    } else {
      issues.forEach(i => log(`  ${i}`));
    }

    log('\n═══════════════════════════════════════════════════════════════════════════');
    log('✅ INSPECTION COMPLETE');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    // Write to file
    const filename = `DB_INSPECTION_${new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)}.log`;
    fs.writeFileSync(filename, output.join('\n'));
    log(`📁 Report saved to: ${filename}\n`);

  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`);
    log(error.stack);
  } finally {
    await client.end();
  }
}

inspect();
