import { NextRequest, NextResponse } from 'next/server';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// This is a dangerous endpoint - only allow from local or with a secret
export async function POST(request: NextRequest) {
  try {
    // Verify it's a local request or has the correct secret
    const authHeader = request.headers.get('authorization');
    const secret = process.env.MIGRATION_SECRET || 'dev-only';
    
    // Only allow from localhost OR with matching secret token
    const isLocalhost = request.nextUrl.hostname === 'localhost' || 
                       request.nextUrl.hostname === '127.0.0.1';
    const hasValidSecret = authHeader === `Bearer ${secret}`;

    if (!isLocalhost && !hasValidSecret && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Unauthorized - provide valid Authorization header' },
        { status: 401 }
      );
    }

    const url = process.env.DATABASE_URL;
    if (!url) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 500 }
      );
    }

    console.log('[Migration] Starting database migrations...');

    const client = postgres(url, { max: 1 });
    const db = drizzle(client);

    // Run migrations
    await migrate(db, { migrationsFolder: 'drizzle' });

    // Verify tables
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    await client.end({ timeout: 5 });

    console.log(`[Migration] Success - ${tables.length} tables created`);

    return NextResponse.json({
      success: true,
      message: 'Database migrations completed successfully',
      tableCount: tables.length,
      tables: tables.map(t => t.table_name),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Migration] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
        hint: 'Check database connection and migration files',
      },
      { status: 500 }
    );
  }
}

// Also allow GET for monitoring
export async function GET(request: NextRequest) {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured', status: 'unhealthy' },
        { status: 500 }
      );
    }

    const client = postgres(url, { max: 1 });

    // Just check if tables exist
    const tables = await client`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `;

    await client.end({ timeout: 5 });

    const tableCount = parseInt(tables[0].count);
    const isMigrated = tableCount > 0;

    return NextResponse.json({
      status: isMigrated ? 'migrated' : 'not-migrated',
      tableCount,
      message: isMigrated 
        ? 'Database is properly migrated'
        : 'Database needs migrations - POST to this endpoint to run them',
      migrateCommand: 'curl -X POST http://your-domain/api/admin/migrate -H "Authorization: Bearer YOUR_MIGRATION_SECRET"',
    });

  } catch (error) {
    console.error('[Migration Check] Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
