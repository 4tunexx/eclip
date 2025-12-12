#!/usr/bin/env node

/**
 * Check for database triggers
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && !key.startsWith('#')) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

Object.assign(process.env, envVars);

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found!');
  process.exit(1);
}

const postgres = require('postgres');

async function checkTriggers() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('🔍 CHECKING DATABASE TRIGGERS');
    console.log('═'.repeat(70));
    
    // Get all triggers
    const triggers = await sql`
      SELECT 
        trigger_name,
        event_object_table,
        event_manipulation,
        action_statement
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `;

    if (triggers.length === 0) {
      console.log('No triggers found.\n');
    } else {
      console.log(`Found ${triggers.length} triggers:\n`);
      triggers.forEach(t => {
        console.log(`📌 Trigger: ${t.trigger_name}`);
        console.log(`   Table: ${t.event_object_table}`);
        console.log(`   Event: ${t.event_manipulation}`);
        console.log(`   Action: ${t.action_statement?.substring(0, 100)}...`);
        console.log('');
      });
    }

    // Check users table triggers specifically
    const usersTriggers = await sql`
      SELECT 
        trigger_name,
        action_statement
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      AND event_object_table = 'users'
    `;

    if (usersTriggers.length > 0) {
      console.log('\n⚠️ TRIGGERS ON USERS TABLE:');
      console.log('═'.repeat(70));
      usersTriggers.forEach(t => {
        console.log(`\nTrigger: ${t.trigger_name}`);
        console.log(`Code:\n${t.action_statement}`);
      });
    } else {
      console.log('\nNo triggers on users table.');
    }

    await sql.end();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkTriggers();
