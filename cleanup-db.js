#!/usr/bin/env node

/**
 * CLEANUP: Delete all users except admin, fix rankup function
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

async function cleanup() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('🧹 CLEANING UP DATABASE');
    console.log('═'.repeat(70));

    // 1. Fix the rankup function to use esr instead of mmr
    console.log('\n1️⃣ Fixing rankup notification function...');
    
    const fixFunction = `
    CREATE OR REPLACE FUNCTION create_rankup_notification() RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.rank_tier != OLD.rank_tier OR NEW.rank_division != OLD.rank_division THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
          NEW.id,
          'rank_up',
          'Rank Up! 📈',
          'You ranked up to ' || NEW.rank_tier || ' ' || NEW.rank_division,
          jsonb_build_object(
            'newRank', NEW.rank_tier,
            'newDivision', NEW.rank_division,
            'esr', NEW.esr
          )
        );
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    `;

    try {
      await sql.unsafe(fixFunction);
      console.log('✅ Fixed rankup notification function (now uses esr instead of mmr)');
    } catch (err) {
      console.log('⚠️  Function fix failed (may not be critical):', err.message.substring(0, 50));
    }

    // 2. Get admin user
    console.log('\n2️⃣ Finding admin user...');
    const admins = await sql`SELECT id, username FROM "users" WHERE role = 'ADMIN' LIMIT 1`;
    
    if (admins.length === 0) {
      console.error('❌ No admin user found!');
      process.exit(1);
    }

    const adminId = admins[0].id;
    const adminUsername = admins[0].username;
    console.log(`✅ Found admin: ${adminUsername}`);

    // 3. Count users to delete
    console.log('\n3️⃣ Deleting all non-admin users...');
    const countBefore = await sql`SELECT COUNT(*) as count FROM "users" WHERE role != 'ADMIN'`;
    const toDelete = countBefore[0].count;
    console.log(`Found ${toDelete} non-admin users to delete`);

    // Delete related data first (user_profiles, notifications, etc)
    const nonAdminIds = await sql`SELECT id FROM "users" WHERE role != 'ADMIN'`;
    
    if (nonAdminIds.length > 0) {
      const ids = nonAdminIds.map(u => u.id);
      
      try {
        await sql`DELETE FROM user_achievements WHERE user_id = ANY(${ids})`;
        console.log('  • Deleted user achievements');
      } catch (e) {}

      try {
        await sql`DELETE FROM user_mission_progress WHERE user_id = ANY(${ids})`;
        console.log('  • Deleted user missions');
      } catch (e) {}

      try {
        await sql`DELETE FROM notifications WHERE user_id = ANY(${ids})`;
        console.log('  • Deleted user notifications');
      } catch (e) {}

      try {
        await sql`DELETE FROM user_profiles WHERE user_id = ANY(${ids})`;
        console.log('  • Deleted user profiles');
      } catch (e) {}

      try {
        await sql`DELETE FROM match_players WHERE user_id = ANY(${ids})`;
        console.log('  • Deleted match players');
      } catch (e) {}

      // Delete users
      try {
        await sql`DELETE FROM "users" WHERE role != 'ADMIN'`;
        console.log(`✅ Deleted ${toDelete} non-admin users`);
      } catch (err) {
        console.error('❌ Failed to delete users:', err.message.substring(0, 100));
      }
    }

    // 4. Verify only admin remains
    console.log('\n4️⃣ Verifying cleanup...');
    const countAfter = await sql`SELECT COUNT(*) as count FROM "users"`;
    console.log(`Total users in database: ${countAfter[0].count}`);

    const admin = await sql`
      SELECT 
        id, username, email, level, xp, esr, rank_tier, rank_division, avatar, role
      FROM "users"
      WHERE id = ${adminId}
    `;

    if (admin.length > 0) {
      const a = admin[0];
      console.log('\n✅ REMAINING USER (ADMIN):');
      console.log(`  Username: ${a.username}`);
      console.log(`  Email: ${a.email}`);
      console.log(`  Role: ${a.role}`);
      console.log(`  Level: ${a.level}`);
      console.log(`  XP: ${a.xp}`);
      console.log(`  ESR: ${a.esr}`);
      console.log(`  Rank: ${a.rank_tier} ${a.rank_division}`);
      console.log(`  Avatar: ${a.avatar ? '✅' : '❌'}`);
    }

    await sql.end();
    console.log('\n✅ Cleanup complete! Database ready for fresh testing.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

cleanup();
