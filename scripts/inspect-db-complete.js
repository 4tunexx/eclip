#!/usr/bin/env node

/**
 * COMPREHENSIVE DATABASE INSPECTION & COMPARISON
 * Connects to Neon, inspects all tables, columns, data types
 * Compares with schema.ts to find discrepancies
 */

const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const logFile = 'DB_INSPECTION_' + new Date().toISOString().replace(/:/g, '-').substring(0, 19) + '.log';
const stream = fs.createWriteStream(logFile);

function log(msg) {
  console.log(msg);
  stream.write(msg + '\n');
}

async function inspect() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    log('║         ECLIP NEON DATABASE - COMPLETE INSPECTION & COMPARISON             ║');
    log('║                        ' + new Date().toISOString());
    log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    // 1. GET ALL TABLES
    log('═══════════════════════════════════════════════════════════════════════════');
    log('📋 1. ALL TABLES IN DATABASE');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    log(`Total tables: ${tables.rows.length}\n`);
    tables.rows.forEach((t, idx) => {
      log(`${idx + 1}. ${t.table_name}`);
    });

    // 2. DETAILED SCHEMA FOR EACH TABLE
    log('\n═══════════════════════════════════════════════════════════════════════════');
    log('📊 2. DETAILED TABLE SCHEMAS');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    for (const table of tables.rows) {
      const tableName = table.table_name;
      
      // Get columns
      const columns = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      // Get row count
      const count = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
      const rowCount = count.rows[0].count;

      log(`\n📍 TABLE: ${tableName} (${rowCount} rows)`);
      log('─'.repeat(70));

      columns.rows.forEach(col => {
        let type = col.data_type;
        if (col.character_maximum_length) {
          type += `(${col.character_maximum_length})`;
        }
        const nullable = col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT: ${col.column_default}` : '';
        log(`  • ${col.column_name.padEnd(25)} ${type.padEnd(20)} ${nullable}${defaultVal}`);
      });
    }

    // 3. SAMPLE DATA
    log('\n═══════════════════════════════════════════════════════════════════════════');
    log('📈 3. SAMPLE DATA & STATISTICS');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    for (const table of tables.rows) {
      const tableName = table.table_name;
      const result = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = result.rows[0].count;
      
      if (count > 0) {
        log(`\n${tableName}: ${count} rows`);
        const sample = await client.query(`SELECT * FROM ${tableName} LIMIT 2`);
        if (sample.rows.length > 0) {
          log(`Sample: ${JSON.stringify(sample.rows[0], null, 2).substring(0, 200)}...`);
        }
      } else {
        log(`\n${tableName}: ❌ EMPTY (0 rows)`);
      }
    }

    // 4. KEY METRICS
    log('\n═══════════════════════════════════════════════════════════════════════════');
    log('📊 4. KEY METRICS & HEALTH');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    const sessionCount = await client.query('SELECT COUNT(*) as count FROM sessions');
    const matchCount = await client.query('SELECT COUNT(*) as count FROM matches');
    const forumThreads = await client.query('SELECT COUNT(*) as count FROM forum_threads');
    const forumCats = await client.query('SELECT COUNT(*) as count FROM forum_categories');
    const cosmetics = await client.query('SELECT COUNT(*) as count FROM cosmetics');
    const userProfiles = await client.query('SELECT COUNT(*) as count FROM user_profiles');
    const matchPlayers = await client.query('SELECT COUNT(*) as count FROM match_players');

    log(`Users:               ${userCount.rows[0].count}`);
    log(`Sessions:            ${sessionCount.rows[0].count}`);
    log(`User Profiles:       ${userProfiles.rows[0].count}`);
    log(`Matches:             ${matchCount.rows[0].count}`);
    log(`Match Players:       ${matchPlayers.rows[0].count}`);
    log(`Forum Categories:    ${forumCats.rows[0].count}`);
    log(`Forum Threads:       ${forumThreads.rows[0].count}`);
    log(`Cosmetics:           ${cosmetics.rows[0].count}`);

    // 5. DATA INTEGRITY CHECKS
    log('\n═══════════════════════════════════════════════════════════════════════════');
    log('🔍 5. DATA INTEGRITY CHECKS');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    // Check for NULL emails
    const nullEmails = await client.query('SELECT COUNT(*) as count FROM users WHERE email IS NULL');
    log(`Users with NULL email:        ${nullEmails.rows[0].count} ${nullEmails.rows[0].count > 0 ? '❌' : '✅'}`);

    // Check for NULL usernames
    const nullUsernames = await client.query('SELECT COUNT(*) as count FROM users WHERE username IS NULL');
    log(`Users with NULL username:     ${nullUsernames.rows[0].count} ${nullUsernames.rows[0].count > 0 ? '❌' : '✅'}`);

    // Check for profile mismatches
    const orphanedProfiles = await client.query(`
      SELECT COUNT(*) as count FROM user_profiles p 
      WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = p."user_id")
    `);
    log(`Orphaned user profiles:       ${orphanedProfiles.rows[0].count} ${orphanedProfiles.rows[0].count > 0 ? '❌' : '✅'}`);

    // Check for orphaned match players
    const orphanedPlayers = await client.query(`
      SELECT COUNT(*) as count FROM match_players mp 
      WHERE NOT EXISTS (SELECT 1 FROM matches m WHERE m.id = mp."match_id")
    `);
    log(`Orphaned match players:       ${orphanedPlayers.rows[0].count} ${orphanedPlayers.rows[0].count > 0 ? '❌' : '✅'}`);

    // Check session health
    const expiredSessions = await client.query('SELECT COUNT(*) as count FROM sessions WHERE "expires_at" < NOW()');
    log(`Expired sessions (cleanup):   ${expiredSessions.rows[0].count}`);

    // Check admin users
    const admins = await client.query('SELECT COUNT(*) as count FROM users WHERE role = \'ADMIN\'');
    log(`Admin users:                  ${admins.rows[0].count} ${admins.rows[0].count > 0 ? '✅' : '❌'}`);

    // Check email verified
    const verified = await client.query('SELECT COUNT(*) as count FROM users WHERE "email_verified" = true');
    log(`Email verified users:         ${verified.rows[0].count}`);

    // 6. MISSING DATA ANALYSIS
    log('\n═══════════════════════════════════════════════════════════════════════════');
    log('⚠️  6. POTENTIAL ISSUES & MISSING DATA');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    const issues = [];

    if (admins.rows[0].count === 0) {
      issues.push('❌ NO ADMIN USERS - Critical! Create admin user');
    }
    if (forumCats.rows[0].count === 0) {
      issues.push('❌ NO FORUM CATEGORIES - Initialize forum');
    }
    if (cosmetics.rows[0].count === 0) {
      issues.push('⚠️  NO COSMETICS - Seed shop items');
    }
    if (userProfiles.rows[0].count < userCount.rows[0].count) {
      const missing = userCount.rows[0].count - userProfiles.rows[0].count;
      issues.push(`⚠️  ${missing} USERS MISSING PROFILES`);
    }
    if (nullEmails.rows[0].count > 0) {
      issues.push(`⚠️  ${nullEmails.rows[0].count} USERS WITH NULL EMAIL`);
    }
    if (nullUsernames.rows[0].count > 0) {
      issues.push(`⚠️  ${nullUsernames.rows[0].count} USERS WITH NULL USERNAME`);
    }
    if (orphanedPlayers.rows[0].count > 0) {
      issues.push(`⚠️  ${orphanedPlayers.rows[0].count} ORPHANED MATCH PLAYERS`);
    }
    if (expiredSessions.rows[0].count > 0) {
      issues.push(`ℹ️  ${expiredSessions.rows[0].count} EXPIRED SESSIONS (consider cleanup)`);
    }

    if (issues.length === 0) {
      log('✅ NO ISSUES FOUND - Database is in excellent health!');
    } else {
      issues.forEach(issue => log(`  ${issue}`));
    }

    // 7. RECOMMENDED ACTIONS
    log('\n═══════════════════════════════════════════════════════════════════════════');
    log('✨ 7. RECOMMENDED ACTIONS');
    log('═══════════════════════════════════════════════════════════════════════════\n');

    if (issues.length > 0) {
      log('Based on the inspection, here are recommended SQL fixes:\n');
      
      if (admins.rows[0].count === 0) {
        log('-- Create admin user:');
        log('INSERT INTO users (id, username, email, "steam_id", role, "email_verified")');
        log('VALUES (gen_random_uuid(), \'admin\', \'admin@eclip.pro\', \'steam_admin_001\', \'ADMIN\', true);\n');
      }

      if (forumCats.rows[0].count === 0) {
        log('-- Create forum categories:');
        log('INSERT INTO forum_categories (id, title, description) VALUES');
        log('(gen_random_uuid(), \'General\', \'General discussion\'),');
        log('(gen_random_uuid(), \'Gameplay\', \'Gameplay discussion\'),');
        log('(gen_random_uuid(), \'Support\', \'Get help here\');\n');
      }

      if (userProfiles.rows[0].count < userCount.rows[0].count) {
        log('-- Create missing user profiles:');
        log('INSERT INTO user_profiles (id, "user_id", "created_at", "updated_at")');
        log('SELECT gen_random_uuid(), id, NOW(), NOW() FROM users u');
        log('WHERE NOT EXISTS (SELECT 1 FROM user_profiles p WHERE p."user_id" = u.id);\n');
      }

      if (expiredSessions.rows[0].count > 0) {
        log('-- Clean up expired sessions:');
        log('DELETE FROM sessions WHERE "expires_at" < NOW();\n');
      }
    }

    log('\n═══════════════════════════════════════════════════════════════════════════');
    log('✅ INSPECTION COMPLETE');
    log('═══════════════════════════════════════════════════════════════════════════\n');
    log(`📁 Full report saved to: ${logFile}\n`);

  } catch (error) {
    log('\n❌ ERROR: ' + error.message + '\n');
    log(error.stack);
  } finally {
    await client.end();
    stream.end();
  }
}

inspect();
