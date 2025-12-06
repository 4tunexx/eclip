#!/usr/bin/env node
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL environment variable not set');
  process.exit(1);
}

const sql = postgres(dbUrl, { max: 1 });

(async () => {
  try {
    console.log('🔧 Setting up admin user...\n');

    const email = 'admin@eclip.pro';
    const password = 'Admin123!';
    const username = 'admin';

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✓ Password hashed');

    // Check if admin exists
    try {
      const existing = await sql`
        SELECT id, role FROM users WHERE email = ${email}
      `;

      if (existing.length > 0) {
        console.log('✓ Admin user exists, updating...');
        await sql`
          UPDATE users 
          SET password_hash = ${passwordHash}, role = 'ADMIN', username = ${username}
          WHERE email = ${email}
        `;
        console.log('✅ Admin user updated!');
      } else {
        console.log('✓ Admin user not found, creating...');
        await sql`
          INSERT INTO users (
            email, username, password_hash, role, 
            level, xp, esr, rank, coins,
            email_verified, email_verification_token
          ) VALUES (
            ${email}, ${username}, ${passwordHash}, 'ADMIN',
            100, 50000, 5000, 'Radiant', '10000',
            true, ${null}
          )
        `;
        console.log('✅ Admin user created!');
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError.message);
      if (dbError.message.includes('does not exist')) {
        console.log('\n⚠️  Users table may not exist yet. Running migrations first...');
        try {
          const { migrate } = await import('drizzle-orm/postgres-js/migrator');
          const { drizzle } = await import('drizzle-orm/postgres-js');
          const postgresModule = await import('postgres');
          
          const client = postgresModule.default(dbUrl, { max: 1 });
          const migrationDb = drizzle(client);
          await migrate(migrationDb, { migrationsFolder: 'drizzle' });
          await client.end({ timeout: 5 });
          console.log('✓ Migrations completed');
          
          // Retry admin creation after migration
          const existing = await sql`
            SELECT id, role FROM users WHERE email = ${email}
          `;

          if (existing.length > 0) {
            console.log('✓ Admin user exists, updating...');
            await sql`
              UPDATE users 
              SET password_hash = ${passwordHash}, role = 'ADMIN', username = ${username}
              WHERE email = ${email}
            `;
            console.log('✅ Admin user updated!');
          } else {
            console.log('✓ Admin user not found, creating...');
            await sql`
              INSERT INTO users (
                email, username, password_hash, role, 
                level, xp, esr, rank, coins,
                email_verified, email_verification_token
              ) VALUES (
                ${email}, ${username}, ${passwordHash}, 'ADMIN',
                100, 50000, 5000, 'Radiant', '10000',
                true, ${null}
              )
            `;
            console.log('✅ Admin user created!');
          }
        } catch (migrationError) {
          console.error('❌ Migration failed:', migrationError.message);
          throw migrationError;
        }
      } else {
        throw dbError;
      }
    }

    console.log('\n📋 Admin Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   URL: https://www.eclip.pro`);

    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
})();

