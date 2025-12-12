#!/usr/bin/env node

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

async function checkDB() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║           DATABASE & ENVIRONMENT CHECK                        ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // 1. CHECK ENVIRONMENT VARIABLES
    console.log('1️⃣  ENVIRONMENT VARIABLES');
    console.log('═'.repeat(70));
    
    const envKeys = [
      'DATABASE_URL', 'JWT_SECRET', 'SESSION_SECRET',
      'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY',
      'SENDGRID_API_KEY', 'SENDGRID_FROM',
      'STEAM_API_KEY', 'STEAM_REALM',
      'NODE_ENV', 'API_BASE_URL'
    ];

    envKeys.forEach(key => {
      const value = process.env[key];
      if (value) {
        const display = value.length > 50 ? value.substring(0, 47) + '...' : value;
        console.log(`  ✅ ${key.padEnd(25)} = ${display}`);
      } else {
        console.log(`  ❌ ${key.padEnd(25)} = NOT SET`);
      }
    });

    // 2. CHECK ALL TABLES
    console.log('\n2️⃣  DATABASE TABLES');
    console.log('═'.repeat(70));
    
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`Found ${tables.length} tables:\n`);

    const tableNames = new Set();
    tables.forEach((t, i) => {
      tableNames.add(t.table_name);
      console.log(`  ${String(i+1).padStart(2)}. ${t.table_name}`);
    });

    // 3. CRITICAL TABLES CHECK
    console.log('\n3️⃣  CRITICAL TABLES CHECK');
    console.log('═'.repeat(70));
    
    const criticalTables = [
      'users', 'sessions', 'matches', 'match_players',
      'cosmetics', 'user_profiles', 'achievements',
      'user_achievements', 'missions', 'user_mission_progress',
      'notifications', 'esr_thresholds', 'role_permissions',
      'vip_subscriptions', 'user_cosmetics', 'leaderboards'
    ];

    let missing = [];
    let existing = [];

    criticalTables.forEach(table => {
      if (tableNames.has(table)) {
        existing.push(table);
        console.log(`  ✅ ${table}`);
      } else {
        missing.push(table);
        console.log(`  ❌ ${table}`);
      }
    });

    // 4. USERS TABLE - COLUMNS & DATA
    console.log('\n4️⃣  USERS TABLE DETAILS');
    console.log('═'.repeat(70));
    
    const userColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;

    console.log(`Columns (${userColumns.length}):\n`);
    userColumns.forEach(col => {
      console.log(`  • ${col.column_name.padEnd(25)} (${col.data_type})`);
    });

    const userCount = await sql`SELECT COUNT(*) as count FROM "users"`;
    const roleDistribution = await sql`SELECT role, COUNT(*) as count FROM "users" GROUP BY role ORDER BY count DESC`;
    
    console.log(`\nData Summary:`);
    console.log(`  Total Users: ${userCount[0].count}`);
    console.log(`  Roles:`);
    roleDistribution.forEach(r => {
      console.log(`    • ${r.role}: ${r.count}`);
    });

    // 5. ROLE PERMISSIONS TABLE
    console.log('\n5️⃣  ROLE PERMISSIONS TABLE');
    console.log('═'.repeat(70));
    
    const rolePerms = await sql`SELECT DISTINCT role FROM role_permissions ORDER BY role`;
    console.log(`Defined Roles:\n`);
    rolePerms.forEach(r => {
      console.log(`  • ${r.role}`);
    });

    // 6. VIP TABLES CHECK
    console.log('\n6️⃣  VIP SYSTEM TABLES');
    console.log('═'.repeat(70));
    
    if (tableNames.has('vip_subscriptions')) {
      const vipCount = await sql`SELECT COUNT(*) as count FROM vip_subscriptions`;
      console.log(`  ✅ vip_subscriptions: ${vipCount[0].count} records`);
    } else {
      console.log(`  ❌ vip_subscriptions: MISSING`);
    }

    // 7. SUMMARY
    console.log('\n📊 SUMMARY');
    console.log('═'.repeat(70));
    console.log(`✅ Total Tables: ${tables.length}`);
    console.log(`✅ Critical Tables Present: ${existing.length}/${criticalTables.length}`);
    if (missing.length > 0) {
      console.log(`❌ Missing Critical Tables: ${missing.length}`);
      console.log(`   ${missing.join(', ')}`);
    } else {
      console.log(`✅ All Critical Tables Present!`);
    }
    console.log(`\n✅ DATABASE CHECK COMPLETE!`);

    await sql.end();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkDB();
