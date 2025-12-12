import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function runAudit() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('='.repeat(80));
    console.log('ECLIP DATABASE AUDIT REPORT');
    console.log('='.repeat(80));
    console.log('');

    // Get all tables
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`\n📊 TOTAL TABLES FOUND: ${tables.length}\n`);
    console.log('Tables in database:');
    tables.forEach((t: any) => console.log(`  - ${t.table_name}`));

    // Expected tables from schema
    const expectedTables = [
      'users',
      'sessions',
      'user_profiles',
      'cosmetics',
      'user_inventory',
      'matches',
      'match_players',
      'queue_tickets',
      'missions',
      'user_mission_progress',
      'badges',
      'achievements',
      'user_achievements',
      'forum_categories',
      'forum_threads',
      'forum_posts',
      'ac_events',
      'bans',
      'notifications',
      'site_config',
      'transactions',
      'achievement_progress',
      'role_permissions',
      'esr_thresholds',
      'level_thresholds',
      'user_metrics',
      'chat_messages',
      'direct_messages',
    ];

    console.log('\n' + '='.repeat(80));
    console.log('SCHEMA VALIDATION');
    console.log('='.repeat(80));

    const dbTableNames = new Set(tables.map((t: any) => t.table_name));

    // Missing tables
    const missingTables = expectedTables.filter((t) => !dbTableNames.has(t));
    if (missingTables.length > 0) {
      console.log('\n❌ MISSING TABLES:');
      missingTables.forEach((t) => console.log(`  - ${t}`));
    } else {
      console.log('\n✅ All expected tables exist');
    }

    // Extra tables
    const extraTables = Array.from(dbTableNames).filter(
      (t) => !expectedTables.includes(t as string)
    );
    if (extraTables.length > 0) {
      console.log('\n⚠️  EXTRA TABLES IN DATABASE:');
      extraTables.forEach((t) => console.log(`  - ${t}`));
    }

    // Detailed column analysis
    console.log('\n' + '='.repeat(80));
    console.log('DETAILED COLUMN ANALYSIS');
    console.log('='.repeat(80));

    const columnInfo: Record<string, any[]> = {};

    for (const table of tables) {
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${table.table_name}
        ORDER BY ordinal_position
      `;
      columnInfo[table.table_name] = columns;
    }

    // Print column details for each table
    const tablesToCheck = tables.filter((t: any) => expectedTables.includes(t.table_name));

    for (const table of tablesToCheck) {
      const columns = columnInfo[table.table_name];
      console.log(`\n📋 ${table.table_name}:`);
      console.log(`   Columns: ${columns.length}`);
      columns.forEach((col: any) => {
        const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(not null)';
        const defaultVal = col.column_default ? ` = ${col.column_default}` : '';
        console.log(`     - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
      });
    }

    // Check for foreign keys
    console.log('\n' + '='.repeat(80));
    console.log('FOREIGN KEY RELATIONSHIPS');
    console.log('='.repeat(80));

    const fks = await sql`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name
    `;

    console.log(`\nTotal Foreign Keys: ${fks.length}`);
    fks.forEach((fk: any) => {
      console.log(`  ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });

    // Check for indexes
    console.log('\n' + '='.repeat(80));
    console.log('INDEXES');
    console.log('='.repeat(80));

    const indexes = await sql`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `;

    console.log(`\nTotal Indexes: ${indexes.length}`);
    const indexesByTable: Record<string, string[]> = {};
    indexes.forEach((idx: any) => {
      if (!indexesByTable[idx.tablename]) {
        indexesByTable[idx.tablename] = [];
      }
      indexesByTable[idx.tablename].push(idx.indexname);
    });

    for (const [table, idxs] of Object.entries(indexesByTable)) {
      console.log(`  ${table}: ${idxs.length} indexes`);
      idxs.forEach((idx) => console.log(`    - ${idx}`));
    }

    // Check for enums
    console.log('\n' + '='.repeat(80));
    console.log('ENUM TYPES');
    console.log('='.repeat(80));

    const enums = await sql`
      SELECT t.typname as enum_name, e.enumlabel as value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typnamespace = 'public'::regnamespace
      ORDER BY t.typname, e.enumsortorder
    `;

    if (enums.length > 0) {
      const enumsByType: Record<string, string[]> = {};
      enums.forEach((e: any) => {
        if (!enumsByType[e.enum_name]) {
          enumsByType[e.enum_name] = [];
        }
        enumsByType[e.enum_name].push(e.value);
      });

      for (const [enumName, values] of Object.entries(enumsByType)) {
        console.log(`  ${enumName}: [${values.join(', ')}]`);
      }
    } else {
      console.log('  No enums found');
    }

    // Check table sizes
    console.log('\n' + '='.repeat(80));
    console.log('TABLE ROW COUNTS');
    console.log('='.repeat(80));

    for (const table of tables) {
      const [count] = await sql`SELECT COUNT(*) as count FROM ${sql(table.table_name)}`;
      console.log(`  ${table.table_name}: ${count.count} rows`);
    }

    // Check for any schema version or migrations
    console.log('\n' + '='.repeat(80));
    console.log('MIGRATIONS / SCHEMA VERSION');
    console.log('='.repeat(80));

    try {
      const migrations = await sql`
        SELECT version, installed_on
        FROM schema_migrations
        ORDER BY version DESC
        LIMIT 10
      `;
      console.log(`Found schema_migrations table with ${migrations.length} entries`);
      migrations.forEach((m: any) => {
        console.log(`  v${m.version} - installed on ${m.installed_on}`);
      });
    } catch (e) {
      console.log('  No schema_migrations table found (using Drizzle migrations)');

      try {
        const prismaSchemas = await sql`
          SELECT name, "when"
          FROM _prisma_migrations
          ORDER BY "when" DESC
          LIMIT 10
        `;
        console.log(`Found _prisma_migrations table with ${prismaSchemas.length} entries`);
      } catch (e2) {
        console.log('  No Prisma migrations found');

        try {
          const drizzleSchemas = await sql`
            SELECT id, hash, created_at
            FROM _drizzle_migrations
            ORDER BY created_at DESC
            LIMIT 10
          `;
          console.log(`Found _drizzle_migrations table with ${drizzleSchemas.length} entries`);
        } catch (e3) {
          console.log('  No Drizzle migrations table found');
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('AUDIT COMPLETE');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('Error running audit:', error);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

runAudit();
