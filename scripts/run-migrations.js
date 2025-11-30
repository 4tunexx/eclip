require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migrations applied');
  } catch (err) {
    console.error('Migration failed:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();

