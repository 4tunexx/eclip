import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { config } from '@/lib/config';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const sessionCookie = cookieStore.get('session');
    
    let decoded = null;
    if (sessionCookie?.value) {
      try {
        decoded = jwt.verify(sessionCookie.value, config.auth.jwtSecret);
      } catch (e) {
        decoded = { error: 'Invalid token' };
      }
    }

    return NextResponse.json({
      hasCookies: allCookies.length > 0,
      cookieCount: allCookies.length,
      cookieNames: allCookies.map(c => c.name),
      hasSession: !!sessionCookie,
      sessionValue: sessionCookie?.value ? sessionCookie.value.substring(0, 20) + '...' : null,
      decoded,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
