import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, esrThresholds } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, gte, lte } from 'drizzle-orm';

/**
 * GET /api/user/rank
 * Get current user's rank and ESR information
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .execute();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get ESR threshold information for current rank
    const esr = (userData as any).esr || 0;
    const [currentThreshold] = await db
      .select()
      .from(esrThresholds)
      .where(
        and(
          gte(esrThresholds.minEsr, esr),
          lte(esrThresholds.maxEsr, esr)
        )
      )
      .execute();

    // Get next threshold
    const [nextThreshold] = await db
      .select()
      .from(esrThresholds)
      .where(gte(esrThresholds.minEsr, esr))
      .execute();

    const rankInfo = {
      level: userData.level || 1,
      xp: userData.xp || 0,
      rank: userData.rank || 'Unranked',
      esr: esr,
      currentTier: currentThreshold?.tier || 'Unranked',
      currentDivision: currentThreshold?.division || 'IV',
      tierColor: currentThreshold?.color || '#666',
      nextTierEsr: nextThreshold?.minEsr || esr + 100,
      esrToNextTier: Math.max(0, (nextThreshold?.minEsr || esr + 100) - esr),
    };

    return NextResponse.json(rankInfo);
  } catch (error) {
    console.error('Error fetching user rank:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rank info' },
      { status: 500 }
    );
  }
}
