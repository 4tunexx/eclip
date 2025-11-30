require('dotenv').config();

const postgres = require('postgres');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set in .env');
    process.exit(1);
  }

  const sql = postgres(url, { max: 1 });
  try {
    const tables = await sql`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog','information_schema')
      ORDER BY table_schema, table_name;
    `;

    const results = [];
    for (const t of tables) {
      const schema = t.table_schema;
      const name = t.table_name;
      const countRow = await sql.unsafe(
        `SELECT COUNT(*)::int AS count FROM "${schema}"."${name}";`
      );
      const count = countRow[0]?.count ?? 0;

      const sample = await sql.unsafe(
        `SELECT * FROM "${schema}"."${name}" LIMIT 3;`
      );

      results.push({ schema, table: name, rows: count, sample });
    }

    console.log(JSON.stringify({ ok: true, results }, null, 2));
  } catch (err) {
    console.error('Database inspection failed:', err?.message || err);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
}

main();
