#!/usr/bin/env node

/**
 * Create missing tables: friends and verify blocked_users
 * Run: node scripts/create-social-tables.js
 */

require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env.local');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

async function createSocialTables() {
  try {
    console.log('🔗 Connected to database...\n');

    // Create friends table
    console.log('📋 Creating friends table...');
    await sql`
      CREATE TABLE IF NOT EXISTS friends (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'accepted' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(user_id, friend_id)
      );
    `;
    console.log('✅ Friends table created\n');

    // Create indexes for friends
    console.log('📊 Creating friends indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);`;
    console.log('✅ Friends indexes created\n');

    // Verify/Create blocked_users table
    console.log('📋 Creating blocked_users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS blocked_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(user_id, blocked_user_id)
      );
    `;
    console.log('✅ Blocked users table created\n');

    // Create indexes for blocked_users
    console.log('📊 Creating blocked_users indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_blocked_users_user_id ON blocked_users(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_user_id ON blocked_users(blocked_user_id);`;
    console.log('✅ Blocked users indexes created\n');

    // Verify direct_messages table
    console.log('📋 Verifying direct_messages table...');
    await sql`
      CREATE TABLE IF NOT EXISTS direct_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    console.log('✅ Direct messages table verified\n');

    // Create indexes for direct_messages
    console.log('📊 Creating direct_messages indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id ON direct_messages(sender_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient_id ON direct_messages(recipient_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON direct_messages(created_at DESC);`;
    console.log('✅ Direct messages indexes created\n');

    // Count records in each table
    console.log('📊 Checking table records...\n');
    
    const friendsCount = await sql`SELECT COUNT(*) FROM friends;`;
    console.log(`  • Friends: ${friendsCount[0].count} records`);
    
    const blockedCount = await sql`SELECT COUNT(*) FROM blocked_users;`;
    console.log(`  • Blocked Users: ${blockedCount[0].count} records`);
    
    const messagesCount = await sql`SELECT COUNT(*) FROM direct_messages;`;
    console.log(`  • Direct Messages: ${messagesCount[0].count} records`);

    console.log('\n✨ All social tables created successfully!\n');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    await sql.end();
    process.exit(1);
  }
}

createSocialTables();
