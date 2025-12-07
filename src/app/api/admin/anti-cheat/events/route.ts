import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { acEvents, users, matches } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MOD')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const matchId = searchParams.get('matchId');
    const reviewed = searchParams.get('reviewed');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db.select({
      event: acEvents,
      user: {
        id: users.id,
        username: users.username,
        avatar: users.avatar,
      },
    })
      .from(acEvents)
      .innerJoin(users, eq(acEvents.userId, users.id))
      .orderBy(desc(acEvents.createdAt))
      .limit(limit)
      .offset(offset);

    // Add filters
    if (userId) {
      query = query.where(eq(acEvents.userId, userId)) as any;
    }

    if (matchId) {
      query = query.where(eq(acEvents.matchId, matchId)) as any;
    }

    if (reviewed !== null) {
      query = query.where(eq(acEvents.reviewed, reviewed === 'true')) as any;
    }

    const events = await query;

    return NextResponse.json({
      events: events.map(({ event, user }) => ({
        id: event.id,
        userId: event.userId,
        username: user.username,
        matchId: event.matchId,
        code: event.code,
        severity: event.severity,
        details: event.details,
        reviewed: event.reviewed,
        createdAt: event.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching AC events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

