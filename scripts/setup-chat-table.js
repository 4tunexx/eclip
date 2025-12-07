require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const { sql } = require('drizzle-orm');
const postgres = require('postgres');

async function setupChatTable() {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      console.error('DATABASE_URL is not set');
      process.exit(1);
    }

    const client = postgres(url, { max: 1 });
    const db = drizzle(client);

    console.log('Creating chat_messages table...');
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `));

    console.log('Creating indexes...');
    await db.execute(sql.raw(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id)
    `));

    await db.execute(sql.raw(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC)
    `));

    console.log('✅ Chat messages table created successfully');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up chat table:', error);
    process.exit(1);
  }
}

setupChatTable();
