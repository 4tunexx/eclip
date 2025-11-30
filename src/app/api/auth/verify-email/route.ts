import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/auth';
import postgres from 'postgres';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    // Try drizzle: token on users table
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.emailVerificationToken, token))
        .limit(1);
      if (!user) throw new Error('not-found');
      await db.update(users)
        .set({ emailVerified: true, emailVerificationToken: null, updatedAt: new Date() })
        .where(eq(users.id, user.id));
      await createSession(user.id);
      return NextResponse.redirect(new URL('/dashboard?verified=true', request.url));
    } catch {
      // Fallback: legacy tables
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      try {
        const tokenRow = await sql.unsafe(
          'SELECT * FROM "public"."EmailVerificationToken" WHERE "token" = $1 LIMIT 1;',
          [token]
        );
        if (!tokenRow.length) {
          await sql.end({ timeout: 5 });
          return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
        }
        const row: any = tokenRow[0];
        let userId: string | null = row.user_id || null;
        let email: string | null = row.email || null;
        if (!userId && email) {
          const u = await sql.unsafe('SELECT "id" FROM "public"."User" WHERE "email" = $1 LIMIT 1;', [email]);
          userId = u.length ? u[0].id : null;
        }
        if (userId) {
          await sql.unsafe('UPDATE "public"."User" SET "emailVerifiedAt" = NOW(), "updatedAt" = NOW() WHERE "id" = $1;', [userId]);
        } else if (email) {
          await sql.unsafe('UPDATE "public"."User" SET "emailVerifiedAt" = NOW(), "updatedAt" = NOW() WHERE "email" = $1;', [email]);
        }
        // Cleanup token
        await sql.unsafe('DELETE FROM "public"."EmailVerificationToken" WHERE "token" = $1;', [token]);
        await sql.end({ timeout: 5 });
        // Redirect to login (no session creation for legacy schema)
        return NextResponse.redirect(new URL('/?verified=true', request.url));
      } catch (e) {
        try { await sql.end({ timeout: 5 }); } catch {}
        return NextResponse.redirect(new URL('/?error=verification_failed', request.url));
      }
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/login?error=verification_failed', request.url));
  }
}

