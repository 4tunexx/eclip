import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { matches, matchPlayers, users, userProfiles } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user's matches
    const userMatches = await db.select({
      match: {
        id: matches.id,
        status: matches.status,
        map: matches.map,
        ladder: matches.ladder,
        startedAt: matches.startedAt,
        endedAt: matches.endedAt,
        winnerTeam: matches.winnerTeam,
      },
      playerStats: matchPlayers,
    })
      .from(matchPlayers)
      .innerJoin(matches, eq(matchPlayers.matchId, matches.id))
      .where(eq(matchPlayers.userId, user.id))
      .orderBy(desc(matches.startedAt))
      .limit(limit)
      .offset(offset);

    const matchesList = await Promise.all(
      userMatches.map(async ({ match, playerStats }) => {
        // Get all players in the match
        const allPlayers = await db.select({
          player: matchPlayers,
          user: users,
        })
          .from(matchPlayers)
          .innerJoin(users, eq(matchPlayers.userId, users.id))
          .where(eq(matchPlayers.matchId, match.id));

        const players = allPlayers.map(({ player, user }) => ({
          id: user.id,
          username: user.username,
          avatarUrl: user.avatar,
          rank: user.rank,
          esr: (user as any).esr,
          kills: player.kills || 0,
          deaths: player.deaths || 0,
          assists: player.assists || 0,
          hsPercentage: player.hsPercentage || 0,
          mvps: player.mvps || 0,
          adr: player.adr ? Number(player.adr) : 0,
        }));

        const isWinner = playerStats.isWinner;
        const score = match.winnerTeam 
          ? `Team ${match.winnerTeam} Won`
          : 'In Progress';

        return {
          id: match.id,
          map: match.map,
          ladder: match.ladder,
          score,
          result: isWinner ? 'Win' : 'Loss',
          date: match.startedAt ? match.startedAt.toISOString() : new Date().toISOString(),
          players,
        };
      })
    );

    return NextResponse.json({ matches: matchesList });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

