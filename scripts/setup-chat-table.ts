import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function setupChatTable() {
  try {
    console.log('Creating chat_messages table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    console.log('Creating indexes...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id)
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC)
    `);

    console.log('✅ Chat messages table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up chat table:', error);
    process.exit(1);
  }
}

setupChatTable();
