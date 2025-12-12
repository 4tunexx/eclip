import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { getRankFromESR } from '@/lib/rank-calculator';

export async function GET() {
  try {
    // Get top players by ESR
    const topPlayers = await db.select({
      id: users.id,
      username: users.username,
      avatar: users.avatar,
      esr: users.esr,
      level: users.level,
    })
      .from(users)
      .orderBy(desc(users.esr))
      .limit(100);

    return NextResponse.json({
      players: topPlayers.map((player) => {
        const esrValue = Number(player.esr || 1000);
        const rankInfo = getRankFromESR(esrValue);
        
        return {
          id: player.id,
          username: player.username,
          avatar: player.avatar,
          rank: rankInfo.tier,
          rankTier: rankInfo.division,
          esr: esrValue,
          level: player.level || 1,
        };
      }),
    });
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

