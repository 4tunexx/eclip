#!/usr/bin/env node
import postgres from 'postgres';
import bcryptjs from 'bcryptjs';
import 'dotenv/config';

async function main() {
  const email = process.argv[2] || 'admin@eclip.pro';
  const username = process.argv[3] || 'admin';
  const password = process.argv[4] || 'Admin123!';

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = postgres(url, { max: 1 });
  try {
    const hash = await bcryptjs.hash(password, 10);

    // Insert into users table with all required fields
    const result = await sql`
      INSERT INTO users (id, email, username, password_hash, role, email_verified, level, xp, esr, rank, coins, steam_id, eclip_id, created_at, updated_at)
      VALUES (gen_random_uuid(), ${email}, ${username}, ${hash}, 'ADMIN', true, 1, 0, 1000, 'Bronze', '0', 'ADMIN_' || gen_random_uuid()::text, gen_random_uuid()::text, NOW(), NOW())
      RETURNING id, email, username, role;
    `;

    console.log(JSON.stringify({ ok: true, admin: result[0] }, null, 2));
  } catch (err) {
    console.error('Admin creation failed:', err?.message || err);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
}

main();
