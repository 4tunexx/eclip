import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword, createSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8),
});

async function ensureMigrations() {
  try {
    const { migrate } = await import('drizzle-orm/postgres-js/migrator');
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const postgresModule = await import('postgres');
    
    const client = postgresModule.default(process.env.DATABASE_URL!, { max: 1 });
    const migrationDb = drizzle(client);
    await migrate(migrationDb, { migrationsFolder: 'drizzle' });
    await client.end({ timeout: 5 });
    console.log('[Register] Auto-migrations completed');
  } catch (err) {
    console.error('[Register] Auto-migration failed:', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    let createdUser: { id: string; email: string; username: string } | null = null;
    const passwordHash = await hashPassword(validated.password);
    const emailVerificationToken = crypto.randomUUID();

    try {
      // Check if user exists
      const [existingUser] = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.email, validated.email))
        .limit(1);
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }
      const [existingUsername] = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.username, validated.username))
        .limit(1);
      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
      
      const [user] = await db.insert(users).values({
        email: validated.email,
        username: validated.username,
        passwordHash,
        emailVerificationToken,
        emailVerified: false,
        level: 1,
        xp: 0,
        esr: 1000,
        rank: 'Bronze',
        coins: '0',
        role: 'USER',
      }).returning({ id: users.id, email: users.email, username: users.username });
      createdUser = { id: user.id, email: user.email, username: user.username };
    } catch (drizzleError) {
      const errMsg = String(drizzleError);
      if (errMsg.includes('does not exist') || errMsg.includes('column')) {
        console.log('[Register] Schema mismatch - running auto-migrations...');
        await ensureMigrations();
        
        // Retry after migration
        try {
          const [existingUser] = await db.select({ id: users.id })
            .from(users)
            .where(eq(users.email, validated.email))
            .limit(1);
          if (existingUser) {
            return NextResponse.json(
              { error: 'User with this email already exists' },
              { status: 400 }
            );
          }
          const [existingUsername] = await db.select({ id: users.id })
            .from(users)
            .where(eq(users.username, validated.username))
            .limit(1);
          if (existingUsername) {
            return NextResponse.json(
              { error: 'Username already taken' },
              { status: 400 }
            );
          }
          
          const [user] = await db.insert(users).values({
            email: validated.email,
            username: validated.username,
            passwordHash,
            emailVerificationToken,
            emailVerified: false,
            level: 1,
            xp: 0,
            esr: 1000,
            rank: 'Bronze',
            coins: '0',
            role: 'USER',
          }).returning({ id: users.id, email: users.email, username: users.username });
          createdUser = { id: user.id, email: user.email, username: user.username };
        } catch (retryErr) {
          console.error('[Register] Retry failed:', retryErr);
          throw retryErr;
        }
      } else {
        throw drizzleError;
      }
    }

    if (!createdUser) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    const session = await createSession(createdUser.id);
    const response = NextResponse.json({
      success: true,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        username: createdUser.username,
      },
    });

    response.cookies.set({
      name: 'session',
      value: session.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: session.expiresAt,
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('[Register] Error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

