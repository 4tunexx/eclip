#!/usr/bin/env node

/**
 * COMPLETE DATABASE SCAN - Everything!
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

async function fullDatabaseScan() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║           COMPLETE NEON DATABASE FULL SCAN                     ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Get ALL tables with row counts
    console.log('📊 ALL TABLES IN DATABASE');
    console.log('═'.repeat(70));
    
    const allTables = await sql`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name=t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`Found ${allTables.length} tables:\n`);

    const tableRows = {};
    
    for (const table of allTables) {
      try {
        const countResult = await sql.unsafe(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
        const count = countResult[0].count;
        tableRows[table.table_name] = count;
        
        const indicator = count === 0 ? '⚠️ ' : '✅';
        console.log(`${indicator} ${table.table_name.padEnd(35)} Columns: ${String(table.column_count).padEnd(3)} Rows: ${count}`);
      } catch (e) {
        console.log(`❌ ${table.table_name.padEnd(35)} ERROR: ${e.message.substring(0, 40)}`);
      }
    }

    // Check for CRITICAL missing tables
    console.log('\n🔍 CHECKING CRITICAL TABLES');
    console.log('═'.repeat(70));
    
    const criticalTables = [
      'users',
      'matches',
      'match_players',
      'cosmetics',
      'user_profiles',
      'user_cosmetics',
      'achievements',
      'user_achievements',
      'missions',
      'user_mission_progress',
      'notifications',
      'leaderboards',
      'esr_thresholds',
      'friends',
      'blocked_users',
      'sessions',
    ];

    const missing = [];
    const existing = [];

    for (const table of criticalTables) {
      if (tableRows[table] !== undefined) {
        existing.push({ table, rows: tableRows[table] });
      } else {
        missing.push(table);
      }
    }

    console.log('\n✅ EXISTING CRITICAL TABLES:');
    existing.forEach(t => {
      console.log(`  • ${t.table.padEnd(30)} (${t.rows} rows)`);
    });

    if (missing.length > 0) {
      console.log('\n❌ MISSING CRITICAL TABLES:');
      missing.forEach(t => {
        console.log(`  • ${t}`);
      });
    } else {
      console.log('\n✅ ALL CRITICAL TABLES EXIST!');
    }

    // Sample data from key tables
    console.log('\n📋 SAMPLE DATA FROM KEY TABLES');
    console.log('═'.repeat(70));

    if (tableRows['users'] > 0) {
      console.log('\n1️⃣ USERS TABLE:');
      const users = await sql`
        SELECT id, username, level, xp, esr, rank_tier, rank_division, role, email_verified
        FROM "users"
        LIMIT 5
      `;
      
      if (users.length > 0) {
        console.log(`Found ${tableRows['users']} total users\n`);
        users.forEach((u, i) => {
          console.log(`${i + 1}. ${u.username} | L${u.level} | XP:${u.xp} | ESR:${u.esr} | Rank:${u.rank_tier}${u.rank_division} | Role:${u.role} | Verified:${u.email_verified}`);
        });
      }
    }

    if (tableRows['matches'] > 0) {
      console.log(`\n2️⃣ MATCHES TABLE: ${tableRows['matches']} total matches`);
      const matches = await sql`
        SELECT id, map, status, started_at, winner_team
        FROM matches
        LIMIT 3
      `;
      matches.forEach((m, i) => {
        console.log(`${i + 1}. ${m.map} | Status:${m.status} | Winner:${m.winner_team} | Started:${m.started_at}`);
      });
    } else {
      console.log('\n2️⃣ MATCHES TABLE: 0 matches');
    }

    if (tableRows['cosmetics'] > 0) {
      console.log(`\n3️⃣ COSMETICS TABLE: ${tableRows['cosmetics']} total cosmetics`);
      const cosmetics = await sql`
        SELECT type, rarity, COUNT(*) as count
        FROM cosmetics
        GROUP BY type, rarity
        ORDER BY type, rarity
      `;
      cosmetics.forEach(c => {
        console.log(`  ${c.type.padEnd(15)} ${c.rarity.padEnd(10)} = ${c.count}`);
      });
    }

    if (tableRows['achievements'] > 0) {
      console.log(`\n4️⃣ ACHIEVEMENTS TABLE: ${tableRows['achievements']} total`);
    } else {
      console.log('\n4️⃣ ACHIEVEMENTS TABLE: 0 achievements');
    }

    if (tableRows['missions'] > 0) {
      console.log(`\n5️⃣ MISSIONS TABLE: ${tableRows['missions']} total`);
    } else {
      console.log('\n5️⃣ MISSIONS TABLE: 0 missions');
    }

    if (tableRows['esr_thresholds'] > 0) {
      console.log(`\n6️⃣ ESR_THRESHOLDS TABLE: ${tableRows['esr_thresholds']} tier definitions`);
    }

    if (tableRows['notifications'] > 0) {
      console.log(`\n7️⃣ NOTIFICATIONS TABLE: ${tableRows['notifications']} total`);
    } else {
      console.log('\n7️⃣ NOTIFICATIONS TABLE: 0 notifications');
    }

    // Summary
    console.log('\n📊 SUMMARY');
    console.log('═'.repeat(70));
    console.log(`Total tables: ${allTables.length}`);
    console.log(`Critical tables present: ${existing.length}/${criticalTables.length}`);
    console.log(`Missing critical tables: ${missing.length}`);
    console.log(`Total users: ${tableRows['users'] || 0}`);
    console.log(`Total matches: ${tableRows['matches'] || 0}`);
    console.log(`Total cosmetics: ${tableRows['cosmetics'] || 0}`);

    if (missing.length === 0) {
      console.log('\n✅ DATABASE IS COMPLETE - ALL CRITICAL TABLES EXIST!');
    } else {
      console.log(`\n⚠️  MISSING TABLES: ${missing.join(', ')}`);
    }

    await sql.end();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

fullDatabaseScan();
