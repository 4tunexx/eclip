require('dotenv').config();
const postgres = require('postgres');

(async () => {
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  try {
    const rows = await sql.unsafe('SELECT "token" FROM "public"."EmailVerificationToken" ORDER BY "createdAt" DESC LIMIT 1;');
    if (rows.length && rows[0].token) {
      process.stdout.write(rows[0].token);
    }
  } catch (e) {
    process.stderr.write(String(e?.message || e));
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
})();

