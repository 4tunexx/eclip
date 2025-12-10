#!/usr/bin/env node

const { sql } = require('drizzle-orm');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function check() {
  const logPath = path.join(__dirname, '..', 'logs', 'db-check.txt');
  const output = [];

  function log(msg) {
    output.push(msg);
    console.log(msg);
  }

  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      log('ERROR: DATABASE_URL not set');
      fs.writeFileSync(logPath, output.join('\n'));
      process.exit(1);
    }

    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client);

    log('Testing connection...');
    await client`SELECT 1`;
    log('✓ Connection OK\n');

    log('Checking tables...');
    const result = await client`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `;

    const tables = result.map((r) => r.table_name);
    log(`✓ Found ${tables.length} tables\n`);

    log('Critical tables:');
    const critical = ['users', 'sessions', 'notifications', 'direct_messages'];
    for (const t of critical) {
      if (tables.includes(t)) {
        log(`  ✓ ${t}`);
      } else {
        log(`  ✗ ${t} MISSING`);
      }
    }

    if (tables.includes('direct_messages')) {
      log('\nDirect Messages table structure:');
      const cols = await client`
        SELECT column_name, data_type 
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'direct_messages'
        ORDER BY ordinal_position
      `;
      for (const col of cols) {
        log(`  - ${col.column_name}: ${col.data_type}`);
      }

      // Count rows
      const count = await client`SELECT COUNT(*) as cnt FROM direct_messages`;
      log(`\nMessages in table: ${count[0].cnt}`);
    }

    await client.end();
    log('\n✓ Check complete');
    fs.writeFileSync(logPath, output.join('\n'));
    process.exit(0);
  } catch (error) {
    log(`ERROR: ${error.message}`);
    fs.writeFileSync(logPath, output.join('\n'));
    process.exit(1);
  }
}

check();
