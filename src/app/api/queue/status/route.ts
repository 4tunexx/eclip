import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { queueTickets } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's current queue ticket
    const [ticket] = await db.select()
      .from(queueTickets)
      .where(
        and(
          eq(queueTickets.userId, user.id),
          eq(queueTickets.status, 'WAITING')
        )
      )
      .limit(1);

    if (!ticket) {
      return NextResponse.json({
        inQueue: false,
      });
    }

    return NextResponse.json({
      inQueue: true,
      ticketId: ticket.id,
      joinedAt: ticket.joinedAt.toISOString(),
      region: ticket.region,
      esr: ticket.esrAtJoin,
    });
  } catch (error) {
    console.error('Error checking queue status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

