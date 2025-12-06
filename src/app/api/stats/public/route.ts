import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, matches, queueTickets } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';

/**
 * Public stats endpoint - returns real platform statistics
 * Used by landing page and public dashboards
 */
export async function GET() {
  try {
    // Get online players (in queue)
    const [onlineStats] = await db.select({ count: queueTickets.id }).from(queueTickets).where(eq(queueTickets.status, 'WAITING'));
    const onlinePlayers = typeof onlineStats?.count === 'string' ? parseInt(onlineStats.count) : (onlineStats?.count || 0);

    // Get active matches (in progress)
    const activeMatches = await db.select({ count: matches.id }).from(matches).where(eq(matches.status, 'LIVE'));
    const matchCount = activeMatches.length;

    // Get total coins earned by all players
    const totalCoinsResult = await db.select({ total: users.coins }).from(users);
    const totalCoins = totalCoinsResult.reduce((sum, row) => {
      const coins = typeof row.total === 'string' ? parseFloat(row.total) : (row.total || 0);
      return sum + coins;
    }, 0);

    // Get total registered users
    const [userCount] = await db.select({ count: users.id }).from(users);
    const totalUsers = typeof userCount?.count === 'string' ? parseInt(userCount.count) : (userCount?.count || 0);

    // Get total matches played (all time)
    const [totalMatches] = await db.select({ count: matches.id }).from(matches);
    const allTimeMatches = typeof totalMatches?.count === 'string' ? parseInt(totalMatches.count) : (totalMatches?.count || 0);

    return NextResponse.json({
      onlinePlayers: Math.max(onlinePlayers, 0),
      activeMatches: Math.max(matchCount, 0),
      totalCoins: Math.round(totalCoins),
      totalUsers,
      allTimeMatches,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return fallback stats on error
    return NextResponse.json(
      {
        onlinePlayers: 0,
        activeMatches: 0,
        totalCoins: 0,
        totalUsers: 0,
        allTimeMatches: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
