import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './db';
import { users, sessions } from './db/schema';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';

import { config } from './config';

const JWT_SECRET = config.auth.jwtSecret;
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY);

  try {
    const [session] = await db.insert(sessions).values({
      userId,
      token,
      expiresAt,
    }).returning();

    (await cookies()).set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return { ...session, token, expiresAt };
  } catch {
    // Fallback to legacy public."Session" table
    const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
    try {
      const cols = await sql.unsafe(
        'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2;',
        ['public', 'Session']
      );
      const set = new Set(cols.map((c: any) => c.column_name));
      const idCol = set.has('id') ? '"id", ' : '';
      const userIdCol = set.has('user_id') ? '"user_id"' : (set.has('userId') ? '"userId"' : null);
      const tokenCol = set.has('token') ? '"token"' : null;
      const expiresCol = set.has('expires_at') ? '"expires_at"' : (set.has('expiresAt') ? '"expiresAt"' : null);
      const createdCol = set.has('created_at') ? '"created_at"' : (set.has('createdAt') ? '"createdAt"' : null);

      if (userIdCol && tokenCol) {
        const fields = `${idCol}${userIdCol}, ${tokenCol}${expiresCol ? ', ' + expiresCol : ''}${createdCol ? ', ' + createdCol : ''}`;
        const values = `${idCol ? 'gen_random_uuid(), ' : ''}$1, $2${expiresCol ? ', $3' : ''}${createdCol ? ', NOW()' : ''}`;
        const params: any[] = [userId, token];
        if (expiresCol) params.push(expiresAt);
        await sql.unsafe(
          `INSERT INTO "public"."Session" (${fields}) VALUES (${values});`,
          params
        );
      }

      (await cookies()).set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
      });

      await sql.end({ timeout: 5 });
      return { userId, token, expiresAt };
    } catch (e) {
      try { await sql.end({ timeout: 5 }); } catch {}
      throw e;
    }
  }
}

export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  console.log('[Auth] getSession called - token present:', !!token);

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    console.log('[Auth] Token decoded successfully, userId:', decoded.userId);
    
    // Verify session exists (drizzle or legacy) and is not expired
    try {
      const [session] = await db.select()
        .from(sessions)
        .where(eq(sessions.token, token))
        .limit(1);
      if (!session || new Date(session.expiresAt) < new Date()) {
        return null;
      }
      return { userId: decoded.userId };
    } catch {
      // Fallback to legacy Session table
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      try {
        const rows = await sql.unsafe(
          'SELECT "userId", "expiresAt" FROM "public"."Session" WHERE "token" = $1 LIMIT 1;',
          [token]
        );
        await sql.end({ timeout: 5 });
        if (!rows.length) {
          console.log('[Auth] No session found in legacy table');
          return null;
        }
        const expiresAt = new Date(rows[0].expiresAt);
        if (expiresAt < new Date()) {
          console.log('[Auth] Session expired');
          return null;
        }
        console.log('[Auth] Found session in legacy table, userId:', rows[0].userId);
        return { userId: rows[0].userId };
      } catch (e) {
        console.log('[Auth] Error checking legacy session:', (e as any).message);
        try { await sql.end({ timeout: 5 }); } catch {}
        return null;
      }
    }
  } catch (e) {
    console.log('[Auth] Error verifying token:', (e as any).message);
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  try {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);
    if (user) return user as any;
  } catch {}

  // Fallback: legacy public."User" table
  try {
    const postgresMod = await import('postgres');
    const sql = postgresMod.default(process.env.DATABASE_URL!, { max: 1 });
    try {
      const rows = await sql.unsafe('SELECT "id", "email", "username", "avatarUrl", "role", "coins" FROM "public"."User" WHERE "id" = $1 LIMIT 1;', [session.userId]);
      await sql.end({ timeout: 5 });
      if (rows.length) {
        const u: any = rows[0];
        return {
          id: u.id,
          email: u.email,
          username: u.username,
          avatarUrl: u.avatarUrl || null,
          role: u.role || 'USER',
          coins: u.coins || '0',
        } as any;
      }
    } catch {
      try { await sql.end({ timeout: 5 }); } catch {}
    }
  } catch {}

  return null;
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (token) {
    // Delete session from DB
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  // Delete cookie
  cookieStore.delete('session');
}

