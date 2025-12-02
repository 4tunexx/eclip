import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { verifyPassword, createSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    // Try Drizzle users first
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.email, validated.email))
        .limit(1);

      if (!user || !user.passwordHash) {
        throw new Error('not-found');
      }

      const isValid = await verifyPassword(validated.password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
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
          mmr: user.mmr,
          coins: Number(user.coins),
          isAdmin: user.role === 'ADMIN',
        },
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
    } catch (drizzleErr) {}

    // Fallback to legacy public."User"
    const postgresMod = await import('postgres');
    const sql = postgresMod.default(process.env.DATABASE_URL!, { max: 1 });
    try {
      const rows = await sql.unsafe('SELECT "id","email","username","password","role","coins" FROM "public"."User" WHERE "email" = $1 LIMIT 1;', [validated.email]);
      if (!rows.length) {
        await sql.end({ timeout: 5 });
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }
      const u: any = rows[0];
      const isValid = await verifyPassword(validated.password, u.password);
      if (!isValid) {
        await sql.end({ timeout: 5 });
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      await sql.end({ timeout: 5 });
      const session = await createSession(u.id);
      
      const response = NextResponse.json({
        success: true,
        user: {
          id: u.id,
          email: u.email,
          username: u.username,
          level: 1,
          xp: 0,
          rank: 'Bronze',
          mmr: 1000,
          coins: Number(u.coins || 0),
          isAdmin: (u.role || '').toUpperCase() === 'ADMIN',
        },
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
    } catch (legacyErr) {
      try { await sql.end({ timeout: 5 }); } catch {}
      throw legacyErr;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

