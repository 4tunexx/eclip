import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, sessions } from '@/lib/db/schema';
import { verifyPassword, createSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

async function ensureMigrations() {
  try {
    const { migrate } = await import('drizzle-orm/postgres-js/migrator');
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const postgres = await import('postgres');
    
    const client = postgres.default(process.env.DATABASE_URL!, { max: 1 });
    const migrationDb = drizzle(client);
    await migrate(migrationDb, { migrationsFolder: 'drizzle' });
    await client.end({ timeout: 5 });
    console.log('[Login] Auto-migrations completed');
  } catch (err) {
    console.error('[Login] Auto-migration failed:', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    console.log('[Login] Attempting login for:', validated.email);

    // Try Drizzle users first
    try {
      const [user] = await db.select({
        id: users.id,
        email: users.email,
        username: users.username,
        passwordHash: users.passwordHash,
        emailVerified: users.emailVerified,
        level: users.level,
        xp: users.xp,
        esr: users.esr,
        rank: users.rank,
        coins: users.coins,
        role: users.role,
      })
        .from(users)
        .where(eq(users.email, validated.email))
        .limit(1);

      if (!user || !user.passwordHash) {
        console.log('[Login] User not found in Drizzle schema');
        throw new Error('not-found');
      }

      console.log('[Login] User found in Drizzle, verifying password...');
      const isValid = await verifyPassword(validated.password, user.passwordHash);
      if (!isValid) {
        console.log('[Login] Invalid password');
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      if (!(user as any).emailVerified) {
        console.log('[Login] Email not verified');
        return NextResponse.json(
          { error: 'Please verify your email before signing in.' },
          { status: 403 }
        );
      }

      console.log('[Login] Password valid, clearing old sessions...');
      
      // Delete any existing sessions for this user to prevent stale data
      try {
        await db.delete(sessions).where(eq(sessions.userId as any, user.id));
        console.log('[Login] Cleared old sessions for user');
      } catch (err) {
        console.log('[Login] Could not clear old sessions:', err);
      }
      
      // Create NEW session
      const session = await createSession(user.id);
      console.log('[Login] Created new session');
      
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          level: user.level,
          xp: Number(user.xp),
          rank: user.rank,
          esr: user.esr,
          coins: Number(user.coins),
          role: user.role || 'USER',
        },
      });
      
      // Determine if we're on production based on API URL
      const isProduction = process.env.API_BASE_URL?.includes('www.eclip.pro') || 
                          process.env.STEAM_REALM?.includes('www.eclip.pro');
      
      console.log('[Login] Setting cookie for:', isProduction ? 'production (www.eclip.pro)' : 'development (localhost)');
      
      // Set cookie on response
      response.cookies.set({
        name: 'session',
        value: session.token,
        httpOnly: true,
        secure: isProduction, // Enable secure flag for HTTPS
        sameSite: 'lax',
        expires: session.expiresAt,
        path: '/',
        ...(isProduction && { domain: '.eclip.pro' }), // Set domain for production
      });
      
      console.log('[Login] Login successful!');
      return response;
    } catch (drizzleErr) {
      const errMsg = String(drizzleErr);
      if (errMsg.includes('does not exist') || errMsg.includes('column')) {
        console.log('[Login] Schema mismatch detected - running auto-migrations...');
        await ensureMigrations();
        
        // Retry after migration
        try {
          const [user] = await db.select({
            id: users.id,
            email: users.email,
            username: users.username,
            passwordHash: users.passwordHash,
            emailVerified: users.emailVerified,
            level: users.level,
            xp: users.xp,
            esr: users.esr,
            rank: users.rank,
            coins: users.coins,
            role: users.role,
          })
            .from(users)
            .where(eq(users.email, validated.email))
            .limit(1);

          if (!user || !user.passwordHash) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
          }

          const isValid = await verifyPassword(validated.password, user.passwordHash);
          if (!isValid) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
          }

          const session = await createSession(user.id);
          const response = NextResponse.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              level: user.level,
              xp: Number(user.xp),
              rank: user.rank,
              esr: user.esr,
              coins: Number(user.coins),
              role: user.role || 'USER',
            },
          });
          
          // Determine if we're on production based on API URL
          const isProduction = process.env.API_BASE_URL?.includes('www.eclip.pro') || 
                              process.env.STEAM_REALM?.includes('www.eclip.pro');
          
          response.cookies.set({
            name: 'session',
            value: session.token,
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            expires: session.expiresAt,
            path: '/',
            ...(isProduction && { domain: '.eclip.pro' }),
          });
          return response;
        } catch (retryErr) {
          console.error('[Login] Retry failed:', retryErr);
          throw retryErr;
        }
      }
      throw drizzleErr;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Login] Error:', error);
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }
}

