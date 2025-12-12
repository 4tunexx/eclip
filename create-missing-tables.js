#!/usr/bin/env node

/**
 * CREATE MISSING TABLES: user_cosmetics and leaderboards
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

async function createMissingTables() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('📦 CREATING MISSING TABLES');
    console.log('═'.repeat(70));

    // 1. Create user_cosmetics table (tracks owned cosmetics, not just equipped)
    console.log('\n1️⃣ Creating user_cosmetics table...');
    
    try {
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS user_cosmetics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          cosmetic_id UUID NOT NULL,
          type TEXT NOT NULL, -- 'frame', 'banner', 'title', 'badge'
          rarity TEXT NOT NULL DEFAULT 'common',
          obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          FOREIGN KEY (user_id) REFERENCES "users"(id) ON DELETE CASCADE,
          FOREIGN KEY (cosmetic_id) REFERENCES cosmetics(id) ON DELETE CASCADE,
          UNIQUE(user_id, cosmetic_id)
        );
      `);
      console.log('  ✅ user_cosmetics table created');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('  ℹ️  user_cosmetics table already exists');
      } else {
        console.log('  ⚠️  Error:', err.message.substring(0, 80));
      }
    }

    // 2. Create leaderboards table (materialized view alternative)
    console.log('\n2️⃣ Creating leaderboards table...');
    
    try {
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS leaderboards (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          rank_type TEXT NOT NULL, -- 'esr', 'level'
          rank_position INTEGER NOT NULL,
          value INTEGER NOT NULL,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          FOREIGN KEY (user_id) REFERENCES "users"(id) ON DELETE CASCADE,
          UNIQUE(user_id, rank_type)
        );
      `);
      console.log('  ✅ leaderboards table created');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('  ℹ️  leaderboards table already exists');
      } else {
        console.log('  ⚠️  Error:', err.message.substring(0, 80));
      }
    }

    // 3. Create indexes for performance
    console.log('\n3️⃣ Creating indexes...');
    
    try {
      await sql.unsafe(`
        CREATE INDEX IF NOT EXISTS idx_user_cosmetics_user_id 
        ON user_cosmetics(user_id);
      `);
      console.log('  ✅ Index on user_cosmetics.user_id');
    } catch (e) {
      if (!e.message.includes('already exists')) {
        console.log('  ⚠️  Index error:', e.message.substring(0, 60));
      }
    }

    try {
      await sql.unsafe(`
        CREATE INDEX IF NOT EXISTS idx_leaderboards_rank_type 
        ON leaderboards(rank_type);
      `);
      console.log('  ✅ Index on leaderboards.rank_type');
    } catch (e) {
      if (!e.message.includes('already exists')) {
        console.log('  ⚠️  Index error:', e.message.substring(0, 60));
      }
    }

    // 4. Verify tables exist
    console.log('\n4️⃣ Verifying tables...');
    
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('user_cosmetics', 'leaderboards')
      ORDER BY table_name
    `;

    tables.forEach(t => {
      console.log(`  ✅ ${t.table_name}: exists`);
    });

    if (tables.length === 2) {
      console.log('\n✅ All missing tables created successfully!');
    } else {
      console.log(`\n⚠️  Only ${tables.length}/2 tables verified`);
    }

    await sql.end();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createMissingTables();
