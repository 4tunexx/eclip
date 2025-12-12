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

    // Get all blocked users
    const blocked = await db.execute(
      sql`SELECT u.id, u.username, u.avatar, bu.reason, bu.created_at
          FROM blocked_users bu
          JOIN users u ON bu.blocked_user_id = u.id
          WHERE bu.user_id = ${user.id}
          ORDER BY bu.created_at DESC`
    );

    return NextResponse.json({ 
      blockedUsers: (blocked as any) || [],
      count: ((blocked as any)?.length) || 0
    });
  } catch (error) {
    console.error('[Blocked List] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
