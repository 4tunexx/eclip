import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { matches, matchPlayers, queueTickets, users, vip_subscriptions } from '@/lib/db/schema';
import { eq, and, inArray, gt } from 'drizzle-orm';

// Available CS2 maps
const AVAILABLE_MAPS = [
  'Mirage',
  'Inferno',
  'Ancient',
  'Nuke',
  'Anubis',
  'Vertigo',
  'Dust2',
];

function getRandomMap(): string {
  return AVAILABLE_MAPS[Math.floor(Math.random() * AVAILABLE_MAPS.length)];
}

/**
 * Group players by ESR tier for balanced matchmaking
 * VIP players get priority placement as team leaders
 */
async function createBalancedTeams(tickets: any[]) {
  // Get user details including VIP status
  const ticketIds = tickets.map(t => t.id);
  const userIds = tickets.map(t => t.userId);

  const userDetails = await db
    .select({
      id: users.id,
      esr: users.esr,
      isVip: users.isVip,
      username: users.username,
    })
    .from(users)
    .where(inArray(users.id, userIds));

  const userMap = new Map(userDetails.map(u => [u.id, u]));
  const enrichedTickets = tickets.map(t => ({
    ...t,
    user: userMap.get(t.userId),
  }));

  // Separate VIP and non-VIP players
  const vipPlayers = enrichedTickets.filter(t => t.user?.isVip);
  const nonVipPlayers = enrichedTickets.filter(t => !t.user?.isVip);

  // Sort non-VIP by ESR to create balanced teams
  nonVipPlayers.sort((a, b) => (b.user?.esr || 0) - (a.user?.esr || 0));

  // Create teams: alternate high ESR players to balance
  const team1 = [];
  const team2 = [];

  // Place VIP players first (one on each team if available)
  if (vipPlayers.length > 0) {
    team1.push(vipPlayers[0]);
    if (vipPlayers.length > 1) {
      team2.push(vipPlayers[1]);
    }
  }

  // Alternate non-VIP players for balance
  nonVipPlayers.forEach((player, index) => {
    if (index % 2 === 0) {
      team1.push(player);
    } else {
      team2.push(player);
    }
  });

  // Trim to 5 players each
  return {
    team1: team1.slice(0, 5),
    team2: team2.slice(0, 5),
  };
}

// Matchmaker - finds 10 players and creates a match
export async function POST() {
  try {
    // Get waiting queue tickets sorted by wait time (FIFO)
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

    // Select exactly 10 players
    const selectedTickets = waitingTickets.slice(0, 10);

    // Create balanced teams with ESR matching + VIP priority
    const { team1, team2 } = await createBalancedTeams(selectedTickets);

    if (team1.length < 5 || team2.length < 5) {
      return NextResponse.json({
        error: 'Failed to create balanced teams',
        status: 500,
      });
    }

    // Create match with random map selection
    const [match] = await db.insert(matches).values({
      status: 'PENDING',
      map: getRandomMap(),
      ladder: 'ranked', // Required field
    }).returning();

    // Create match player entries
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
      message: 'Match created with ESR-based matchmaking',
      team1: team1.map(t => ({ userId: t.userId, esr: t.user?.esr })),
      team2: team2.map(t => ({ userId: t.userId, esr: t.user?.esr })),
    });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

