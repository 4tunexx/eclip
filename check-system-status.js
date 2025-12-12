#!/usr/bin/env node

/**
 * Database Status Check
 * Displays all tables, environment variables, and system status
 */

const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env.local not found!');
      process.exit(1);
    }

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
      console.error('❌ DATABASE_URL not found in .env.local!');
      process.exit(1);
    }

    const postgres = require('postgres');
    const sql = postgres(DATABASE_URL, { max: 1 });

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║           DATABASE & ENVIRONMENT STATUS REPORT                ║');
    console.log('║                    December 12, 2025                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // 1. ENVIRONMENT VARIABLES
    console.log('1️⃣  ENVIRONMENT VARIABLES (.env.local)');
    console.log('═'.repeat(70));
    
    const criticalEnvVars = [
      'DATABASE_URL',
      'NODE_ENV',
      'JWT_SECRET',
      'SESSION_SECRET',
      'CLOUDINARY_CLOUD_NAME',
      'SENDGRID_API_KEY',
      'STEAM_API_KEY',
      'API_BASE_URL'
    ];

    let envOk = 0;
    criticalEnvVars.forEach(key => {
      if (process.env[key]) {
        envOk++;
        const value = process.env[key];
        const display = value.length > 45 ? value.substring(0, 42) + '...' : value;
        console.log(`  ✅ ${key.padEnd(25)} = ${display}`);
      } else {
        console.log(`  ❌ ${key.padEnd(25)} = NOT SET`);
      }
    });
    console.log(`\n  Status: ${envOk}/${criticalEnvVars.length} environment variables set\n`);

    // 2. DATABASE TABLES
    console.log('2️⃣  DATABASE TABLES');
    console.log('═'.repeat(70));
    
    const tables = await sql`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name=t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`Found ${tables.length} tables:\n`);

    const tableNames = new Set();
    tables.forEach((t, i) => {
      tableNames.add(t.table_name);
      const num = String(i + 1).padStart(2, ' ');
      console.log(`  ${num}. ${t.table_name.padEnd(30)} (${t.column_count} columns)`);
    });

    // 3. CRITICAL TABLES CHECK
    console.log('\n3️⃣  CRITICAL TABLES CHECK');
    console.log('═'.repeat(70));
    
    const criticalTables = [
      'users',
      'sessions',
      'matches',
      'match_players',
      'cosmetics',
      'user_profiles',
      'role_permissions',
      'vip_subscriptions',
      'esr_thresholds',
      'achievements',
      'user_achievements',
      'missions',
      'user_mission_progress',
      'notifications',
      'user_cosmetics',
      'leaderboards'
    ];

    let criticalOk = 0;
    let missing = [];

    criticalTables.forEach(table => {
      if (tableNames.has(table)) {
        criticalOk++;
        console.log(`  ✅ ${table}`);
      } else {
        missing.push(table);
        console.log(`  ❌ ${table}`);
      }
    });

    console.log(`\n  Status: ${criticalOk}/${criticalTables.length} critical tables present\n`);

    // 4. USERS DATA
    console.log('4️⃣  USERS TABLE DATA');
    console.log('═'.repeat(70));
    
    const userCount = await sql`SELECT COUNT(*) as count FROM "users"`;
    const roleDistribution = await sql`
      SELECT role, COUNT(*) as count 
      FROM "users" 
      GROUP BY role 
      ORDER BY count DESC
    `;
    
    console.log(`Total Users: ${userCount[0].count}\n`);
    console.log('Role Distribution:');
    roleDistribution.forEach(r => {
      console.log(`  • ${r.role.padEnd(15)}: ${r.count}`);
    });

    // 5. ROLE PERMISSIONS
    console.log('\n5️⃣  ROLE PERMISSIONS');
    console.log('═'.repeat(70));
    
    const rolePerms = await sql`
      SELECT DISTINCT role 
      FROM role_permissions 
      ORDER BY role
    `;
    
    console.log(`Defined Roles:\n`);
    rolePerms.forEach(r => {
      console.log(`  • ${r.role}`);
    });

    // 6. VIP SYSTEM
    console.log('\n6️⃣  VIP SYSTEM STATUS');
    console.log('═'.repeat(70));
    
    if (tableNames.has('vip_subscriptions')) {
      const vipCount = await sql`
        SELECT COUNT(*) as count FROM vip_subscriptions WHERE status = 'active'
      `;
      const vipUsers = await sql`
        SELECT COUNT(*) as count FROM "users" WHERE is_vip = true
      `;
      console.log(`  ✅ VIP Subscriptions Table: EXISTS`);
      console.log(`  Active VIP Subscriptions: ${vipCount[0].count}`);
      console.log(`  VIP Users: ${vipUsers[0].count}`);
    } else {
      console.log(`  ❌ VIP Subscriptions Table: MISSING`);
    }

    // 7. COSMETICS DATA
    console.log('\n7️⃣  COSMETICS INVENTORY');
    console.log('═'.repeat(70));
    
    const cosmeticCount = await sql`SELECT COUNT(*) as count FROM cosmetics`;
    const cosmeticsByType = await sql`
      SELECT type, COUNT(*) as count 
      FROM cosmetics 
      GROUP BY type 
      ORDER BY count DESC
    `;
    
    console.log(`Total Cosmetics: ${cosmeticCount[0].count}\n`);
    cosmeticsByType.forEach(c => {
      console.log(`  • ${c.type}: ${c.count}`);
    });

    // 8. ACHIEVEMENTS
    console.log('\n8️⃣  ACHIEVEMENTS SYSTEM');
    console.log('═'.repeat(70));
    
    const achievementCount = await sql`SELECT COUNT(*) as count FROM achievements`;
    const userAchievements = await sql`SELECT COUNT(*) as count FROM user_achievements`;
    
    console.log(`Total Achievement Types: ${achievementCount[0].count}`);
    console.log(`User Achievements Unlocked: ${userAchievements[0].count}`);

    // 9. MISSIONS
    console.log('\n9️⃣  MISSIONS SYSTEM');
    console.log('═'.repeat(70));
    
    const missionCount = await sql`SELECT COUNT(*) as count FROM missions`;
    const userMissions = await sql`SELECT COUNT(*) as count FROM user_mission_progress`;
    
    console.log(`Total Mission Types: ${missionCount[0].count}`);
    console.log(`User Mission Progress: ${userMissions[0].count}`);

    // 10. SUMMARY
    console.log('\n📊 OVERALL SUMMARY');
    console.log('═'.repeat(70));
    console.log(`✅ Database Connected: YES`);
    console.log(`✅ Total Tables: ${tables.length}`);
    console.log(`✅ Critical Tables: ${criticalOk}/${criticalTables.length}`);
    console.log(`✅ Environment Variables: ${envOk}/${criticalEnvVars.length}`);
    console.log(`✅ Total Users: ${userCount[0].count}`);
    console.log(`✅ Cosmetics Available: ${cosmeticCount[0].count}`);

    if (missing.length > 0) {
      console.log(`\n⚠️  Missing Tables: ${missing.join(', ')}`);
    } else {
      console.log(`\n✅ ALL SYSTEMS OPERATIONAL!`);
    }

    console.log('\n✅ STATUS CHECK COMPLETE!\n');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
