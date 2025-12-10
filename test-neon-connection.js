#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const postgres = require('postgres');

const url = process.env.DATABASE_URL;

if (!url) {
  console.error('ERROR: DATABASE_URL not set');
  process.exit(1);
}

console.log('Attempting to connect to Neon database...');
console.log('URL (masked):', url.replace(/:[^@]+@/, ':***@'));
console.log('');

const sql = postgres(url, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 10,
});

sql`SELECT NOW() as time, version()`
  .then(result => {
    console.log('✅ CONNECTION SUCCESSFUL!');
    console.log('');
    console.log('Server time:', result[0].time);
    console.log('PostgreSQL version:', result[0].version);
    sql.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ CONNECTION FAILED');
    console.error('');
    console.error('Error:', err.message);
    console.error('Code:', err.code);
    console.error('');
    
    if (err.code === 'ENOTFOUND') {
      console.error('💡 DNS cannot resolve the hostname');
      console.error('   This is a network/DNS issue with the dev container');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('💡 Connection refused');
      console.error('   Check if Neon database is running');
    } else if (err.code === 'ETIMEDOUT') {
      console.error('💡 Connection timeout');
      console.error('   Network may be unreachable');
    }
    
    process.exit(1);
  });
