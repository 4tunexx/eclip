import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { createSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    let verifiedUserId: string | null = null;

    // Try drizzle first
    try {
      const [userRow] = await db.select()
        .from(users)
        .where(eq(users.emailVerificationToken, token))
        .limit(1);

      if (userRow) {
        await db.update(users)
          .set({ emailVerified: true, emailVerificationToken: null })
          .where(eq(users.id, userRow.id));
        verifiedUserId = userRow.id as string;
      }
    } catch {}

    // Legacy fallback: public."EmailVerificationToken"
    if (!verifiedUserId) {
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      try {
        const cols = await sql.unsafe(
          'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2;',
          ['public', 'EmailVerificationToken']
        );
        const set = new Set(cols.map((c: any) => c.column_name));
        const tokenCol = set.has('token') ? '"token"' : null;
        const userIdCol = set.has('user_id') ? '"user_id"' : null;
        const emailCol = set.has('email') ? '"email"' : null;

        if (tokenCol && (userIdCol || emailCol)) {
          const rows = await sql.unsafe(
            `SELECT ${userIdCol || emailCol} AS ref FROM "public"."EmailVerificationToken" WHERE ${tokenCol} = $1 LIMIT 1;`,
            [token]
          );
          if (rows.length) {
            const ref = rows[0].ref;
            // Try to set verified on legacy user table if possible
            const userCols = await sql.unsafe(
              'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2;',
              ['public', 'User']
            );
            const userSet = new Set(userCols.map((c: any) => c.column_name));
            if (userIdCol && userSet.has('emailVerified')) {
              await sql.unsafe('UPDATE "public"."User" SET "emailVerified" = TRUE WHERE "id" = $1;', [ref]);
              verifiedUserId = ref;
            } else if (emailCol && userSet.has('emailVerified')) {
              await sql.unsafe('UPDATE "public"."User" SET "emailVerified" = TRUE WHERE "email" = $1;', [ref]);
              verifiedUserId = ref;
            }
            // Cleanup token
            await sql.unsafe(`DELETE FROM "public"."EmailVerificationToken" WHERE ${tokenCol} = $1;`, [token]);
          }
        }
        await sql.end({ timeout: 5 });
      } catch (e) {
        try { await sql.end({ timeout: 5 }); } catch {}
      }
    }

    if (!verifiedUserId) {
      // Token invalid or already used
      return NextResponse.redirect(new URL('/?verify=invalid', request.url));
    }

    // Create session for verified user to auto-login
    try {
      const session = await createSession(verifiedUserId);
      const isProduction = process.env.NODE_ENV === 'production' || 
                          process.env.API_BASE_URL?.includes('eclip.pro');
      
      const redirectUrl = new URL('/dashboard?verify=success', request.url);
      const response = NextResponse.redirect(redirectUrl);
      
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
    } catch (sessionErr) {
      console.error('[Verify Email] Session creation error:', sessionErr);
      // Fallback: at least redirect to dashboard verified
      return NextResponse.redirect(new URL('/dashboard?verify=success&login=manual', request.url));
    }
  } catch (error) {
    console.error('[Verify Email] Error:', error);
    return NextResponse.redirect(new URL('/?verify=error', request.url));
  }
}
 

