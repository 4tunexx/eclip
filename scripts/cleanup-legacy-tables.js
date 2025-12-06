#!/usr/bin/env node
import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  
  try {
    console.log('\n🧹 CLEANING UP LEGACY TABLES\n');
    console.log('═'.repeat(70));
    
    const legacyTables = ['Cosmetic', 'KeyValueConfig', 'vip_tiers'];
    
    for (const table of legacyTables) {
      try {
        // Check row count first
        const count = await sql.unsafe(`SELECT COUNT(*) as cnt FROM "${table}"`);
        const rowCount = count[0].cnt;
        
        // Drop the table
        await sql.unsafe(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`✅ Dropped "${table}" (had ${rowCount} rows)`);
      } catch (e) {
        if (e.message.includes('does not exist')) {
          console.log(`⏭️  "${table}" doesn't exist (skipped)`);
        } else {
          console.log(`⚠️  Error dropping "${table}": ${e.message.substring(0, 50)}`);
        }
      }
    }
    
    console.log('\n' + '═'.repeat(70));
    console.log('✅ CLEANUP COMPLETE!\n');
    
  } catch (error) {
    console.error('❌ Error:', error?.message || error);
    process.exit(1);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
