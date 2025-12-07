import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { matches, matchPlayers, users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const matchList = await db.select()
      .from(matches)
      .orderBy(desc(matches.startedAt))
      .limit(limit)
      .offset(offset);

    // Get player counts for each match
    const matchesWithDetails = await Promise.all(
      matchList.map(async (match) => {
        const players = await db.select()
          .from(matchPlayers)
          .where(eq(matchPlayers.matchId, match.id));

        return {
          ...match,
          playerCount: players.length,
        };
      })
    );

    return NextResponse.json({ matches: matchesWithDetails });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

