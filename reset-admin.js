#!/usr/bin/env node

/**
 * Reset admin user to default values
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

async function resetAdmin() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('🔧 RESETTING ADMIN USER TO DEFAULTS');
    console.log('═'.repeat(70));

    // Reset admin to default values
    const adminId = 'admin-id'; // Will get real id
    
    // Get admin first
    const admins = await sql`SELECT id FROM "users" WHERE role = 'ADMIN' LIMIT 1`;
    if (admins.length === 0) {
      console.error('❌ No admin user found!');
      process.exit(1);
    }

    const admin = admins[0];
    const adminUserId = admin.id;

    // Default values for fresh user:
    // - Level: 1 (not 34)
    // - XP: 0 (not 33000)
    // - ESR: 1000 (default)
    // - Rank: Rookie I (1000 ESR = Rookie I)
    
    const defaultLevel = 1;
    const defaultXP = 0;
    const defaultESR = 1000;
    const rankInfo = getRankFromESR(defaultESR);

    console.log('\nResetting to defaults:');
    console.log(`  Level: 1 (from 34)`);
    console.log(`  XP: 0 (from 33000)`);
    console.log(`  ESR: 1000 (from current)`);
    console.log(`  Rank: ${rankInfo.tier} ${rankInfo.division}`);

    await sql`
      UPDATE "users"
      SET 
        level = ${defaultLevel},
        xp = ${defaultXP},
        esr = ${defaultESR},
        rank = ${rankInfo.tier},
        rank_tier = ${rankInfo.tier},
        rank_division = ${rankInfo.division}
      WHERE id = ${adminUserId}
    `;

    console.log('\n✅ Admin reset to default values!');

    // Verify
    const updated = await sql`
      SELECT 
        username, level, xp, esr, rank_tier, rank_division
      FROM "users"
      WHERE role = 'ADMIN'
    `;

    if (updated.length > 0) {
      const u = updated[0];
      console.log('\n📊 ADMIN CURRENT STATE:');
      console.log(`  Username: ${u.username}`);
      console.log(`  Level: ${u.level}`);
      console.log(`  XP: ${u.xp}`);
      console.log(`  ESR: ${u.esr}`);
      console.log(`  Rank: ${u.rank_tier} ${u.rank_division}`);
    }

    await sql.end();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdmin();
