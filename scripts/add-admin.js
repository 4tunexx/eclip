#!/usr/bin/env node
require('dotenv').config();
const bcrypt = require('bcryptjs');
const postgres = require('postgres');

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
    const hash = await bcrypt.hash(password, 10);

    // Detect table structure
    const usersColumns = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users';
    `;
    const userColumns = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'User';
    `;

    const usersHasEmail = usersColumns.some(c => c.column_name === 'email');
    const usersHasPasswordHash = usersColumns.some(c => c.column_name === 'password_hash');

    const userHasEmail = userColumns.some(c => c.column_name === 'email');
    const userHasPassword = userColumns.some(c => c.column_name === 'password');
    const userHasRole = userColumns.some(c => c.column_name === 'role');

    let result;
    if (usersHasEmail && usersHasPasswordHash) {
      // Insert into drizzle users table
      const existing = await sql`
        SELECT id FROM "public"."users" WHERE email = ${email} LIMIT 1;
      `;
      if (existing.length) {
        result = await sql`
          UPDATE "public"."users"
          SET role = 'ADMIN', password_hash = ${hash}, email_verified = true, updated_at = NOW()
          WHERE id = ${existing[0].id}
          RETURNING id, email, username, role;
        `;
      } else {
        result = await sql`
          INSERT INTO "public"."users" (id, email, username, password_hash, role, email_verified, level, xp, mmr, rank, coins, created_at, updated_at)
          VALUES (gen_random_uuid(), ${email}, ${username}, ${hash}, 'ADMIN', true, 1, 0, 1000, 'Bronze', '0', NOW(), NOW())
          RETURNING id, email, username, role;
        `;
      }
    } else if (userHasEmail && userHasPassword) {
      // Insert into legacy User table
      const existing = await sql.unsafe(
        `SELECT "id" FROM "public"."User" WHERE "email" = $1 LIMIT 1;`,
        [email]
      );
      if (existing.length) {
        result = await sql.unsafe(
          `UPDATE "public"."User"
           SET "role" = 'ADMIN', "password" = $1, "emailVerifiedAt" = NOW(), "updatedAt" = NOW()
           WHERE "id" = $2
           RETURNING "id", "email", "username", "role";`,
          [hash, existing[0].id]
        );
      } else {
        result = await sql.unsafe(
          `INSERT INTO "public"."User" ("id", "email", "username", "password", "role", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, 'ADMIN', NOW(), NOW())
           RETURNING "id", "email", "username", "role";`,
          [email, username, hash]
        );
      }
    } else {
      throw new Error('Neither users nor User table has expected columns');
    }

    console.log(JSON.stringify({ ok: true, admin: result[0] }, null, 2));
  } catch (err) {
    console.error('Admin creation failed:', err?.message || err);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
}

main();
