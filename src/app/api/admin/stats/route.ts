import { db } from '@/lib/db';
import { users, matches, cosmetics } from '@/lib/db/schema';
import { count } from 'drizzle-orm';
import { getCurrentUser, isUserAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isUserAdmin(user)) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get real stats from database
    const [totalUsers, totalMatches, totalCosmetics] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(matches),
      db.select({ count: count() }).from(cosmetics),
    ]);

    return Response.json({
      totalUsers: totalUsers[0]?.count || 0,
      totalMatches: totalMatches[0]?.count || 0,
      totalCosmetics: totalCosmetics[0]?.count || 0,
      systemHealth: 100,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return Response.json(
      { 
        totalUsers: 0,
        totalMatches: 0,
        totalCosmetics: 0,
        systemHealth: 0,
      },
      { status: 500 }
    );
  }
}
