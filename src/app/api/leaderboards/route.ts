import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Get top players by MMR
    const topPlayers = await db.select({
      id: users.id,
      username: users.username,
      avatarUrl: users.avatarUrl,
      rank: users.rank,
      mmr: users.mmr,
      level: users.level,
    })
      .from(users)
      .orderBy(desc(users.mmr))
      .limit(100);

    return NextResponse.json({ players: topPlayers });
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

