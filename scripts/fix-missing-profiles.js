#!/usr/bin/env node

/**
 * FIX MISSING USER PROFILES
 * Create profile entries for users that are missing them
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function fixMissingProfiles() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('\n🔧 FIXING MISSING USER PROFILES\n');

    // Find users without profiles
    const missingProfiles = await client.query(`
      SELECT u.id, u.username 
      FROM users u
      LEFT JOIN user_profiles p ON p."user_id" = u.id
      WHERE p.id IS NULL
      ORDER BY u."created_at" DESC
    `);

    console.log(`Found ${missingProfiles.rows.length} users missing profiles\n`);

    if (missingProfiles.rows.length === 0) {
      console.log('✅ All users have profiles!');
      await client.end();
      return;
    }

    // Create profiles for missing users
    for (const user of missingProfiles.rows) {
      await client.query(`
        INSERT INTO user_profiles (id, "user_id", "created_at", "updated_at")
        VALUES (
          gen_random_uuid(),
          $1,
          NOW(),
          NOW()
        )
      `, [user.id]);
      console.log(`✅ Created profile for: ${user.username}`);
    }

    console.log(`\n✨ Fixed ${missingProfiles.rows.length} missing profiles!\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixMissingProfiles();
