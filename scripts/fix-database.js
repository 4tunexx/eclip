#!/usr/bin/env node
import postgres from 'postgres';
import bcrypt from 'bcryptjs';

// Direct connection string from connect.txt
const DATABASE_URL = 'postgresql://neondb_owner:npg_JwbY17enhtTU@ep-square-tree-addwk4t7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = postgres(DATABASE_URL, { max: 1 });

(async () => {
  try {
    console.log('🔧 ECLIP Database Diagnosis & Repair\n');
    console.log('=' .repeat(50));

    // 1. Check tables
    console.log('\n1️⃣  Checking database tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log(`✓ Found ${tables.length} tables\n`);

    if (tables.length === 0) {
      console.log('❌ No tables found! Running migrations...');
      try {
        const { migrate } = await import('drizzle-orm/postgres-js/migrator');
        const { drizzle } = await import('drizzle-orm/postgres-js');
        const client = postgres(DATABASE_URL, { max: 1 });
        const migrationDb = drizzle(client);
        await migrate(migrationDb, { migrationsFolder: 'drizzle' });
        await client.end({ timeout: 5 });
        console.log('✅ Migrations completed!\n');
      } catch (e) {
        console.error('❌ Migration failed:', e.message);
      }
    }

    // 2. Check users table
    console.log('2️⃣  Checking users table...');
    try {
      const userCount = await sql`SELECT COUNT(*) as cnt FROM users`;
      console.log(`✓ Users table exists with ${userCount[0].cnt} users\n`);
    } catch (e) {
      console.log('❌ Users table missing or error:', e.message);
      process.exit(1);
    }

    // 3. Check for admin user
    console.log('3️⃣  Checking for admin user...');
    const adminCheck = await sql`SELECT id, email, role, username FROM users WHERE email = 'admin@eclip.pro'`;
    
    if (adminCheck.length === 0) {
      console.log('❌ Admin user not found, creating...');
      const passwordHash = await bcrypt.hash('Admin123!', 10);
      const inserted = await sql`
        INSERT INTO users (
          email, username, password_hash, role, 
          level, xp, esr, rank, coins,
          email_verified, created_at, updated_at
        ) VALUES (
          'admin@eclip.pro', 'admin', ${passwordHash}, 'ADMIN',
          100, 50000, 5000, 'Radiant', '10000',
          true, NOW(), NOW()
        )
        RETURNING id, email, username, role
      `;
      console.log('✅ Admin user created!');
      console.log(`   ID: ${inserted[0].id}`);
      console.log(`   Email: ${inserted[0].email}`);
      console.log(`   Username: ${inserted[0].username}`);
      console.log(`   Role: ${inserted[0].role}\n`);
    } else {
      console.log('✓ Admin user exists');
      const admin = adminCheck[0];
      console.log(`   ID: ${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Role: ${admin.role}\n`);
      
      // Update password if needed
      console.log('   Updating password...');
      const passwordHash = await bcrypt.hash('Admin123!', 10);
      await sql`
        UPDATE users 
        SET password_hash = ${passwordHash}, role = 'ADMIN'
        WHERE id = ${admin.id}
      `;
      console.log('✅ Admin password updated!\n');
    }

    // 4. Check sessions table
    console.log('4️⃣  Checking sessions table...');
    try {
      const sessionCount = await sql`SELECT COUNT(*) as cnt FROM sessions`;
      console.log(`✓ Sessions table exists with ${sessionCount[0].cnt} records\n`);
    } catch (e) {
      console.log('⚠️  Sessions table issue:', e.message, '\n');
    }

    // 5. Check other critical tables
    console.log('5️⃣  Checking other critical tables...');
    const criticalTables = ['cosmetics', 'missions', 'achievements', 'user_profiles'];
    for (const tableName of criticalTables) {
      try {
        const result = await sql.unsafe(`SELECT COUNT(*) as cnt FROM ${tableName}`);
        console.log(`✓ ${tableName}: ${result[0].cnt} records`);
      } catch {
        console.log(`⚠️  ${tableName}: Not found or error`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ DATABASE REPAIR COMPLETE!\n');
    console.log('📋 Admin Credentials:');
    console.log('   Email: admin@eclip.pro');
    console.log('   Password: Admin123!');
    console.log('   URL: https://www.eclip.pro\n');

    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
})();
