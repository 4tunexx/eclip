#!/usr/bin/env node

/**
 * FIX: Create missing tables + fix 42unexx rank
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

function getRankFromESR(esr) {
  const TIER_RANGES = {
    Beginner: { ranges: [[0, 166], [167, 333], [334, 500]] },
    Rookie: { ranges: [[500, 666], [667, 833], [834, 1000]] },
    Pro: { ranges: [[1000, 1333], [1334, 1666], [1667, 2000]] },
    Ace: { ranges: [[2000, 2500], [2501, 3000], [3001, 3500]] },
    Legend: { ranges: [[3500, 4000], [4001, 4500], [4501, 5000]] },
  };

  const esrValue = Math.max(0, Math.min(5000, esr));
  
  for (const [tierName, tierData] of Object.entries(TIER_RANGES)) {
    for (let divisionIndex = 0; divisionIndex < tierData.ranges.length; divisionIndex++) {
      const [min, max] = tierData.ranges[divisionIndex];
      if (esrValue >= min && esrValue <= max) {
        return { tier: tierName, division: divisionIndex + 1 };
      }
    }
  }
  return { tier: 'Legend', division: 3 };
}

async function fixAndCreate() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('🔧 FIXING DATABASE');
    console.log('═'.repeat(70));

    // 1. Fix 42unexx rank
    console.log('\n1️⃣ Fixing 42unexx rank...');
    const user = await sql`SELECT id FROM "users" WHERE username = '42unexx'`;
    
    if (user.length > 0) {
      const rankInfo = getRankFromESR(1000);
      await sql`
        UPDATE "users"
        SET rank = ${rankInfo.tier}, rank_tier = ${rankInfo.tier}, rank_division = ${rankInfo.division}
        WHERE id = ${user[0].id}
      `;
      console.log(`  ✅ 42unexx: ESR 1000 → ${rankInfo.tier} ${rankInfo.division}`);
    }

    // 2. Create user_cosmetics table
    console.log('\n2️⃣ Creating user_cosmetics table...');
    
    try {
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS user_cosmetics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
          cosmetic_id UUID NOT NULL REFERENCES cosmetics(id) ON DELETE CASCADE,
          obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, cosmetic_id)
        );
        CREATE INDEX IF NOT EXISTS idx_user_cosmetics_user ON user_cosmetics(user_id);
      `);
      console.log('  ✅ user_cosmetics table created with indexes');
    } catch (err) {
      console.log('  ℹ️  user_cosmetics:', err.message.includes('already exists') ? 'already exists' : err.message.substring(0, 60));
    }

    // 3. Create leaderboards table
    console.log('\n3️⃣ Creating leaderboards table...');
    
    try {
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS leaderboards (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
          rank_type TEXT NOT NULL,
          rank_position INTEGER NOT NULL,
          value INTEGER NOT NULL,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, rank_type)
        );
        CREATE INDEX IF NOT EXISTS idx_leaderboards_rank_type ON leaderboards(rank_type, rank_position);
      `);
      console.log('  ✅ leaderboards table created with indexes');
    } catch (err) {
      console.log('  ℹ️  leaderboards:', err.message.includes('already exists') ? 'already exists' : err.message.substring(0, 60));
    }

    // 4. Verify
    console.log('\n4️⃣ Verifying...');
    
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('user_cosmetics', 'leaderboards')
      ORDER BY table_name
    `;

    tables.forEach(t => console.log(`  ✅ ${t.table_name}: created`));

    // 5. Check fixed user
    const fixed = await sql`
      SELECT username, esr, rank_tier, rank_division
      FROM "users"
      WHERE username = '42unexx'
    `;

    if (fixed.length > 0) {
      const u = fixed[0];
      console.log(`\n✅ USER FIXED:`);
      console.log(`  ${u.username}: ESR ${u.esr} → ${u.rank_tier} ${u.rank_division}`);
    }

    console.log('\n✅ ALL FIXES COMPLETE!');

    await sql.end();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

fixAndCreate();
