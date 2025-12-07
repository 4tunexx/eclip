import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { matches, matchPlayers, queueTickets } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

// Matchmaker - finds 10 players and creates a match
export async function POST() {
  try {
    // Get waiting queue tickets grouped by region and similar ESR
    const waitingTickets = await db.select()
      .from(queueTickets)
      .where(eq(queueTickets.status, 'WAITING'))
      .limit(10);

    if (waitingTickets.length < 10) {
      return NextResponse.json({
        message: 'Not enough players in queue',
        waiting: waitingTickets.length,
      });
    }

    // Group by region (for now, just take first 10)
    // TODO: Implement proper ESR-based matching
    const selectedTickets = waitingTickets.slice(0, 10);

    // Create match
    const [match] = await db.insert(matches).values({
      status: 'PENDING',
      map: 'Mirage', // TODO: Random map selection
      ladder: 'ranked', // Required field
    }).returning();

    // Create match player entries
    const team1 = selectedTickets.slice(0, 5);
    const team2 = selectedTickets.slice(5, 10);

    await db.insert(matchPlayers).values([
      ...team1.map(ticket => ({
        matchId: match.id,
        userId: ticket.userId,
        team: 1,
        kills: 0,
        deaths: 0,
        assists: 0,
        isWinner: false,
      })),
      ...team2.map(ticket => ({
        matchId: match.id,
        userId: ticket.userId,
        team: 2,
        kills: 0,
        deaths: 0,
        assists: 0,
        isWinner: false,
      })),
    ]);

    // Update queue tickets
    await db.update(queueTickets)
      .set({
        status: 'MATCHED',
        matchId: match.id,
        matchedAt: new Date(),
      })
      .where(inArray(queueTickets.id, selectedTickets.map(t => t.id)));

    return NextResponse.json({
      success: true,
      matchId: match.id,
      message: 'Match created',
    });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

