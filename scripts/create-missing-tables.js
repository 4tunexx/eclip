#!/usr/bin/env node
import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  
  try {
    console.log('\n🏗️  CREATING MISSING TABLES\n');
    console.log('═'.repeat(70));
    
    // 1. Create sessions table
    console.log('\n1️⃣  Creating sessions table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `);
    console.log('   ✅ Created sessions');
    
    // 2. Create user_profiles table
    console.log('\n2️⃣  Creating user_profiles table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        title TEXT,
        equipped_frame_id UUID,
        equipped_banner_id UUID,
        equipped_badge_id UUID,
        stats JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `);
    console.log('   ✅ Created user_profiles');
    
    // 3. Create user_inventory table
    console.log('\n3️⃣  Creating user_inventory table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS user_inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        cosmetic_id UUID NOT NULL REFERENCES cosmetics(id) ON DELETE CASCADE,
        purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `);
    console.log('   ✅ Created user_inventory');
    
    // 4. Create match_players table
    console.log('\n4️⃣  Creating match_players table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS match_players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        team INTEGER NOT NULL,
        kills INTEGER DEFAULT 0,
        deaths INTEGER DEFAULT 0,
        assists INTEGER DEFAULT 0,
        hs_percentage INTEGER DEFAULT 0,
        mvps INTEGER DEFAULT 0,
        adr NUMERIC(5, 2),
        is_winner BOOLEAN DEFAULT false,
        is_leaver BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `);
    console.log('   ✅ Created match_players');
    
    // 5. Create queue_tickets table
    console.log('\n5️⃣  Creating queue_tickets table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS queue_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'WAITING' NOT NULL,
        region TEXT NOT NULL,
        esr_at_join INTEGER NOT NULL,
        match_id UUID REFERENCES matches(id),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        matched_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `);
    console.log('   ✅ Created queue_tickets');
    
    // 6. Create forum_threads table
    console.log('\n6️⃣  Creating forum_threads table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS forum_threads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        is_pinned BOOLEAN DEFAULT false,
        is_locked BOOLEAN DEFAULT false,
        views INTEGER DEFAULT 0,
        reply_count INTEGER DEFAULT 0,
        last_reply_at TIMESTAMP WITH TIME ZONE,
        last_reply_author_id UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `);
    console.log('   ✅ Created forum_threads');
    
    // 7. Create forum_posts table
    console.log('\n7️⃣  Creating forum_posts table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS forum_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `);
    console.log('   ✅ Created forum_posts');
    
    // 8. Create ac_events table
    console.log('\n8️⃣  Creating ac_events table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS ac_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        severity INTEGER NOT NULL,
        details JSONB,
        reviewed BOOLEAN DEFAULT false,
        reviewed_by UUID REFERENCES users(id),
        reviewed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `);
    console.log('   ✅ Created ac_events');
    
    // 9. Create bans table
    console.log('\n9️⃣  Creating bans table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS bans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        type TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE,
        banned_by UUID REFERENCES users(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `);
    console.log('   ✅ Created bans');
    
    // 10. Create notifications table
    console.log('\n🔟 Creating notifications table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        data JSONB,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `);
    console.log('   ✅ Created notifications');
    
    // 11. Create site_config table
    console.log('\n1️⃣1️⃣  Creating site_config table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS site_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT NOT NULL UNIQUE,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updated_by UUID REFERENCES users(id)
      )
    `);
    console.log('   ✅ Created site_config');
    
    // 12. Create transactions table
    console.log('\n1️⃣2️⃣  Creating transactions table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        description TEXT,
        reference_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `);
    console.log('   ✅ Created transactions');
    
    // 13. Create achievement_progress table
    console.log('\n1️⃣3️⃣  Creating achievement_progress table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS achievement_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
        current_progress INTEGER DEFAULT 0 NOT NULL,
        unlocked_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `);
    console.log('   ✅ Created achievement_progress');
    
    // 14. Create user_metrics table
    console.log('\n1️⃣4️⃣  Creating user_metrics table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS user_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        wins_today INTEGER DEFAULT 0,
        matches_today INTEGER DEFAULT 0,
        assists_today INTEGER DEFAULT 0,
        hs_kills_today INTEGER DEFAULT 0,
        dashboard_visit_today BOOLEAN DEFAULT false,
        kills_total INTEGER DEFAULT 0,
        hs_kills INTEGER DEFAULT 0,
        clutches_won INTEGER DEFAULT 0,
        bomb_plants INTEGER DEFAULT 0,
        bomb_defuses INTEGER DEFAULT 0,
        assists_total INTEGER DEFAULT 0,
        damage_total INTEGER DEFAULT 0,
        aces_done INTEGER DEFAULT 0,
        last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      )
    `);
    console.log('   ✅ Created user_metrics');
    
    console.log('\n' + '═'.repeat(70));
    console.log('✅ ALL MISSING TABLES CREATED!\n');
    
  } catch (error) {
    console.error('❌ Error:', error?.message || error);
    process.exit(1);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
