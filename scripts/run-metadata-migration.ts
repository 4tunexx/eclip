import 'dotenv/config';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function runMetadataMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(process.cwd(), 'migrations', '0004_add_cosmetics_metadata.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Executing migration...');
    await db.execute(sql.raw(migrationSQL));

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMetadataMigration();
