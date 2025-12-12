import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Get all friends of a user
    const friends = await db.execute(
      sql`SELECT u.id, u.username, u.avatar, u.esr, u.rank, u.level
          FROM friends f
          JOIN users u ON f.friend_id = u.id
          WHERE f.user_id = ${userId} AND f.status = 'accepted'
          ORDER BY u.username`
    );

    return NextResponse.json({ 
      friends: (friends as any) || [],
      count: ((friends as any)?.length) || 0
    });
  } catch (error) {
    console.error('[Friends List] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
