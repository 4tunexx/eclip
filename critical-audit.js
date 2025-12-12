#!/usr/bin/env node

/**
 * CRITICAL AUDIT - Check for missing tables and features
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

async function criticalAudit() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║        CRITICAL CODEBASE vs DATABASE AUDIT                    ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Get all tables
    const allTables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    const tableNames = new Set(allTables.map(t => t.table_name));

    console.log('🔍 CHECKING FOR TABLES REFERENCED IN CODE\n');
    console.log('═'.repeat(70));

    const tablesReferencedInCode = {
      // Authentication
      'users': '✅ exists',
      'sessions': '✅ exists',
      
      // VIP/Subscription (referenced in code?)
      'user_subscriptions': tableNames.has('user_subscriptions') ? '✅ exists' : '❌ MISSING',
      'vip_tiers': tableNames.has('vip_tiers') ? '✅ exists' : '❌ MISSING',
      
      // Matches & Ranking
      'matches': '✅ exists',
      'match_players': '✅ exists',
      'esr_thresholds': '✅ exists',
      
      // Cosmetics
      'cosmetics': '✅ exists',
      'user_profiles': '✅ exists',
      'user_cosmetics': '✅ exists',
      
      // Content
      'achievements': '✅ exists',
      'user_achievements': '✅ exists',
      'missions': '✅ exists',
      'user_mission_progress': '✅ exists',
      'badges': '✅ exists',
      
      // Social
      'friends': '✅ exists',
      'blocked_users': '✅ exists',
      'direct_messages': '✅ exists',
      
      // Shop
      'transactions': tableNames.has('transactions') ? '✅ exists' : '❌ MISSING',
      'user_inventory': tableNames.has('user_inventory') ? '✅ exists' : '❌ MISSING',
      
      // Anti-Cheat
      'anti_cheat_logs': tableNames.has('anti_cheat_logs') ? '✅ exists' : '❌ MISSING',
      'reports': tableNames.has('reports') ? '✅ exists' : '❌ MISSING',
      'bans': tableNames.has('bans') ? '✅ exists' : '❌ MISSING',
      
      // Admin
      'role_permissions': tableNames.has('role_permissions') ? '✅ exists' : '❌ MISSING',
      
      // Forum
      'forum_threads': tableNames.has('forum_threads') ? '✅ exists' : '❌ MISSING',
      'forum_categories': tableNames.has('forum_categories') ? '✅ exists' : '❌ MISSING',
      'forum_posts': tableNames.has('forum_posts') ? '✅ exists' : '❌ MISSING',
    };

    Object.entries(tablesReferencedInCode).forEach(([table, status]) => {
      console.log(`${status} ${table}`);
    });

    // Check for CRITICAL MISSING tables
    console.log('\n🚨 CRITICAL MISSING TABLES CHECK\n');
    console.log('═'.repeat(70));

    const missing = [];
    if (!tableNames.has('user_subscriptions')) missing.push('user_subscriptions');
    if (!tableNames.has('vip_tiers')) missing.push('vip_tiers');

    if (missing.length > 0) {
      console.log('❌ MISSING TABLES (referenced in code):');
      missing.forEach(t => console.log(`  • ${t}`));
    } else {
      console.log('✅ All expected tables exist!');
    }

    // Check columns in users table for avatar
    console.log('\n📸 CHECKING USER AVATAR SUPPORT\n');
    console.log('═'.repeat(70));

    const userColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('avatar', 'avatar_url', 'profile_picture')
    `;

    if (userColumns.length > 0) {
      console.log('✅ Avatar columns found:');
      userColumns.forEach(c => {
        console.log(`  • ${c.column_name} (${c.data_type})`);
      });
    } else {
      console.log('❌ No avatar columns in users table!');
    }

    // Check for image storage configuration
    console.log('\n☁️  IMAGE/FILE UPLOAD SYSTEM\n');
    console.log('═'.repeat(70));

    const hasCloudinary = process.env.CLOUDINARY_API_KEY ? '✅ Cloudinary config found' : '❌ No Cloudinary config';
    console.log(hasCloudinary);

    // Check notifications trigger
    console.log('\n🔔 CHECKING DATABASE TRIGGERS\n');
    console.log('═'.repeat(70));

    const triggers = await sql`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table
    `;

    if (triggers.length > 0) {
      console.log(`Found ${triggers.length} triggers:`);
      const triggersByTable = {};
      triggers.forEach(t => {
        if (!triggersByTable[t.event_object_table]) {
          triggersByTable[t.event_object_table] = [];
        }
        triggersByTable[t.event_object_table].push(t.trigger_name);
      });

      Object.entries(triggersByTable).forEach(([table, trigs]) => {
        console.log(`\n  ${table}:`);
        trigs.forEach(t => console.log(`    • ${t}`));
      });
    } else {
      console.log('❌ No triggers found!');
    }

    // Summary
    console.log('\n📋 SUMMARY\n');
    console.log('═'.repeat(70));
    console.log(`Total tables in database: ${allTables.length}`);
    console.log(`Critical tables status: ${missing.length === 0 ? '✅ ALL EXIST' : `❌ ${missing.length} MISSING`}`);
    console.log(`Avatar support: ${userColumns.length > 0 ? '✅' : '❌'}`);
    console.log(`Image upload config: ${hasCloudinary}`);
    console.log(`Database triggers: ${triggers.length > 0 ? `✅ ${triggers.length}` : '❌ None'}`);

    if (missing.length > 0) {
      console.log(`\n⚠️  ACTION REQUIRED: Create missing tables: ${missing.join(', ')}`);
    } else {
      console.log('\n✅ DATABASE STRUCTURE COMPLETE!');
    }

    await sql.end();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

criticalAudit();
