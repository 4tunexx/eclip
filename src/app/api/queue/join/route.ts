import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { queueTickets, users, matches } from '@/lib/db/schema';
import { getCurrentUser, checkFullVerification } from '@/lib/auth';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is already in queue
    const [existingTicket] = await db.select()
      .from(queueTickets)
      .where(
        and(
          eq(queueTickets.userId, user.id),
          eq(queueTickets.status, 'WAITING')
        )
      )
      .limit(1);

    if (existingTicket) {
      return NextResponse.json(
        { error: 'Already in queue' },
        { status: 400 }
      );
    }

    // Check if user has verified email and Steam account
    const verification = await checkFullVerification(user);
    if (!verification.verified) {
      return NextResponse.json(
        { error: verification.reason || 'Email and Steam verification required to queue' },
        { status: 403 }
      );
    }

    // TODO: When Windows .exe client is ready, verify AC is active
    // const redis = await getRedis();
    // const heartbeat = await redis.get(`ac:heartbeat:${user.id}`);
    // if (!heartbeat) {
    //   return NextResponse.json(
    //     { error: 'Anti-cheat client must be running' },
    //     { status: 403 }
    //   );
    // }

    // Create queue ticket
    const [ticket] = await db.insert(queueTickets).values({
      userId: user.id,
      status: 'WAITING',
      region: 'EU', // TODO: Get from user settings
      esrAtJoin: (user as any).esr,
    }).returning();

    // TODO: Start matchmaker process

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
    });
  } catch (error) {
    console.error('Error joining queue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}