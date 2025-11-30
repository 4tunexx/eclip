import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { queueTickets } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Cancel user's queue ticket
    await db.update(queueTickets)
      .set({ status: 'CANCELLED' })
      .where(
        and(
          eq(queueTickets.userId, user.id),
          eq(queueTickets.status, 'WAITING')
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving queue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

