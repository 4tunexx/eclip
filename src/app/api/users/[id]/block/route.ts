import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, sql } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: blockedUserId } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!blockedUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (blockedUserId === user.id) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 });
    }

    // Verify user exists
    const [targetUser] = await db.select().from(users).where(eq(users.id, blockedUserId)).limit(1);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already blocked
    const alreadyBlocked = await db.execute(
      sql`SELECT 1 FROM blocked_users WHERE user_id = ${user.id} AND blocked_user_id = ${blockedUserId}`
    );

    if (alreadyBlocked.length > 0) {
      return NextResponse.json({ error: 'User already blocked' }, { status: 400 });
    }

    // Add block
    await db.execute(
      sql`INSERT INTO blocked_users (user_id, blocked_user_id, reason, created_at) 
          VALUES (${user.id}, ${blockedUserId}, ${reason || null}, NOW())`
    );

    return NextResponse.json({ success: true, message: 'User blocked' });
  } catch (error) {
    console.error('[Block User] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: blockedUserId } = await params;

    if (!blockedUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Remove block
    await db.execute(
      sql`DELETE FROM blocked_users WHERE user_id = ${user.id} AND blocked_user_id = ${blockedUserId}`
    );

    return NextResponse.json({ success: true, message: 'User unblocked' });
  } catch (error) {
    console.error('[Unblock User] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
