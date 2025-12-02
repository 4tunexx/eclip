import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword, createSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import postgres from 'postgres';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Try drizzle users table; if it fails, fallback to legacy "User" table
    let createdUser: { id: string; email: string; username: string } | null = null;
    const passwordHash = await hashPassword(validated.password);
    const emailVerificationToken = crypto.randomUUID();

    try {
      // Check if user exists in drizzle users
      const [existingUser] = await db.select()
        .from(users)
        .where(eq(users.email, validated.email))
        .limit(1);
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }
      const [existingUsername] = await db.select()
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
        mmr: 1000,
        rank: 'Bronze',
        coins: '0',
        role: 'USER',
      }).returning();
      createdUser = { id: user.id as string, email: user.email, username: user.username };
    } catch (drizzleError) {
      // Fallback: legacy public."User" table and optional "EmailVerificationToken" table
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      try {
        const existingEmail = await sql.unsafe(
          'SELECT "id" FROM "public"."User" WHERE "email" = $1 LIMIT 1;',
          [validated.email]
        );
        if (existingEmail.length) {
          await sql.end({ timeout: 5 });
          return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
        }
        const existingName = await sql.unsafe(
          'SELECT "id" FROM "public"."User" WHERE "username" = $1 LIMIT 1;',
          [validated.username]
        );
        if (existingName.length) {
          await sql.end({ timeout: 5 });
          return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }
        const inserted = await sql.unsafe(
          'INSERT INTO "public"."User" ("id", "email", "username", "password", "role", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW()) RETURNING "id", "email", "username";',
          [validated.email, validated.username, passwordHash, 'USER']
        );
        const userRow = inserted[0];
        // Optional token storage
        const tokenCols = await sql.unsafe(
          'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2;',
          ['public', 'EmailVerificationToken']
        );
        const columnSet = new Set(tokenCols.map((c: any) => c.column_name));
        if (columnSet.size > 0) {
          if (columnSet.has('email') && columnSet.has('token')) {
            await sql.unsafe(
              'INSERT INTO "public"."EmailVerificationToken" ("email", "token", "createdAt") VALUES ($1, $2, NOW());',
              [validated.email, emailVerificationToken]
            );
          } else if (columnSet.has('user_id') && columnSet.has('token')) {
            await sql.unsafe(
              'INSERT INTO "public"."EmailVerificationToken" ("user_id", "token", "createdAt") VALUES ($1, $2, NOW());',
              [userRow.id, emailVerificationToken]
            );
          }
        }
        createdUser = { id: userRow.id, email: userRow.email, username: userRow.username };
        await sql.end({ timeout: 5 });
      } catch (fallbackErr) {
        try { await sql.end({ timeout: 5 }); } catch {}
        throw fallbackErr;
      }
    }

    // Send email verification
    console.log('[Register] Attempting to send verification email to:', createdUser!.email);
    try {
      const { sendVerificationEmail } = await import('@/lib/email');
      await sendVerificationEmail(createdUser!.email, emailVerificationToken, createdUser!.username);
      console.log('[Register] Verification email sent successfully');
    } catch (error) {
      console.error('[Register] Failed to send verification email:', error);
      // Continue even if email fails
    }

    // Create session for the new user
    const session = await createSession(createdUser!.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: createdUser!.id,
        email: createdUser!.email,
        username: createdUser!.username,
      },
      message: 'Registration successful. Please check your email to verify your account.',
    });

    // Set cookie on response
    response.cookies.set({
      name: 'session',
      value: session.token,
      httpOnly: true,
      secure: true,
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

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

