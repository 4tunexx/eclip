import 'dotenv/config';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

/**
 * Run database migrations for Eclip
 * This script creates missing tables and ensures schema alignment
 * 
 * Usage: npx ts-node scripts/run-database-migrations.ts
 */

async function runMigrations() {
  console.log('Starting database migrations...');
  
  try {
    // 1. Create direct_messages table
    console.log('Creating direct_messages table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS public.direct_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ direct_messages table created');

    // 2. Create indexes for direct_messages
    console.log('Creating indexes for direct_messages...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id 
      ON public.direct_messages(sender_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient_id 
      ON public.direct_messages(recipient_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_direct_messages_read 
      ON public.direct_messages(read);
    `);
    console.log('✓ Indexes created');

    // 3. Add missing columns to users table
    console.log('Adding missing columns to users table...');
    await db.execute(sql`
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
    `);
    await db.execute(sql`
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN DEFAULT false;
    `);
    await db.execute(sql`
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    `);
    console.log('✓ Users table columns added');

    // 4. Verify tables exist
    console.log('\nVerifying schema...');
    const tables = await db.execute(sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('✓ Tables in database:', (tables as any).rows?.length || 0);

    // 5. Check if direct_messages table exists
    const dmTable = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'direct_messages'
      );
    `);
    
    const exists = (dmTable as any).rows?.[0]?.exists;
    if (exists) {
      console.log('✓ direct_messages table verified');
    } else {
      console.log('⚠ direct_messages table NOT found - please check database connection');
    }

    console.log('\n✓ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    console.error('Error details:', (error as any).message);
    process.exit(1);
  }
}

runMigrations();
