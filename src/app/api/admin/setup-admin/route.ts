import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';

/**
 * POST /api/admin/setup-admin
 * Creates or updates the admin user
 * 
 * This endpoint is useful for initial setup when the database is fresh
 * In production, this should be protected or removed
 */
export async function POST(request: NextRequest) {
  try {
    const adminEmail = 'admin@eclip.pro';
    const adminPassword = 'Admin123!';
    const adminUsername = 'admin';

    console.log('[Admin Setup] Setting up admin user...');

    // Hash password
    const passwordHash = await hashPassword(adminPassword);

    try {
      // Try to find existing admin
      const [existing] = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.email, adminEmail))
        .limit(1);

      if (existing) {
        // Update existing admin
        console.log('[Admin Setup] Admin exists, updating password...');
        await db.update(users)
          .set({
            passwordHash,
            role: 'ADMIN',
            username: adminUsername,
          })
          .where(eq(users.id, existing.id));
        
        return NextResponse.json({
          success: true,
          message: 'Admin user updated',
          email: adminEmail,
          password: adminPassword,
        });
      } else {
        // Create new admin
        console.log('[Admin Setup] Admin not found, creating...');
        await db.insert(users).values({
          email: adminEmail,
          username: adminUsername,
          passwordHash,
          role: 'ADMIN',
          level: 100,
          xp: 50000,
          esr: 5000,
          rank: 'Radiant',
          coins: '10000',
          emailVerified: true,
        });

        return NextResponse.json({
          success: true,
          message: 'Admin user created',
          email: adminEmail,
          password: adminPassword,
        });
      }
    } catch (drizzleErr) {
      const errMsg = String(drizzleErr);
      if (errMsg.includes('does not exist')) {
        console.log('[Admin Setup] Users table missing, running migrations...');
        
        // Run migrations
        try {
          const { migrate } = await import('drizzle-orm/postgres-js/migrator');
          const { drizzle } = await import('drizzle-orm/postgres-js');
          const postgresModule = await import('postgres');
          
          const client = postgresModule.default(process.env.DATABASE_URL!, { max: 1 });
          const migrationDb = drizzle(client);
          await migrate(migrationDb, { migrationsFolder: 'drizzle' });
          await client.end({ timeout: 5 });
          console.log('[Admin Setup] Migrations completed');

          // Retry admin creation
          const [existing] = await db.select({ id: users.id })
            .from(users)
            .where(eq(users.email, adminEmail))
            .limit(1);

          if (existing) {
            await db.update(users)
              .set({
                passwordHash,
                role: 'ADMIN',
                username: adminUsername,
              })
              .where(eq(users.id, existing.id));
          } else {
            await db.insert(users).values({
              email: adminEmail,
              username: adminUsername,
              passwordHash,
              role: 'ADMIN',
              level: 100,
              xp: 50000,
              esr: 5000,
              rank: 'Radiant',
              coins: '10000',
              emailVerified: true,
            });
          }

          return NextResponse.json({
            success: true,
            message: 'Migrations completed and admin user created',
            email: adminEmail,
            password: adminPassword,
          });
        } catch (migErr) {
          console.error('[Admin Setup] Migration error:', migErr);
          return NextResponse.json({
            success: false,
            error: 'Failed to run migrations: ' + String(migErr),
          }, { status: 500 });
        }
      }
      
      console.error('[Admin Setup] Drizzle error:', drizzleErr);
      throw drizzleErr;
    }
  } catch (error) {
    console.error('[Admin Setup] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to setup admin: ' + String(error),
    }, { status: 500 });
  }
}

/**
 * GET /api/admin/setup-admin
 * Returns setup instructions
 */
export async function GET() {
  return NextResponse.json({
    message: 'Admin Setup Endpoint',
    instructions: [
      'POST to this endpoint to create/update admin user',
      'Admin credentials will be: admin@eclip.pro / Admin123!',
      'This endpoint should be protected in production',
    ],
    usage: 'curl -X POST https://www.eclip.pro/api/admin/setup-admin',
  });
}
