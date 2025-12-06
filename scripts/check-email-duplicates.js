#!/usr/bin/env node
import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    // Check which emails are duplicated
    const legacyEmails = await sql`SELECT email FROM "User"`;
    const usersEmails = await sql`SELECT email FROM users WHERE email IS NOT NULL`;
    
    console.log('\n📧 Email Check:');
    console.log('═'.repeat(60));
    console.log(`\nLegacy "User" emails (${legacyEmails.length}):`);
    legacyEmails.forEach(r => console.log(`  ${r.email}`));
    
    console.log(`\nCurrent "users" emails (${usersEmails.length}):`);
    usersEmails.forEach(r => console.log(`  ${r.email}`));
    
    // Find overlaps
    const legacySet = new Set(legacyEmails.map(r => r.email));
    const usersSet = new Set(usersEmails.map(r => r.email));
    
    const overlaps = Array.from(legacySet).filter(e => usersSet.has(e));
    console.log(`\n⚠️  Duplicate emails (${overlaps.length}):`);
    overlaps.forEach(e => console.log(`  ${e}`));
    
  } catch (error) {
    console.error('❌ Error:', error?.message || error);
  } finally {
    process.exit(0);
  }
}

main();
