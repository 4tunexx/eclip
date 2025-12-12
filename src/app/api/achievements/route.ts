import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { achievements, achievementProgress } from '@/lib/db/schema';
import { getCurrentUser, isUserAdmin } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/achievements
 * Get all achievements, optionally filtered by category
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    const achievementsQuery = category
      ? db.select().from(achievements).where(eq(achievements.category, category))
      : db.select().from(achievements);

    const allAchievements = await achievementsQuery.execute();

    // Get user's progress for each achievement
    const progressData = await db
      .select()
      .from(achievementProgress)
      .where(eq(achievementProgress.userId, user.id))
      .execute();

    const progressMap = new Map(progressData.map(p => [p.achievementId, p]));

    const achievementsWithProgress = allAchievements.map(achievement => ({
      ...achievement,
      userProgress: progressMap.has(achievement.id)
        ? { ...progressMap.get(achievement.id), progress: progressMap.get(achievement.id)?.currentProgress ?? 0 }
        : null,
      unlocked: progressMap.has(achievement.id) && progressMap.get(achievement.id)?.unlockedAt !== null,
    }));

    return NextResponse.json(achievementsWithProgress);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/achievements/track
 * Track achievement progress (called by backend when metrics update)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, achievementId, progress } = await request.json();

    if (!userId || !achievementId || progress === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify requester is admin or system
    const user = await getCurrentUser();
    if (!user || !isUserAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get achievement
    const achievementResult = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, achievementId))
      .execute();

    const achievement = achievementResult[0];
    if (!achievement) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    // Get or create progress record
    const existingProgressResult = await db
      .select()
      .from(achievementProgress)
      .where(and(
        eq(achievementProgress.userId, userId),
        eq(achievementProgress.achievementId, achievementId)
      ))
      .limit(1)
      .execute();

    const existingProgress = existingProgressResult[0];

    const target = achievement.target || 1;
    const baseProgress = existingProgress?.currentProgress || 0;
    const updatedProgress = Math.min(baseProgress + progress, target);
    const shouldUnlock = updatedProgress >= target && (!existingProgress || !existingProgress.unlockedAt);

    if (existingProgress) {
      await db
        .update(achievementProgress)
        .set({
          currentProgress: updatedProgress,
          unlockedAt: shouldUnlock ? new Date() : existingProgress.unlockedAt,
          updatedAt: new Date(),
        })
        .where(and(
          eq(achievementProgress.userId, userId),
          eq(achievementProgress.achievementId, achievementId)
        ))
        .execute();

      return NextResponse.json({
        success: true,
        progress: {
          ...existingProgress,
            currentProgress: updatedProgress,
            progress: updatedProgress,
          unlockedAt: shouldUnlock ? new Date() : existingProgress.unlockedAt,
        },
        unlocked: shouldUnlock,
      });
    } else {
      const createdResult = await db
        .insert(achievementProgress)
        .values({
          userId,
          achievementId,
          currentProgress: updatedProgress,
          unlockedAt: shouldUnlock ? new Date() : null,
        })
        .returning()
        .execute();

      const created = createdResult[0];

      return NextResponse.json({
        success: true,
        progress: created,
        unlocked: shouldUnlock,
      });
    }
  } catch (error) {
    console.error('Error tracking achievement:', error);
    return NextResponse.json(
      { error: 'Failed to track achievement' },
      { status: 500 }
    );
  }
}
