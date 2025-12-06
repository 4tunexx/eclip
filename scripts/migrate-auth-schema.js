import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    console.log('Adding auth columns to users table...');
    
    // Add email column
    await sql`ALTER TABLE users ADD COLUMN email TEXT UNIQUE;`;
    console.log('✓ Added email column');

    // Add password_hash column
    await sql`ALTER TABLE users ADD COLUMN password_hash TEXT;`;
    console.log('✓ Added password_hash column');

    // Add role column
    await sql`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'USER';`;
    console.log('✓ Added role column');

    // Add email_verified column
    await sql`ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;`;
    console.log('✓ Added email_verified column');

    // Add email_verification_token column
    await sql`ALTER TABLE users ADD COLUMN email_verification_token TEXT;`;
    console.log('✓ Added email_verification_token column');

    // Add password_reset_token column
    await sql`ALTER TABLE users ADD COLUMN password_reset_token TEXT;`;
    console.log('✓ Added password_reset_token column');

    // Add password_reset_expires column
    await sql`ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP;`;
    console.log('✓ Added password_reset_expires column');

    // Add level, xp, esr if missing
    try {
      await sql`ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;`;
      console.log('✓ Added level column');
    } catch (e) {
      console.log('~ level already exists');
    }

    try {
      await sql`ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0;`;
      console.log('✓ Added xp column');
    } catch (e) {
      console.log('~ xp already exists');
    }

    try {
      await sql`ALTER TABLE users ADD COLUMN esr INTEGER DEFAULT 1000;`;
      console.log('✓ Added esr column');
    } catch (e) {
      console.log('~ esr already exists');
    }

    try {
      await sql`ALTER TABLE users ADD COLUMN rank TEXT DEFAULT 'Bronze';`;
      console.log('✓ Added rank column');
    } catch (e) {
      console.log('~ rank already exists');
    }

    try {
      await sql`ALTER TABLE users ADD COLUMN coins DECIMAL(10, 2) DEFAULT '0';`;
      console.log('✓ Added coins column');
    } catch (e) {
      console.log('~ coins already exists');
    }

    console.log('\n✅ Auth schema migration completed!');
  } catch (error) {
    console.error('Migration failed:', error?.message || error);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
}

main();
