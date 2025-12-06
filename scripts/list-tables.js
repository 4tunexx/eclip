import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    const rows = await sql`select table_name from information_schema.tables where table_schema='public' order by table_name`;
    console.log(rows.map(r => r.table_name));
  } catch (e) {
    console.error('List tables failed:', e?.message || e);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
}

main();
