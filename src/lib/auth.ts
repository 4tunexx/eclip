import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './db';
import { users, sessions } from './db/schema';
import { eq } from 'drizzle-orm';

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

  const [session] = await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  }).returning();

  // Set HTTP-only cookie
  (await cookies()).set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return session;
}

export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Verify session exists in DB and is not expired
    const [session] = await db.select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session || new Date(session.expiresAt) < new Date()) {
      return null;
    }

    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user || null;
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

