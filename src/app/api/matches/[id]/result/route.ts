import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { matches, matchPlayers, users, transactions, userMissionProgress, missions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const resultSchema = z.object({
  winnerTeam: z.number(), // Team 1 or 2
  players: z.array(z.object({
    userId: z.string().uuid(),
    kills: z.number(),
    deaths: z.number(),
    assists: z.number(),
    hsPercentage: z.number(),
    mvps: z.number(),
    adr: z.number(),
  })),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    const body = await request.json();
    const { winnerTeam, players: playerStats } = resultSchema.parse(body);

    // Get match
    const [match] = await db.select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1);

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    await db.transaction(async (tx) => {
      // Update match
      await tx.update(matches)
        .set({
          status: 'FINISHED',
          winnerTeam: winnerTeam.toString(), // Store winner team
          endedAt: new Date(),
        })
        .where(eq(matches.id, matchId));

      // Update player stats
      for (const stats of playerStats) {
        const [matchPlayer] = await tx.select()
          .from(matchPlayers)
          .where(and(
            eq(matchPlayers.matchId, matchId),
            eq(matchPlayers.userId, stats.userId)
          ))
          .limit(1);

        if (matchPlayer) {
          await tx.update(matchPlayers)
            .set({
              kills: stats.kills,
              deaths: stats.deaths,
              assists: stats.assists,
              hsPercentage: stats.hsPercentage,
              mvps: stats.mvps,
              adr: stats.adr.toString(),
              isWinner: matchPlayer.team === winnerTeam,
            })
            .where(eq(matchPlayers.id, matchPlayer.id));

          // Get user
          const [user] = await tx.select()
            .from(users)
            .where(eq(users.id, stats.userId))
            .limit(1);

          if (user) {
            const isWinner = matchPlayer.team === winnerTeam;
            
            // Calculate base rewards
            let xpReward = isWinner ? 100 : 50;
            let coinReward = isWinner ? 0.10 : 0.02;
            let esrChange = isWinner ? 25 : -15;

            // Apply VIP bonuses if user is VIP
            if (user.isVip) {
              xpReward = Math.floor(xpReward * 1.2); // +20% XP
              esrChange = Math.floor(esrChange * 1.1); // +10% ESR
            }

            // Update XP and level
            const newXP = Number(user.xp) + xpReward;
            const newLevel = Math.floor(newXP / 200) + 1;

            // Update ESR (simple ELO-like calculation)
            const newESR = Math.max(0, (user as any).esr + esrChange);

            // Update user
            await tx.update(users)
              .set({
                xp: newXP,
                level: newLevel,
                esr: newESR,
                coins: (Number(user.coins) + coinReward).toString(),
              })
              .where(eq(users.id, user.id));

            // Create transaction record
            await tx.insert(transactions).values({
              userId: user.id,
              type: 'REWARD',
              amount: coinReward.toString(),
              description: `Match reward (${isWinner ? 'Win' : 'Loss'})`,
              referenceId: matchId,
            });

            // TODO: Update mission progress
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error processing match result:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

