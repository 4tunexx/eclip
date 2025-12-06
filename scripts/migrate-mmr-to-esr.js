#!/usr/bin/env node
import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    console.log('🔄 Renaming MMR columns to ESR...\n');

    // Rename users.mmr to users.esr
    try {
      await sql`ALTER TABLE users RENAME COLUMN mmr TO esr`;
      console.log('✅ Renamed users.mmr → esr');
    } catch (e) {
      if (e.message.includes('does not exist')) {
        console.log('~ Column mmr does not exist (already renamed or missing)');
      } else {
        throw e;
      }
    }

    // Drop duplicate esr_rating column if it exists
    try {
      await sql`ALTER TABLE users DROP COLUMN IF EXISTS esr_rating`;
      console.log('✅ Dropped legacy esr_rating column');
    } catch (e) {
      console.log('~ esr_rating column not present');
    }

    // Rename queue_tickets.mmr_at_join to esr_at_join if table exists
    try {
      const result = await sql`SELECT 1 FROM information_schema.tables WHERE table_name = 'queue_tickets' LIMIT 1`;
      if (result.length > 0) {
        try {
          await sql`ALTER TABLE queue_tickets RENAME COLUMN mmr_at_join TO esr_at_join`;
          console.log('✅ Renamed queue_tickets.mmr_at_join → esr_at_join');
        } catch (e) {
          if (e.message.includes('does not exist')) {
            console.log('~ Column mmr_at_join does not exist');
          } else {
            throw e;
          }
        }
      }
    } catch (e) {
      console.log('~ queue_tickets table not found');
    }

    console.log('\n✅ ESR migration completed!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error?.message || error);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
}

main();
