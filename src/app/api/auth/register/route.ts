import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword, createSession } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import { getRankFromESR } from '@/lib/rank-calculator';
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
      // Check duplicates
      const [existingEmail] = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.email, validated.email))
        .limit(1);
      if (existingEmail) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
      }
      const [existingUsername] = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.username, validated.username))
        .limit(1);
      if (existingUsername) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }

      // Calculate rank from ESR using real rank calculator
      const defaultEsr = 1000;
      const rankInfo = getRankFromESR(defaultEsr);

      // Insert respecting live schema (steam_id NOT NULL)
      const [user] = await db.insert(users).values({
        email: validated.email,
        username: validated.username,
        passwordHash,
        emailVerificationToken,
        emailVerified: false,
        level: 1,
        xp: 0,
        esr: defaultEsr,
        rank: rankInfo.tier,
        rankTier: rankInfo.tier,
        rankDivision: rankInfo.division,
        coins: '0',
        role: 'USER',
        steamId: `temp-${crypto.randomUUID()}`, // placeholder until user links Steam
        eclipId: crypto.randomUUID(), // unique as well
      }).returning({ id: users.id, email: users.email, username: users.username });
      createdUser = { id: user.id, email: validated.email, username: user.username };
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
          
          const defaultEsr = 1000;
          const rankInfo = getRankFromESR(defaultEsr);

          const [user] = await db.insert(users).values({
            email: validated.email,
            username: validated.username,
            passwordHash,
            emailVerificationToken,
            emailVerified: false,
            level: 1,
            xp: 0,
            esr: defaultEsr,
            rank: rankInfo.tier,
            rankTier: rankInfo.tier,
            rankDivision: rankInfo.division,
            coins: '0',
            role: 'USER',
            steamId: `temp-${crypto.randomUUID()}`,
          }).returning({ id: users.id, email: users.email, username: users.username });
          createdUser = { id: user.id, email: validated.email, username: user.username };
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

    // Send verification email (best-effort)
    try {
      await sendVerificationEmail(createdUser.email, emailVerificationToken, createdUser.username);
    } catch (err) {
      console.error('[Register] Failed to send verification email:', err);
    }

    // Do not auto-login until email is verified
    return NextResponse.json({
      success: true,
      requiresEmailVerification: true,
      message: 'Account created. Please verify your email to continue.',
    });
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

