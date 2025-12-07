import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = postgres(connectionString, { max: 1 });
  
  console.log('🚀 Running database migrations...\n');

  // Read and execute the migration file
  const migrationPath = path.join(process.cwd(), 'migrations', '0003_admin_tables_complete.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  
  try {
    console.log('📋 Executing migration: 0003_admin_tables_complete.sql');
    
    // Execute entire SQL file at once
    await sql.unsafe(migrationSQL);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify tables exist
    console.log('🔍 Verifying tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log('\n📊 Available tables:');
    tables.forEach((table: any) => {
      console.log(`  ✓ ${table.table_name}`);
    });
    
    console.log('\n✨ Database is ready!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
