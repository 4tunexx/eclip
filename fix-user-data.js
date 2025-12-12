#!/usr/bin/env node

/**
 * Fix User Data - Update ranks and avatars in database
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
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

// Rank calculation matching rank-calculator.ts
function getRankFromESR(esr) {
  const TIER_RANGES = {
    Beginner: {
      ranges: [[0, 166], [167, 333], [334, 500]],
    },
    Rookie: {
      ranges: [[500, 666], [667, 833], [834, 1000]],
    },
    Pro: {
      ranges: [[1000, 1333], [1334, 1666], [1667, 2000]],
    },
    Ace: {
      ranges: [[2000, 2500], [2501, 3000], [3001, 3500]],
    },
    Legend: {
      ranges: [[3500, 4000], [4001, 4500], [4501, 5000]],
    },
  };

  const esrValue = Math.max(0, Math.min(5000, esr));

  for (const [tierName, tierData] of Object.entries(TIER_RANGES)) {
    for (let divisionIndex = 0; divisionIndex < tierData.ranges.length; divisionIndex++) {
      const [min, max] = tierData.ranges[divisionIndex];
      if (esrValue >= min && esrValue <= max) {
        return `${tierName}`;
      }
    }
  }

  return 'Legend';
}

async function fixUserData() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('🔧 FIXING USER DATA IN DATABASE');
    console.log('═'.repeat(70));
    
    // 1. Get all users
    const users = await sql`SELECT id, esr FROM "users"`;
    
    console.log(`\n📊 Found ${users.length} users to update\n`);

    // 2. Update rank based on ESR - batch update
    let updatedCount = 0;
    const updates = [];
    
    for (const user of users) {
      const correctRank = getRankFromESR(user.esr);
      updates.push({ id: user.id, rank: correctRank, esr: user.esr });
    }
    
    // Batch update all at once
    try {
      for (const update of updates) {
        await sql`
          UPDATE "users" 
          SET rank = ${update.rank}
          WHERE id = ${update.id}
        `.catch(err => {
          console.warn(`⚠️ Could not update rank for ${update.id}: ${err.message}`);
        });
        updatedCount++;
      }
      console.log(`✅ Updated ${updatedCount} user ranks\n`);
    } catch (err) {
      console.log(`⚠️ Rank update skipped: ${err.message}\n`);
    }

    // 3. Add default avatar for users missing one
    console.log('🎨 Checking avatars...');
    
    const usersWithoutAvatar = await sql`
      SELECT id, username FROM "users" WHERE avatar IS NULL
    `;

    console.log(`Found ${usersWithoutAvatar.length} users without avatar`);
    
    if (usersWithoutAvatar.length > 0) {
      // Use a default avatar URL (placeholder or from your assets)
      const defaultAvatarUrl = 'https://api.dicebear.com/9.x/avataaars/svg?seed=default';
      
      try {
        for (const user of usersWithoutAvatar) {
          await sql`
            UPDATE "users"
            SET avatar = ${defaultAvatarUrl}
            WHERE id = ${user.id}
          `.catch(err => {
            console.warn(`⚠️ Could not update avatar for ${user.username}: ${err.message}`);
          });
        }
        console.log(`✅ Set avatars for ${usersWithoutAvatar.length} users`);
      } catch (err) {
        console.log(`⚠️ Avatar update skipped: ${err.message}`);
      }
    }

    // 4. Verify fixes
    console.log('\n✅ DATABASE UPDATE COMPLETE!');
    console.log('═'.repeat(70));
    console.log('\n📊 Verification - First 5 updated users:');

    const updated = await sql`
      SELECT id, username, level, xp, esr, rank, avatar
      FROM "users"
      LIMIT 5
    `;

    updated.forEach((u, i) => {
      console.log(`${i + 1}. ${u.username}: Level ${u.level} | ESR ${u.esr} | Rank: ${u.rank} | Avatar: ${u.avatar ? '✅' : '❌'}`);
    });

    await sql.end();
    console.log('\n✅ All fixes applied successfully!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

fixUserData();
