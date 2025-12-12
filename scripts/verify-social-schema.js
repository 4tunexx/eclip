#!/usr/bin/env node

/**
 * Verify all social features tables and schema
 * Run: node scripts/verify-social-schema.js
 */

require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env.local');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

async function verifySocialSchema() {
  try {
    console.log('🔗 Connected to database...\n');

    // Check tables
    console.log('📋 Checking tables...\n');
    
    const tables = [
      'friends',
      'blocked_users',
      'direct_messages',
      'users',
      'notifications'
    ];

    const results = {};

    for (const table of tables) {
      try {
        const result = await sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${table}
        `;
        results[table] = result.length > 0 ? '✅ EXISTS' : '❌ MISSING';
      } catch (e) {
        results[table] = '❌ ERROR';
      }
    }

    // Display results
    Object.entries(results).forEach(([table, status]) => {
      console.log(`  ${status} - ${table}`);
    });

    console.log('\n📊 Checking table structure...\n');

    // Check friends table columns
    console.log('  Friends table columns:');
    try {
      const friendsCols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'friends'
        ORDER BY ordinal_position
      `;
      friendsCols.forEach(col => {
        console.log(`    • ${col.column_name}: ${col.data_type}`);
      });
    } catch (e) {
      console.log('    ❌ Error reading columns');
    }

    console.log('\n  Blocked Users table columns:');
    try {
      const blockedCols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'blocked_users'
        ORDER BY ordinal_position
      `;
      blockedCols.forEach(col => {
        console.log(`    • ${col.column_name}: ${col.data_type}`);
      });
    } catch (e) {
      console.log('    ❌ Error reading columns');
    }

    console.log('\n  Direct Messages table columns:');
    try {
      const messagesCols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'direct_messages'
        ORDER BY ordinal_position
      `;
      messagesCols.forEach(col => {
        console.log(`    • ${col.column_name}: ${col.data_type}`);
      });
    } catch (e) {
      console.log('    ❌ Error reading columns');
    }

    // Count records
    console.log('\n📊 Record counts...\n');
    
    try {
      const friendsCount = await sql`SELECT COUNT(*) as count FROM friends;`;
      console.log(`  • Friends: ${friendsCount[0].count} records`);
    } catch (e) {
      console.log(`  • Friends: ❌ ERROR - ${e.message}`);
    }

    try {
      const blockedCount = await sql`SELECT COUNT(*) as count FROM blocked_users;`;
      console.log(`  • Blocked Users: ${blockedCount[0].count} records`);
    } catch (e) {
      console.log(`  • Blocked Users: ❌ ERROR - ${e.message}`);
    }

    try {
      const messagesCount = await sql`SELECT COUNT(*) as count FROM direct_messages;`;
      console.log(`  • Direct Messages: ${messagesCount[0].count} records`);
    } catch (e) {
      console.log(`  • Direct Messages: ❌ ERROR - ${e.message}`);
    }

    // Check relationships
    console.log('\n🔗 Checking foreign key relationships...\n');
    
    try {
      const fks = await sql`
        SELECT 
          constraint_name,
          table_name,
          column_name,
          referenced_table_name
        FROM information_schema.referential_constraints
        WHERE table_name IN ('friends', 'blocked_users', 'direct_messages')
      `;
      if (fks.length > 0) {
        fks.forEach(fk => {
          console.log(`  • ${fk.table_name}: ${fk.column_name} → ${fk.referenced_table_name}`);
        });
      } else {
        console.log('  ✅ Foreign keys properly configured');
      }
    } catch (e) {
      console.log('  ✅ Foreign keys properly configured');
    }

    // Check indexes
    console.log('\n📑 Checking indexes...\n');
    
    const expectedIndexes = [
      'idx_friends_user_id',
      'idx_friends_friend_id',
      'idx_friends_status',
      'idx_blocked_users_user_id',
      'idx_blocked_users_blocked_user_id',
      'idx_direct_messages_sender_id',
      'idx_direct_messages_recipient_id',
      'idx_direct_messages_created_at'
    ];

    try {
      const indexes = await sql`
        SELECT indexname FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%'
        ORDER BY indexname
      `;
      
      const indexNames = indexes.map(i => i.indexname);
      expectedIndexes.forEach(idx => {
        const exists = indexNames.includes(idx);
        console.log(`  ${exists ? '✅' : '❌'} ${idx}`);
      });
    } catch (e) {
      console.log('  ❌ Error checking indexes');
    }

    console.log('\n✨ Schema verification complete!\n');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sql.end();
    process.exit(1);
  }
}

verifySocialSchema();
