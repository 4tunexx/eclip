#!/usr/bin/env node

/**
 * COMPREHENSIVE CODEBASE AUDIT
 * Checks every feature in codebase vs database schema
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && !key.startsWith('#')) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

Object.assign(process.env, envVars);

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found!');
  process.exit(1);
}

const postgres = require('postgres');

async function auditCodebase() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║           FULL CODEBASE vs DATABASE AUDIT                      ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // 1. Get all tables
    console.log('1️⃣ DATABASE TABLES');
    console.log('═'.repeat(70));
    
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`Found ${tables.length} tables:\n`);
    const tableNames = [];
    tables.forEach(t => {
      tableNames.push(t.table_name);
      console.log(`  • ${t.table_name}`);
    });

    // 2. Check USERS table structure
    console.log('\n2️⃣ USERS TABLE - EXPECTED vs ACTUAL');
    console.log('═'.repeat(70));
    
    const userColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;

    const expectedUserFields = {
      id: 'uuid',
      username: 'text',
      email: 'text',
      password_hash: 'text',
      level: 'integer',
      xp: 'integer',
      esr: 'integer', // ESR = Eclip Skill Rating
      rank_tier: 'text',
      rank_division: 'integer',
      avatar: 'text',
      coins: 'numeric',
      role: 'text',
      email_verified: 'boolean',
      steam_id: 'text',
      created_at: 'timestamp',
    };

    const actualFields = {};
    userColumns.forEach(col => {
      actualFields[col.column_name] = col.data_type;
    });

    let missingFields = [];
    let extraFields = [];

    for (const [field, type] of Object.entries(expectedUserFields)) {
      if (!actualFields[field]) {
        missingFields.push(field);
        console.log(`  ❌ MISSING: ${field} (${type})`);
      } else {
        console.log(`  ✅ ${field}: ${actualFields[field]}`);
      }
    }

    for (const [field] of Object.entries(actualFields)) {
      if (!expectedUserFields[field]) {
        extraFields.push(field);
        console.log(`  ℹ️  EXTRA: ${field} (not in expected list)`);
      }
    }

    // 3. Check MATCHES table
    console.log('\n3️⃣ MATCHES TABLE');
    console.log('═'.repeat(70));
    
    if (tableNames.includes('matches')) {
      const matchColumns = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'matches'
        ORDER BY ordinal_position
      `;
      console.log(`✅ Exists with ${matchColumns.length} columns:`);
      matchColumns.forEach(c => console.log(`  • ${c.column_name}`));
    } else {
      console.log('❌ MISSING: matches table not found!');
    }

    // 4. Check MATCH_PLAYERS table
    console.log('\n4️⃣ MATCH_PLAYERS TABLE');
    console.log('═'.repeat(70));
    
    if (tableNames.includes('match_players')) {
      const playerColumns = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'match_players'
        ORDER BY ordinal_position
      `;
      console.log(`✅ Exists with ${playerColumns.length} columns:`);
      playerColumns.forEach(c => console.log(`  • ${c.column_name}`));
    } else {
      console.log('❌ MISSING: match_players table not found!');
    }

    // 5. Check COSMETICS tables
    console.log('\n5️⃣ COSMETICS TABLES');
    console.log('═'.repeat(70));
    
    const cosmeticTables = ['cosmetics', 'user_profiles', 'user_cosmetics'];
    for (const tableName of cosmeticTables) {
      if (tableNames.includes(tableName)) {
        const cols = await sql`
          SELECT COUNT(*) as count
          FROM information_schema.columns
          WHERE table_name = ${tableName}
        `;
        console.log(`  ✅ ${tableName}: exists with ${cols[0].count} columns`);
      } else {
        console.log(`  ❌ ${tableName}: MISSING`);
      }
    }

    // 6. Check ACHIEVEMENTS
    console.log('\n6️⃣ ACHIEVEMENTS TABLES');
    console.log('═'.repeat(70));
    
    const achievementTables = ['achievements', 'user_achievements'];
    for (const tableName of achievementTables) {
      if (tableNames.includes(tableName)) {
        const cols = await sql`
          SELECT COUNT(*) as count
          FROM information_schema.columns
          WHERE table_name = ${tableName}
        `;
        console.log(`  ✅ ${tableName}: exists`);
      } else {
        console.log(`  ❌ ${tableName}: MISSING`);
      }
    }

    // 7. Check MISSIONS
    console.log('\n7️⃣ MISSIONS TABLES');
    console.log('═'.repeat(70));
    
    const missionTables = ['missions', 'user_mission_progress'];
    for (const tableName of missionTables) {
      if (tableNames.includes(tableName)) {
        const cols = await sql`
          SELECT COUNT(*) as count
          FROM information_schema.columns
          WHERE table_name = ${tableName}
        `;
        console.log(`  ✅ ${tableName}: exists`);
      } else {
        console.log(`  ❌ ${tableName}: MISSING`);
      }
    }

    // 8. Check NOTIFICATIONS
    console.log('\n8️⃣ NOTIFICATIONS TABLE');
    console.log('═'.repeat(70));
    
    if (tableNames.includes('notifications')) {
      console.log('  ✅ notifications: exists');
    } else {
      console.log('  ❌ notifications: MISSING');
    }

    // 9. Check LEADERBOARDS
    console.log('\n9️⃣ LEADERBOARDS');
    console.log('═'.repeat(70));
    
    if (tableNames.includes('leaderboards')) {
      console.log('  ✅ leaderboards: exists');
    } else {
      console.log('  ⚠️  leaderboards: MISSING (can be computed from users table)');
    }

    // 10. Check ESR_THRESHOLDS
    console.log('\n🔟 ESR_THRESHOLDS TABLE');
    console.log('═'.repeat(70));
    
    if (tableNames.includes('esr_thresholds')) {
      const thresholds = await sql`SELECT COUNT(*) as count FROM esr_thresholds`;
      console.log(`  ✅ esr_thresholds: exists with ${thresholds[0].count} tier definitions`);
    } else {
      console.log('  ❌ esr_thresholds: MISSING');
    }

    // 11. SUMMARY
    console.log('\n📋 SUMMARY');
    console.log('═'.repeat(70));
    console.log(`Total Tables: ${tables.length}`);
    console.log(`Users table missing fields: ${missingFields.length}`);
    console.log(`Users table extra fields: ${extraFields.length}`);

    if (missingFields.length > 0) {
      console.log(`\n❌ MISSING FIELDS IN USERS TABLE:`);
      missingFields.forEach(f => console.log(`  • ${f}`));
    }

    console.log('\n✅ Audit complete!');
    
    await sql.end();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

auditCodebase();
