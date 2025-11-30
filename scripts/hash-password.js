#!/usr/bin/env node

/**
 * Password Hash Generator
 * Usage: node scripts/hash-password.js <password>
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Password is required');
  console.log('\nUsage: node scripts/hash-password.js <password>');
  console.log('\nExample: node scripts/hash-password.js mySecurePassword123');
  process.exit(1);
}

if (password.length < 8) {
  console.warn('⚠️  Warning: Password should be at least 8 characters long');
}

console.log('🔐 Hashing password...\n');

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('✅ Password hash generated:\n');
    console.log(hash);
    console.log('\n📋 Copy this hash and use it in your SQL query to create an admin user.');
    console.log('\nExample SQL:');
    console.log(`UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@eclip.pro';`);
    console.log('\nOr for direct insert:');
    console.log(`INSERT INTO users (email, username, password_hash, role, email_verified, level, xp, mmr, rank, coins)`);
    console.log(`VALUES ('admin@eclip.pro', 'admin', '${hash}', 'ADMIN', true, 1, 0, 1000, 'Bronze', '0');`);
  })
  .catch(error => {
    console.error('❌ Error hashing password:', error);
    process.exit(1);
  });

