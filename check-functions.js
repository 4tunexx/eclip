#!/usr/bin/env node

/**
 * Check function definitions
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

async function checkFunctions() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log('🔍 CHECKING DATABASE FUNCTIONS');
    console.log('═'.repeat(70));
    
    // Get function definitions
    const functions = await sql`
      SELECT 
        routine_name,
        routine_definition
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND (routine_name LIKE '%rankup%' OR routine_name LIKE '%levelup%' OR routine_name LIKE '%mmr%')
      ORDER BY routine_name
    `;

    if (functions.length === 0) {
      console.log('No matching functions found.\n');
    } else {
      console.log(`Found ${functions.length} functions:\n`);
      functions.forEach(f => {
        console.log(`📌 Function: ${f.routine_name}`);
        console.log(`Code:\n${f.routine_definition}`);
        console.log('\n' + '─'.repeat(70) + '\n');
      });
    }

    await sql.end();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkFunctions();
