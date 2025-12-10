import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function quickTest() {
  try {
    console.log('Testing database connection...');
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('✓ Connection successful!');
    
    const tables = await db.execute(sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name;
    `);
    
    const tableList = (tables as any).rows;
    console.log(`\n✓ Found ${tableList.length} tables:`);
    
    const criticalTables = ['users', 'sessions', 'notifications', 'direct_messages'];
    for (const table of criticalTables) {
      const exists = tableList.some((t: any) => t.table_name === table);
      console.log(`  ${exists ? '✓' : '✗'} ${table}`);
    }
    
    if (tableList.some((t: any) => t.table_name === 'direct_messages')) {
      console.log('\n✓ direct_messages table EXISTS - no migration needed!');
    } else {
      console.log('\n✗ direct_messages table MISSING - run: npm run migrate:db');
    }
    
  } catch (error) {
    console.error('✗ Connection failed:', (error as any).message);
    process.exit(1);
  }
}

quickTest();
