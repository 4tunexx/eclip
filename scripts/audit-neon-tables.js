#!/usr/bin/env node
import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    console.log('\n📊 NEON DATABASE TABLE AUDIT\n');
    console.log('═'.repeat(70));

    // Get all user-defined tables
    const tables = await sql`
      SELECT 
        table_schema,
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = t.table_schema AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema', '_timescaledb_internal', 'timescaledb_information')
      ORDER BY table_schema, table_name
    `;

    console.log(`\n📋 Total tables found: ${tables.length}\n`);

    // Group by schema
    const bySchema = {};
    tables.forEach(t => {
      if (!bySchema[t.table_schema]) bySchema[t.table_schema] = [];
      bySchema[t.table_schema].push(t);
    });

    for (const [schema, schemaTables] of Object.entries(bySchema)) {
      console.log(`\n🔹 SCHEMA: ${schema}`);
      console.log('─'.repeat(70));
      
      // Check for duplicates (users vs User, etc)
      const tableNames = schemaTables.map(t => t.table_name);
      const lowerNames = tableNames.map(n => n.toLowerCase());
      
      const duplicates = [];
      lowerNames.forEach((name, i) => {
        const matches = lowerNames.filter((n, j) => n === name && j !== i);
        if (matches.length > 0) {
          duplicates.push({ lower: name, exact: tableNames[i] });
        }
      });

      if (duplicates.length > 0) {
        console.log('\n⚠️  POTENTIAL DUPLICATES (case-insensitive):');
        [...new Set(duplicates.map(d => d.lower))].forEach(name => {
          const variants = tableNames.filter(t => t.toLowerCase() === name);
          console.log(`   ${name}: ${variants.join(', ')}`);
        });
      }

      schemaTables.forEach(t => {
        console.log(`   • ${t.table_name} (${t.column_count} cols)`);
      });
    }

    // Check row counts for each table to identify unused ones
    console.log('\n\n📈 TABLE ROW COUNTS (identifying unused tables)');
    console.log('═'.repeat(70));

    for (const t of tables) {
      try {
        const result = await sql.unsafe(`SELECT COUNT(*) as cnt FROM "${t.table_schema}"."${t.table_name}"`);
        const rowCount = parseInt(result[0].cnt);
        const status = rowCount === 0 ? '🔴 EMPTY' : `✅ ${rowCount} rows`;
        console.log(`${status.padEnd(20)} ${t.table_schema}.${t.table_name}`);
      } catch (e) {
        console.log(`⚠️  ERROR`.padEnd(20) + ` ${t.table_schema}.${t.table_name} (${e.message.substring(0, 40)}...)`);
      }
    }

    console.log('\n');
    console.log('═'.repeat(70));
    console.log('🔴 = Empty table (0 rows) - candidate for deletion');
    console.log('⚠️ = Duplicate case-insensitive names - consolidate');
    console.log('\n');

  } catch (error) {
    console.error('❌ Audit failed:', error?.message || error);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
}

main();
