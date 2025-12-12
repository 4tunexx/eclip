import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json({ error: 'friendId required' }, { status: 400 });
    }

    // Remove friend (bidirectional)
    await db.execute(
      sql`DELETE FROM friends WHERE (user_id = ${user.id} AND friend_id = ${friendId}) 
          OR (user_id = ${friendId} AND friend_id = ${user.id})`
    );

    return NextResponse.json({ success: true, message: 'Friend removed' });
  } catch (error) {
    console.error('[Friends Remove] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
