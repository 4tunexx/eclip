require('dotenv').config();
const postgres = require('postgres');

async function main() {
  const table = process.argv[2];
  if (!table) {
    console.error('Usage: node scripts/inspect-table.js <TableName>');
    process.exit(1);
  }
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  try {
    const cols = await sql.unsafe(
      `SELECT column_name, is_nullable, data_type, udt_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position;`,
      [table]
    );
    const enums = [];
    for (const c of cols) {
      if (c.data_type === 'USER-DEFINED') {
        const e = await sql.unsafe(
          `SELECT enumlabel FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid WHERE t.typname = $1;`,
          [c.udt_name]
        );
        enums.push({ column: c.column_name, type: c.udt_name, values: e.map(r => r.enumlabel) });
      }
    }
    console.log(JSON.stringify({ table, columns: cols, enums }, null, 2));
  } catch (e) {
    console.error('Inspect error:', e?.message || e);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
}

main();

