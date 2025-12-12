#!/usr/bin/env node

/**
 * CREATE MISSING VIP TABLES
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

async function createVIPTables() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('📦 CREATING VIP SYSTEM TABLES');
    console.log('═'.repeat(70));

    // 1. Create vip_tiers table
    console.log('\n1️⃣ Creating vip_tiers table...');
    
    try {
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS vip_tiers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL UNIQUE,
          level INTEGER NOT NULL UNIQUE,
          monthly_price NUMERIC NOT NULL,
          yearly_price NUMERIC NOT NULL,
          benefits JSONB DEFAULT '{}',
          cosmetics_unlock INTEGER DEFAULT 0,
          xp_boost NUMERIC DEFAULT 1.0,
          coins_boost NUMERIC DEFAULT 1.0,
          priority_queue BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      console.log('  ✅ vip_tiers table created');
      
      // Insert default tiers
      await sql.unsafe(`
        INSERT INTO vip_tiers (name, level, monthly_price, yearly_price, benefits, xp_boost, coins_boost, priority_queue)
        VALUES
          ('Bronze VIP', 1, 4.99, 49.99, '{"badge": "Bronze VIP", "chat_color": "#CD7F32"}', 1.1, 1.05, false),
          ('Silver VIP', 2, 9.99, 99.99, '{"badge": "Silver VIP", "chat_color": "#C0C0C0"}', 1.25, 1.1, true),
          ('Gold VIP', 3, 19.99, 199.99, '{"badge": "Gold VIP", "chat_color": "#FFD700"}', 1.5, 1.2, true),
          ('Platinum VIP', 4, 49.99, 499.99, '{"badge": "Platinum VIP", "chat_color": "#E5E4E2"}', 2.0, 1.5, true)
        ON CONFLICT (name) DO NOTHING;
      `);
      console.log('  ✅ Default VIP tiers inserted');
      
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('  ℹ️  vip_tiers table already exists');
      } else {
        console.log('  ⚠️  Error:', err.message.substring(0, 80));
      }
    }

    // 2. Create user_subscriptions table
    console.log('\n2️⃣ Creating user_subscriptions table...');
    
    try {
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS user_subscriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
          vip_tier_id UUID NOT NULL REFERENCES vip_tiers(id) ON DELETE CASCADE,
          subscription_type TEXT NOT NULL, -- 'monthly' or 'yearly'
          started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          auto_renew BOOLEAN DEFAULT TRUE,
          payment_method TEXT,
          amount_paid NUMERIC NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          cancelled_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, vip_tier_id)
        );
        CREATE INDEX IF NOT EXISTS idx_user_subs_user ON user_subscriptions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_subs_expires ON user_subscriptions(expires_at);
        CREATE INDEX IF NOT EXISTS idx_user_subs_active ON user_subscriptions(is_active);
      `);
      console.log('  ✅ user_subscriptions table created with indexes');
      
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('  ℹ️  user_subscriptions table already exists');
      } else {
        console.log('  ⚠️  Error:', err.message.substring(0, 80));
      }
    }

    // 3. Create trigger for subscription updates
    console.log('\n3️⃣ Creating update trigger...');
    
    try {
      await sql.unsafe(`
        CREATE OR REPLACE FUNCTION update_subscription_timestamp() RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        DROP TRIGGER IF EXISTS trigger_subscription_updated_at ON user_subscriptions;
        CREATE TRIGGER trigger_subscription_updated_at
        BEFORE UPDATE ON user_subscriptions
        FOR EACH ROW
        EXECUTE FUNCTION update_subscription_timestamp();
      `);
      console.log('  ✅ Trigger created');
    } catch (err) {
      console.log('  ℹ️  Trigger:', err.message.includes('already exists') ? 'already exists' : 'skipped');
    }

    // 4. Verify
    console.log('\n4️⃣ Verifying tables...');
    
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('vip_tiers', 'user_subscriptions')
      ORDER BY table_name
    `;

    tables.forEach(t => console.log(`  ✅ ${t.table_name}: created`));

    const tiers = await sql`SELECT COUNT(*) as count FROM vip_tiers`;
    console.log(`\n  VIP Tiers: ${tiers[0].count} levels`);

    console.log('\n✅ VIP SYSTEM TABLES CREATED!');

    await sql.end();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createVIPTables();
