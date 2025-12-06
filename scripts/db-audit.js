#!/usr/bin/env node
require('dotenv').config();
const postgres = require('postgres');

const EXPECTED_TABLES = [
  'ac_events', 'achievements', 'bans', 'cosmetics', 'forum_categories',
  'forum_posts', 'forum_threads', 'match_players', 'matches', 'missions',
  'notifications', 'queue_tickets', 'sessions', 'site_config', 'transactions',
  'user_achievements', 'user_inventory', 'user_mission_progress', 'user_profiles', 'users'
];

const EXPECTED_ENUMS = [
  'cosmetic_type', 'match_status', 'mission_type', 'queue_status', 'rarity', 'user_role'
];

async function audit() {
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  
  try {
    console.log('\n📊 ECLIP DATABASE AUDIT REPORT');
    console.log('═'.repeat(70));

    // 1. Check all tables
    console.log('\n1️⃣  TABLE STATUS');
    console.log('─'.repeat(70));
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const foundTables = new Set(tables.map(t => t.table_name));
    let missingCount = 0;
    
    for (const table of EXPECTED_TABLES) {
      const status = foundTables.has(table) ? '✅' : '❌';
      console.log(`   ${status} ${table}`);
      if (!foundTables.has(table)) missingCount++;
    }
    
    console.log(`\n   📈 Found: ${foundTables.size} tables`);
    console.log(`   🎯 Expected: ${EXPECTED_TABLES.length} tables`);
    console.log(`   ⚠️  Missing: ${missingCount} tables`);

    // 2. Check enums
    console.log('\n2️⃣  ENUM TYPES');
    console.log('─'.repeat(70));
    const enums = await sql`
      SELECT type_name FROM information_schema.user_defined_types 
      WHERE user_defined_type_schema = 'public'
      ORDER BY type_name
    `;
    
    const foundEnums = new Set(enums.map(e => e.type_name));
    for (const enumType of EXPECTED_ENUMS) {
      const status = foundEnums.has(enumType) ? '✅' : '❌';
      console.log(`   ${status} ${enumType}`);
    }

    // 3. Check users table structure
    console.log('\n3️⃣  USERS TABLE COLUMNS');
    console.log('─'.repeat(70));
    const columns = await sql`
      SELECT column_name, data_type, is_nullable FROM information_schema.columns
      WHERE table_name = 'users' ORDER BY ordinal_position
    `;
    
    console.log(`   Found ${columns.length} columns:`);
    for (const col of columns) {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`     • ${col.column_name.padEnd(25)} (${col.data_type.padEnd(15)} ${nullable})`);
    }

    // 4. Check admin user
    console.log('\n4️⃣  ADMIN USER');
    console.log('─'.repeat(70));
    const admin = await sql`
      SELECT id, email, username, role, level, xp, coins, created_at FROM users 
      WHERE role = 'ADMIN' LIMIT 1
    `;
    
    if (admin.length > 0) {
      const a = admin[0];
      console.log(`   ✅ Admin account exists!`);
      console.log(`     • Email: ${a.email}`);
      console.log(`     • Username: ${a.username}`);
      console.log(`     • Role: ${a.role}`);
      console.log(`     • Level: ${a.level}`);
      console.log(`     • XP: ${a.xp}`);
      console.log(`     • Coins: ${a.coins}`);
      console.log(`     • Created: ${a.created_at}`);
    } else {
      console.log(`   ❌ No admin user found!`);
      console.log(`   📝 You can create one with: node scripts/add-admin.js`);
    }

    // 5. User statistics
    console.log('\n5️⃣  USER STATISTICS');
    console.log('─'.repeat(70));
    const stats = await sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'VIP' THEN 1 END) as vip,
        COUNT(CASE WHEN email_verified THEN 1 END) as verified
      FROM users
    `;
    
    if (stats.length > 0) {
      const s = stats[0];
      console.log(`   Total Users: ${s.total_users}`);
      console.log(`   Admins: ${s.admins}`);
      console.log(`   VIP Users: ${s.vip}`);
      console.log(`   Verified Emails: ${s.verified}`);
    }

    // 6. Table row counts
    console.log('\n6️⃣  TABLE ROW COUNTS');
    console.log('─'.repeat(70));
    for (const table of EXPECTED_TABLES) {
      if (foundTables.has(table)) {
        const count = await sql.unsafe(`SELECT COUNT(*) as cnt FROM "${table}"`);
        const num = count[0].cnt;
        const icon = num > 0 ? '📊' : '📭';
        console.log(`   ${icon} ${table.padEnd(25)} ${num} rows`);
      }
    }

    // 7. Database info
    console.log('\n7️⃣  DATABASE INFO');
    console.log('─'.repeat(70));
    const dbInfo = await sql`
      SELECT datname as db_name, pg_size_pretty(pg_database_size(datname)) as size 
      FROM pg_database WHERE datname = current_database()
    `;
    
    if (dbInfo.length > 0) {
      const db = dbInfo[0];
      console.log(`   Database: ${db.db_name}`);
      console.log(`   Size: ${db.size}`);
    }

    // 8. Admin Login Credentials
    console.log('\n8️⃣  ADMIN LOGIN CREDENTIALS');
    console.log('─'.repeat(70));
    console.log(`   📧 Email: admin@eclip.pro`);
    console.log(`   🔐 Password: Admin123!`);
    console.log(`   🌐 Login at: www.eclip.pro/login`);
    console.log(`   🔑 Admin Panel: www.eclip.pro/admin`);

    console.log('\n✅ AUDIT COMPLETE\n');

  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

audit();
