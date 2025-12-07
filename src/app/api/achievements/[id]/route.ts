import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { achievements, achievementProgress } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/achievements/[id]
 * Get detailed info about a specific achievement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [achievement] = await db.select()
      .from(achievements)
      .where(eq(achievements.id, id));

    if (!achievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

    // Get user's progress
    const [progress] = await db.select()
      .from(achievementProgress)
      .where(
        and(
          eq(achievementProgress.userId, user.id),
          eq(achievementProgress.achievementId, id)
        )
      )
      .limit(1);

    return NextResponse.json({
      ...achievement,
      userProgress: progress || null,
      unlocked: progress?.unlockedAt !== null && progress?.unlockedAt !== undefined,
    });
  } catch (error) {
    console.error('Error fetching achievement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievement' },
      { status: 500 }
    );
  }
}
