#!/usr/bin/env node

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

console.log('🎯 Creating daily login mission...\n');

try {
  // Read .env.local and parse it
  const envLocalPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envLocalPath)) {
    throw new Error('.env.local not found at ' + envLocalPath);
  }
  
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  const lines = envContent.split('\n');

  const env = {};
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      env[key] = value;
    }
  });

  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL not found in .env.local');
  }

  console.log('✅ Loaded DATABASE_URL from .env.local\n');

  // Check if pg module exists
  try {
    require.resolve('pg');
  } catch (e) {
    throw new Error('pg module not found. Run: npm install pg');
  }

  // Now use it
  const { Pool } = require('pg');

  const pool = new Pool({
    connectionString: env.DATABASE_URL,
  });

  (async () => {
    let client;
    try {
      client = await pool.connect();
      console.log('✅ Connected to database\n');
    
    // The actual missions table columns from database migration:
    // id, title, description, type, objective_type, objective_value, 
    // reward_xp, reward_coins, reward_cosmetic_id, is_active, expires_at, created_at, updated_at
    
    const result = await client.query(`
      INSERT INTO missions (
        title,
        description,
        type,
        objective_type,
        objective_value,
        reward_xp,
        reward_coins,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        'Daily Login Bonus',
        'Login to Eclip.pro every day to claim your daily reward!',
        'DAILY',
        'daily_login',
        1,
        50,
        25,
        true,
        NOW(),
        NOW()
      ) ON CONFLICT DO NOTHING
      RETURNING id, title, reward_xp, reward_coins
    `);
    
    if (result.rows.length === 0) {
      console.log('⚠️  Mission already exists (no action taken)');
    } else {
      const mission = result.rows[0];
      console.log('✅ Daily login mission created successfully!\n');
      console.log('   Mission ID:', mission.id);
      console.log('   Title:', mission.title);
      console.log('   Type:', 'DAILY');
      console.log('   XP Reward:', mission.reward_xp);
      console.log('   Coin Reward:', mission.reward_coins);
      console.log('\n🎉 Users will now earn 50 XP + 25 coins for daily login!');
    }
    
  } catch (error) {
    console.error('❌ Error creating mission:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    
    // Show helpful debugging info
    console.error('\n📋 Debugging info:');
    console.error('   DATABASE_URL exists:', !!env.DATABASE_URL);
    if (env.DATABASE_URL) {
      const masked = env.DATABASE_URL.substring(0, 50) + '...';
      console.error('   Connection string (masked):', masked);
    }
    console.error('   pg module installed: yes');
    
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
  })();
} catch (error) {
  console.error('❌ Setup error:');
  console.error('   ', error.message);
  process.exit(1);
}

