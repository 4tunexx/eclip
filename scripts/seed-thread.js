require('dotenv').config();
const postgres = require('postgres');

(async () => {
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  try {
    const adminEmail = 'admin@eclip.pro';
    const adminRow = await sql.unsafe('SELECT id FROM "public"."User" WHERE "email" = $1 LIMIT 1;', [adminEmail]);
    const adminId = adminRow[0]?.id;
    if (!adminId) throw new Error('Admin user not found');

    // Insert a FORUM_TOPIC thread
    await sql.unsafe(
      'INSERT INTO "public"."Thread" ("id","type","title","createdById","createdAt","locked","pinned") VALUES (gen_random_uuid(), $1, $2, $3, NOW(), $4, $5);',
      ['FORUM_TOPIC', 'Welcome to Eclip.pro', adminId, false, true]
    );
    console.log('Thread seeded');
  } catch (e) {
    console.error('Seed thread error:', e?.message || e);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
})();

