import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './db';
import { users, sessions } from './db/schema';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';

import { config } from './config';

// Fallback to avoid undefined secret breaking JWT verification in production
const JWT_SECRET = config.auth.jwtSecret || 'fallback-dev-secret';
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

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return { userId: decoded.userId };
  } catch (e) {
    // Token invalid or expired - silent fail
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

// Check if user has both email and Steam verification
// Admins/Moderators bypass this check
export async function checkFullVerification(user: any): Promise<{ verified: boolean; reason?: string }> {
  const userRole = (user?.role || 'USER').toUpperCase();
  
  // Admins and moderators don't need verification
  if (userRole === 'ADMIN' || userRole === 'MODERATOR' || userRole === 'MOD') {
    return { verified: true };
  }

  // Regular users must have both email and Steam verified
  const emailVerified = user?.emailVerified === true;
  
  // Check if steamId is real (not a placeholder)
  // Real Steam IDs are 17-digit numbers
  // Placeholders start with "temp-" or end with "@steam.local"
  const steamId = user?.steamId || '';
  const isRealSteamId = /^\d{17}$/.test(steamId);

  if (!emailVerified) {
    return { verified: false, reason: 'Email must be verified' };
  }

  if (!isRealSteamId) {
    return { verified: false, reason: 'Steam account must be authenticated' };
  }

  return { verified: true };
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (token) {
    try {
      // Delete session from DB
      await db.delete(sessions).where(eq(sessions.token, token));
    } catch (error) {
      console.error('Error deleting session from DB:', error);
      // Continue with cookie deletion even if DB delete fails
    }
  }

  // Delete cookie - Next.js cookies().delete() handles all variations
  cookieStore.delete('session');
}

