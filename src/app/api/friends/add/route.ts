import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
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

    if (friendId === user.id) {
      return NextResponse.json({ error: 'Cannot add yourself as friend' }, { status: 400 });
    }

    // Verify friend exists
    const [friend] = await db.select().from(users).where(eq(users.id, friendId)).limit(1);
    if (!friend) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already friends
    const existingFriendship = await db.execute(
      sql`SELECT 1 FROM friends WHERE user_id = ${user.id} AND friend_id = ${friendId}`
    );

    if (existingFriendship.length > 0) {
      return NextResponse.json({ error: 'Already friends' }, { status: 400 });
    }

    // Add friend (bidirectional)
    await db.execute(
      sql`INSERT INTO friends (user_id, friend_id, status, created_at) 
          VALUES (${user.id}, ${friendId}, 'accepted', NOW()) 
          ON CONFLICT DO NOTHING`
    );

    await db.execute(
      sql`INSERT INTO friends (user_id, friend_id, status, created_at) 
          VALUES (${friendId}, ${user.id}, 'accepted', NOW()) 
          ON CONFLICT DO NOTHING`
    );

    return NextResponse.json({ success: true, message: 'Friend added' });
  } catch (error) {
    console.error('[Friends Add] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
