#!/usr/bin/env node

/**
 * Fix database rank issues - converts hardcoded Bronze ranks to correct Rookie ranks
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && !key.startsWith('#')) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const DATABASE_URL = env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

const postgres = require('pg');
const { Pool } = postgres;
const pool = new Pool({ connectionString: DATABASE_URL });

/**
 * Calculate rank from ESR (same logic as getRankFromESR in codebase)
 */
function getRankFromESR(esr) {
  const tiers = [
    { name: 'Beginner', minEsr: 0, maxEsr: 500 },
    { name: 'Rookie', minEsr: 500, maxEsr: 1000 },
    { name: 'Pro', minEsr: 1000, maxEsr: 2000 },
    { name: 'Ace', minEsr: 2000, maxEsr: 3500 },
    { name: 'Legend', minEsr: 3500, maxEsr: 5000 }
  ];

  const tier = tiers.find(t => esr >= t.minEsr && esr < t.maxEsr);
  if (!tier) return { tier: 'Legend', division: 3 };

  const tierRange = tier.maxEsr - tier.minEsr;
  const position = esr - tier.minEsr;
  const divisionSize = tierRange / 3;
  const division = Math.min(3, Math.max(1, Math.ceil((position + 1) / divisionSize)));

  return { tier: tier.name, division };
}

(async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connected to Neon database\n');

    console.log('🔧 FIXING DATABASE RANK ISSUES...\n');

    // Check for Bronze ranks
    console.log('1️⃣  Checking for invalid Bronze ranks...');
    const bronzeUsers = await client.query(`
      SELECT id, email, username, rank, esr FROM users WHERE rank = 'Bronze'
    `);

    if (bronzeUsers.rows.length === 0) {
      console.log('✅ No Bronze ranks found');
    } else {
      console.log(`⚠️  Found ${bronzeUsers.rows.length} users with Bronze rank:\n`);

      for (const user of bronzeUsers.rows) {
        const rankInfo = getRankFromESR(user.esr || 1000);
        console.log(`   ${user.username} (${user.email})`);
        console.log(`     Current: Bronze`);
        console.log(`     Should be: ${rankInfo.tier} ${rankInfo.division}`);
        console.log(`     ESR: ${user.esr || 1000}\n`);
      }

      console.log('   🔄 Fixing...\n');
      const fixCount = await client.query(`
        UPDATE users
        SET rank = CASE 
          WHEN esr IS NULL OR esr < 500 THEN 'Beginner'
          WHEN esr >= 500 AND esr < 1000 THEN 'Rookie'
          WHEN esr >= 1000 AND esr < 2000 THEN 'Pro'
          WHEN esr >= 2000 AND esr < 3500 THEN 'Ace'
          ELSE 'Legend'
        END,
        rank_tier = CASE 
          WHEN esr IS NULL OR esr < 500 THEN 'Beginner'
          WHEN esr >= 500 AND esr < 1000 THEN 'Rookie'
          WHEN esr >= 1000 AND esr < 2000 THEN 'Pro'
          WHEN esr >= 2000 AND esr < 3500 THEN 'Ace'
          ELSE 'Legend'
        END
        WHERE rank = 'Bronze'
      `);
      console.log(`   ✅ Fixed ${fixCount.rowCount} users\n`);
    }

    // Check for inconsistent rank_tier
    console.log('2️⃣  Checking for inconsistent rank_tier...');
    const inconsistent = await client.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE rank IS NOT NULL AND rank_tier IS NULL
    `);

    if (inconsistent.rows[0].count > 0) {
      console.log(`⚠️  Found ${inconsistent.rows[0].count} users with missing rank_tier`);
      console.log('   🔄 Fixing...\n');
      const fix2 = await client.query(`
        UPDATE users SET rank_tier = rank WHERE rank_tier IS NULL
      `);
      console.log(`   ✅ Fixed ${fix2.rowCount} users\n`);
    } else {
      console.log('✅ All rank_tier values are consistent\n');
    }

    // Check for missing rank_division
    console.log('3️⃣  Checking for missing rank_division...');
    const missingDiv = await client.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE rank IS NOT NULL AND (rank_division IS NULL OR rank_division = 0)
    `);

    if (missingDiv.rows[0].count > 0) {
      console.log(`⚠️  Found ${missingDiv.rows[0].count} users with missing rank_division`);
      console.log('   🔄 Fixing...\n');
      const fix3 = await client.query(`
        UPDATE users 
        SET rank_division = CASE 
          WHEN esr IS NULL OR esr < 500 THEN 1
          WHEN esr >= 500 AND esr < 666.67 THEN 1
          WHEN esr >= 666.67 AND esr < 833.34 THEN 2
          ELSE 3
        END
        WHERE rank_division IS NULL OR rank_division = 0
      `);
      console.log(`   ✅ Fixed ${fix3.rowCount} users\n`);
    } else {
      console.log('✅ All rank_division values are set\n');
    }

    // Final report
    console.log('4️⃣  Final user ranks check...\n');
    const finalCheck = await client.query(`
      SELECT username, email, rank, rank_tier, rank_division, esr 
      FROM users 
      ORDER BY created_at DESC
    `);

    finalCheck.rows.forEach((u, i) => {
      console.log(`${i + 1}. ${u.username} (${u.email})`);
      console.log(`   Rank: ${u.rank} ${u.rank_division || '?'} (tier: ${u.rank_tier})`);
      console.log(`   ESR: ${u.esr}`);
      console.log('');
    });

    console.log('='.repeat(70));
    console.log('✅ DATABASE FIXES COMPLETE!\n');
    console.log('Next steps:');
    console.log('  1. Test login with your account');
    console.log('  2. Check landing page shows correct ranks');
    console.log('  3. If you want to be admin, run:');
    console.log("     UPDATE users SET role = 'ADMIN' WHERE email = 'your_email';\n");

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
})();
