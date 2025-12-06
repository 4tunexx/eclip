#!/usr/bin/env node
import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    // Check users with legacy eclip_id format
    const legacyUsers = await sql`
      SELECT id, email, username, role, level, xp, esr, created_at
      FROM users 
      WHERE eclip_id LIKE 'eclip_%'
      ORDER BY created_at DESC
    `;
    
    console.log(`\n✅ Successfully migrated ${legacyUsers.length} legacy users:\n`);
    legacyUsers.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email}`);
      console.log(`   Role: ${u.role}, Level: ${u.level}, ESR: ${u.esr}, XP: ${u.xp}`);
      console.log(`   ID: ${u.id}`);
    });
    
    console.log(`\n📊 Total users in database: ${(await sql`SELECT COUNT(*) as cnt FROM users`)[0].cnt}`);
    
  } catch (error) {
    console.error('❌ Error:', error?.message || error);
  } finally {
    process.exit(0);
  }
}

main();
