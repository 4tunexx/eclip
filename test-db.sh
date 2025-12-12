#!/bin/bash

# Test Neon Database Connection and Verify System Health
set -a
source .env.local
set +a

echo "🔗 Testing Neon Database Connection..."
echo "Database: $DATABASE_URL"
echo ""

# Install psql if needed and test connection
npx pg@latest -c "SELECT version();" <<< "$DATABASE_URL" 2>&1 || \
  node -e "
    const { Client } = require('pg');
    const client = new Client(process.env.DATABASE_URL);
    
    client.connect()
      .then(async () => {
        console.log('✅ Connected to Neon Database');
        
        // Get database info
        const result = await client.query('SELECT version();');
        console.log('📊 Database Info:', result.rows[0].version);
        
        // Count users
        const users = await client.query('SELECT COUNT(*) as count FROM users;');
        console.log('👥 Total Users:', users.rows[0].count);
        
        // Count admins
        const admins = await client.query(\"SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN';\");
        console.log('🔐 Admin Users:', admins.rows[0].count);
        
        // Count sessions
        const sessions = await client.query('SELECT COUNT(*) as count FROM sessions;');
        console.log('🔑 Active Sessions:', sessions.rows[0].count);
        
        // Check schema tables
        const tables = await client.query(\`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name;
        \`);
        console.log('📋 Tables in Database:', tables.rows.map(r => r.table_name).join(', '));
        
        await client.end();
      })
      .catch(err => {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
      });
  "
