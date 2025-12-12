#!/usr/bin/env node

/**
 * FIX: Update rank, rank_tier, rank_division to match ESR
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

const TIER_RANGES = {
  Beginner: { ranges: [[0, 166], [167, 333], [334, 500]] },
  Rookie: { ranges: [[500, 666], [667, 833], [834, 1000]] },
  Pro: { ranges: [[1000, 1333], [1334, 1666], [1667, 2000]] },
  Ace: { ranges: [[2000, 2500], [2501, 3000], [3001, 3500]] },
  Legend: { ranges: [[3500, 4000], [4001, 4500], [4501, 5000]] },
};

function getRankFromESR(esr) {
  const esrValue = Math.max(0, Math.min(5000, esr));
  
  for (const [tierName, tierData] of Object.entries(TIER_RANGES)) {
    for (let divisionIndex = 0; divisionIndex < tierData.ranges.length; divisionIndex++) {
      const [min, max] = tierData.ranges[divisionIndex];
      if (esrValue >= min && esrValue <= max) {
        return {
          tier: tierName,
          division: divisionIndex + 1,
        };
      }
    }
  }

  return { tier: 'Legend', division: 3 };
}

async function fixRanks() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('🔧 FIXING USER RANKS IN DATABASE');
    console.log('═'.repeat(70));
    
    // Get all users
    const users = await sql`SELECT id, username, esr FROM "users"`;
    console.log(`Found ${users.length} users to update\n`);

    let updated = 0;
    for (const user of users) {
      const rankInfo = getRankFromESR(user.esr);
      
      try {
        await sql`
          UPDATE "users"
          SET 
            rank = ${rankInfo.tier},
            rank_tier = ${rankInfo.tier},
            rank_division = ${rankInfo.division}
          WHERE id = ${user.id}
        `;
        updated++;
        console.log(`✅ ${updated}/${users.length} ${user.username.padEnd(15)} ESR ${String(user.esr).padEnd(4)} → ${rankInfo.tier} ${rankInfo.division}`);
      } catch (err) {
        console.error(`❌ Failed to update ${user.username}: ${err.message}`);
      }
    }

    console.log(`\n✅ Updated ${updated}/${users.length} users`);

    // Verify
    console.log('\n📊 VERIFICATION:');
    console.log('═'.repeat(70));
    
    const verification = await sql`
      SELECT 
        DISTINCT rank,
        COUNT(*) as count
      FROM "users"
      GROUP BY rank
      ORDER BY rank
    `;

    verification.forEach(v => {
      console.log(`  "${v.rank}": ${v.count} users`);
    });

    // Show sample
    console.log('\n📋 SAMPLE AFTER UPDATE:');
    const samples = await sql`
      SELECT username, esr, rank, rank_tier, rank_division
      FROM "users"
      ORDER BY esr DESC
      LIMIT 5
    `;

    samples.forEach(s => {
      console.log(`  ${s.username.padEnd(15)} ESR ${String(s.esr).padEnd(4)} → ${s.rank} ${s.rank_division}`);
    });

    await sql.end();
    console.log('\n✅ Database fixed!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

fixRanks();
