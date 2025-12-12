import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { getRankFromESR } from '@/lib/rank-calculator';

/**
 * Public leaderboard - returns top players by ESR
 * Used by landing page and public leaderboards
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

    const topPlayers = await db
      .select({
        id: users.id,
        username: users.username,
        avatar: users.avatar,
        esr: users.esr,
        level: users.level,
      })
      .from(users)
      .orderBy(desc(users.esr))
      .limit(limit);

    return NextResponse.json({
      players: topPlayers.map((player) => {
        const esrValue = Number(player.esr || 1000);
        const rankInfo = getRankFromESR(esrValue);
        
        return {
          id: player.id,
          username: player.username,
          avatarUrl: player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`,
          esr: esrValue,
          rank: rankInfo.tier,
          rankTier: rankInfo.division,
          rankDivision: rankInfo.division,
          level: player.level || 1,
        };
      }),
      count: topPlayers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching top players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top players', players: [], count: 0 },
      { status: 500 }
    );
  }
}
