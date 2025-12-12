#!/usr/bin/env node

/**
 * DELETE 42unexx user - keep only admin
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

async function deleteUser() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('🗑️  DELETING 42unexx USER');
    console.log('═'.repeat(70));

    // Delete user and related data
    const userToDelete = await sql`SELECT id FROM "users" WHERE username = '42unexx'`;
    
    if (userToDelete.length === 0) {
      console.log('⚠️  User 42unexx not found!');
    } else {
      const userId = userToDelete[0].id;
      
      console.log(`Found user ID: ${userId}`);
      console.log('Deleting related data...');
      
      try {
        await sql`DELETE FROM user_achievements WHERE user_id = ${userId}`;
        console.log('  ✅ Deleted user achievements');
      } catch (e) {}

      try {
        await sql`DELETE FROM user_mission_progress WHERE user_id = ${userId}`;
        console.log('  ✅ Deleted user missions');
      } catch (e) {}

      try {
        await sql`DELETE FROM notifications WHERE user_id = ${userId}`;
        console.log('  ✅ Deleted notifications');
      } catch (e) {}

      try {
        await sql`DELETE FROM user_profiles WHERE user_id = ${userId}`;
        console.log('  ✅ Deleted user profile');
      } catch (e) {}

      try {
        await sql`DELETE FROM match_players WHERE user_id = ${userId}`;
        console.log('  ✅ Deleted match players');
      } catch (e) {}

      // Delete user
      await sql`DELETE FROM "users" WHERE id = ${userId}`;
      console.log('\n✅ Deleted user 42unexx!');
    }

    // Verify only admin remains
    console.log('\n📊 REMAINING USERS:');
    console.log('═'.repeat(70));
    
    const remaining = await sql`
      SELECT username, email, level, xp, esr, rank_tier, rank_division, role, email_verified
      FROM "users"
      ORDER BY created_at
    `;

    if (remaining.length === 0) {
      console.log('⚠️  NO USERS IN DATABASE!');
    } else {
      remaining.forEach((u, i) => {
        console.log(`${i + 1}. ${u.username} (${u.role})`);
        console.log(`   Email: ${u.email} | Verified: ${u.email_verified}`);
        console.log(`   Level: ${u.level} | XP: ${u.xp} | ESR: ${u.esr} | Rank: ${u.rank_tier} ${u.rank_division}`);
      });
    }

    console.log(`\n✅ Total users: ${remaining.length}`);

    await sql.end();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

deleteUser();
