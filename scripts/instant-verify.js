#!/usr/bin/env node

/**
 * ECLIP INSTANT VERIFICATION
 * Ultra-quick check - just run it and see results immediately
 * Usage: node scripts/instant-verify.js
 */

require('dotenv').config({ path: '.env.local' });

console.log('\n🚀 ECLIP INSTANT VERIFICATION\n');

// 1. Environment
console.log('✓ Environment Check:');
console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✅ SET' : '❌ MISSING'}`);
console.log(`  .env.local: ${require('fs').existsSync('.env.local') ? '✅ EXISTS' : '❌ MISSING'}`);

// 2. Dependencies
console.log('\n✓ Dependencies:');
const hasNodeModules = require('fs').existsSync('node_modules');
console.log(`  node_modules: ${hasNodeModules ? '✅ EXISTS' : '❌ MISSING (run: npm install)'}`);

if (hasNodeModules) {
  const hasPg = require('fs').existsSync('node_modules/pg');
  const hasNext = require('fs').existsSync('node_modules/next');
  const hasDrizzle = require('fs').existsSync('node_modules/drizzle-orm');
  
  console.log(`  pg (database): ${hasPg ? '✅' : '❌'}`);
  console.log(`  next: ${hasNext ? '✅' : '❌'}`);
  console.log(`  drizzle-orm: ${hasDrizzle ? '✅' : '❌'}`);
}

// 3. Source files
console.log('\n✓ Source Files:');
const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'src/contexts/UserContext.tsx',
  'src/components/layout/header.tsx',
  'src/lib/db/schema.ts',
  'src/app/api/auth/me/route.ts',
  'src/app/api/auth/logout/route.ts',
  'src/app/(app)/dashboard/page.tsx',
];

criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${file}: ${exists ? '✅' : '❌'}`);
});

// 4. Try database connection
console.log('\n✓ Database Connection Test:');

if (process.env.DATABASE_URL) {
  const { Client } = require('pg');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  client.connect()
    .then(() => {
      console.log(`  ✅ Connected to Neon`);
      
      // Quick query
      return client.query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as users,
          (SELECT COUNT(*) FROM users WHERE role = 'ADMIN') as admins,
          (SELECT COUNT(*) FROM "forumCategories") as forum_cats
      `);
    })
    .then(result => {
      const data = result.rows[0];
      console.log(`  Users: ${data.users}`);
      console.log(`  Admins: ${data.admins} ${data.admins == 0 ? '⚠️ NONE FOUND' : ''}`);
      console.log(`  Forum Categories: ${data.forum_cats} ${data.forum_cats == 0 ? '⚠️ NONE FOUND' : ''}`);
    })
    .catch(err => {
      console.log(`  ❌ Connection failed: ${err.message}`);
    })
    .finally(() => {
      client.end();
      console.log('\n✨ Done!\n');
    });
} else {
  console.log(`  ❌ DATABASE_URL not set - cannot test connection`);
  console.log('\n✨ Done!\n');
}
