import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { queueTickets, matches, matchPlayers } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// This endpoint should be called periodically (e.g., via cron or background job)
export async function POST() {
  try {
    // Get waiting queue tickets grouped by region
    const euTickets = await db.select()
      .from(queueTickets)
      .where(and(
        eq(queueTickets.status, 'WAITING'),
        eq(queueTickets.region, 'EU')
      ))
      .limit(10);

    if (euTickets.length >= 10) {
      await createMatch(euTickets);
      return NextResponse.json({ message: 'Match created for EU region' });
    }

    // Check other regions
    const naTickets = await db.select()
      .from(queueTickets)
      .where(and(
        eq(queueTickets.status, 'WAITING'),
        eq(queueTickets.region, 'NA')
      ))
      .limit(10);

    if (naTickets.length >= 10) {
      await createMatch(naTickets);
      return NextResponse.json({ message: 'Match created for NA region' });
    }

    return NextResponse.json({ message: 'Not enough players in queue' });
  } catch (error) {
    console.error('Matchmaker error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createMatch(tickets: any[]) {
  if (tickets.length < 10) return;

  // Sort by MMR to balance teams
  const sorted = [...tickets].sort((a, b) => a.mmrAtJoin - b.mmrAtJoin);
  const team1 = [sorted[0], sorted[3], sorted[5], sorted[7], sorted[9]];
  const team2 = [sorted[1], sorted[2], sorted[4], sorted[6], sorted[8]];

  const [match] = await db.insert(matches).values({
    status: 'PENDING',
    map: 'Mirage',
    mapImageUrl: 'https://i.postimg.cc/zXkQzY8J/mirage.png',
  }).returning();

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

  // Update all tickets
  for (const ticket of tickets) {
    await db.update(queueTickets)
      .set({
        status: 'MATCHED',
        matchId: match.id,
        matchedAt: new Date(),
      })
      .where(eq(queueTickets.id, ticket.id));
  }

  return match;
}

