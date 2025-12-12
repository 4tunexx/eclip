#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function inspect() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║         ECLIP NEON DATABASE - COMPLETE INSPECTION & COMPARISON             ║');
    console.log('║                        ' + new Date().toISOString());
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    // GET ALL TABLES
    console.log('📋 1. ALL TABLES IN DATABASE');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`Total tables: ${tables.rows.length}\n`);
    tables.rows.forEach((t, idx) => {
      console.log(`${idx + 1}. ${t.table_name}`);
    });

    // DETAILED SCHEMA
    console.log('\n📊 2. DETAILED TABLE SCHEMAS\n');

    for (const table of tables.rows) {
      const tableName = table.table_name;
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

      const count = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
      const rowCount = count.rows[0].count;

      console.log(`📍 TABLE: ${tableName} (${rowCount} rows)`);
      console.log('─'.repeat(90));

      columns.rows.forEach(col => {
        let type = col.data_type;
        if (col.character_maximum_length) {
          type += `(${col.character_maximum_length})`;
        }
        const nullable = col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT: ${col.column_default}` : '';
        console.log(`  • ${col.column_name.padEnd(25)} ${type.padEnd(20)} ${nullable}${defaultVal}`);
      });
      console.log('');
    }

    // KEY METRICS
    console.log('📊 3. KEY METRICS & HEALTH\n');

    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    const sessionCount = await client.query('SELECT COUNT(*) as count FROM sessions');
    const matchCount = await client.query('SELECT COUNT(*) as count FROM matches');
    const forumThreads = await client.query('SELECT COUNT(*) as count FROM forum_threads');
    const forumCats = await client.query('SELECT COUNT(*) as count FROM forum_categories');
    const cosmetics = await client.query('SELECT COUNT(*) as count FROM cosmetics');
    const userProfiles = await client.query('SELECT COUNT(*) as count FROM user_profiles');
    const matchPlayers = await client.query('SELECT COUNT(*) as count FROM match_players');
    const bans = await client.query('SELECT COUNT(*) as count FROM bans');
    const matchHistory = await client.query('SELECT COUNT(*) as count FROM match_history');

    console.log(`Users:               ${userCount.rows[0].count}`);
    console.log(`User Profiles:       ${userProfiles.rows[0].count} ${userCount.rows[0].count === userProfiles.rows[0].count ? '✅' : '❌'}`);
    console.log(`Sessions:            ${sessionCount.rows[0].count}`);
    console.log(`Matches:             ${matchCount.rows[0].count}`);
    console.log(`Match Players:       ${matchPlayers.rows[0].count}`);
    console.log(`Match History:       ${matchHistory.rows[0].count}`);
    console.log(`Forum Categories:    ${forumCats.rows[0].count}`);
    console.log(`Forum Threads:       ${forumThreads.rows[0].count}`);
    console.log(`Cosmetics:           ${cosmetics.rows[0].count}`);
    console.log(`Bans:                ${bans.rows[0].count}`);

    // DATA INTEGRITY
    console.log('\n🔍 4. DATA INTEGRITY CHECKS\n');

    const nullEmails = await client.query('SELECT COUNT(*) as count FROM users WHERE email IS NULL');
    console.log(`Users with NULL email:        ${nullEmails.rows[0].count} ${nullEmails.rows[0].count > 0 ? '❌' : '✅'}`);

    const nullUsernames = await client.query('SELECT COUNT(*) as count FROM users WHERE username IS NULL');
    console.log(`Users with NULL username:     ${nullUsernames.rows[0].count} ${nullUsernames.rows[0].count > 0 ? '❌' : '✅'}`);

    const orphanedProfiles = await client.query(`
      SELECT COUNT(*) as count FROM user_profiles p 
      WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = p."user_id")
    `);
    console.log(`Orphaned user profiles:       ${orphanedProfiles.rows[0].count} ${orphanedProfiles.rows[0].count > 0 ? '❌' : '✅'}`);

    const orphanedPlayers = await client.query(`
      SELECT COUNT(*) as count FROM match_players mp 
      WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = mp."user_id")
    `);
    console.log(`Orphaned match players:       ${orphanedPlayers.rows[0].count} ${orphanedPlayers.rows[0].count > 0 ? '❌' : '✅'}`);

    const expiredSessions = await client.query('SELECT COUNT(*) as count FROM sessions WHERE "expires_at" < NOW()');
    console.log(`Expired sessions:             ${expiredSessions.rows[0].count}`);

    const admins = await client.query('SELECT COUNT(*) as count FROM users WHERE role = \'ADMIN\'');
    console.log(`Admin users:                  ${admins.rows[0].count} ${admins.rows[0].count > 0 ? '✅' : '❌'}`);

    const verified = await client.query('SELECT COUNT(*) as count FROM users WHERE "email_verified" = true');
    console.log(`Email verified users:         ${verified.rows[0].count}`);

    // ISSUES
    console.log('\n⚠️  5. POTENTIAL ISSUES & MISSING DATA\n');

    const issues = [];

    if (admins.rows[0].count === 0) {
      issues.push('❌ NO ADMIN USERS - Critical!');
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

    if (issues.length === 0) {
      console.log('✅ NO ISSUES FOUND - Database is in excellent health!');
    } else {
      issues.forEach(issue => console.log(`  ${issue}`));
    }

    // RECOMMENDATIONS
    if (issues.length > 0) {
      console.log('\n✨ 6. RECOMMENDED FIXES\n');
      
      if (admins.rows[0].count === 0) {
        console.log('-- Create admin user:');
        console.log('INSERT INTO users (id, username, email, "steam_id", role, "email_verified")');
        console.log('VALUES (gen_random_uuid(), \'admin\', \'admin@eclip.pro\', \'steam_admin\', \'ADMIN\', true);\n');
      }

      if (forumCats.rows[0].count === 0) {
        console.log('-- Create forum categories:');
        console.log('INSERT INTO forum_categories (id, title, description) VALUES');
        console.log('(gen_random_uuid(), \'General\', \'General discussion\'),');
        console.log('(gen_random_uuid(), \'Gameplay\', \'Gameplay discussion\'),');
        console.log('(gen_random_uuid(), \'Support\', \'Get help here\');\n');
      }

      if (userProfiles.rows[0].count < userCount.rows[0].count) {
        console.log('-- Create missing user profiles:');
        console.log('INSERT INTO user_profiles (id, "user_id", "created_at", "updated_at")');
        console.log('SELECT gen_random_uuid(), id, NOW(), NOW() FROM users u');
        console.log('WHERE NOT EXISTS (SELECT 1 FROM user_profiles p WHERE p."user_id" = u.id);\n');
      }

      if (expiredSessions.rows[0].count > 0) {
        console.log(`-- Clean up ${expiredSessions.rows[0].count} expired sessions:`);
        console.log('DELETE FROM sessions WHERE "expires_at" < NOW();\n');
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('✅ INSPECTION COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

inspect();
