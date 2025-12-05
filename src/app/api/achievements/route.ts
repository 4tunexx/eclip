import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { achievements, achievementProgress, users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
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

    let query = db.select().from(achievements).where(eq(achievements.isActive, true));

    if (category) {
      query = query.where(eq(achievements.category, category));
    }

    const allAchievements = await query;

    // Get user's progress for each achievement
    const progressData = await db.select()
      .from(achievementProgress)
      .where(eq(achievementProgress.userId, user.id));

    const progressMap = new Map(progressData.map(p => [p.achievementId, p]));

    const achievementsWithProgress = allAchievements.map(achievement => ({
      ...achievement,
      userProgress: progressMap.get(achievement.id) || null,
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
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [achievement] = await db.select()
      .from(achievements)
      .where(eq(achievements.id, achievementId));

    if (!achievement) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    // Get or create progress record
    const [existingProgress] = await db.select()
      .from(achievementProgress)
      .where(
        and(
          eq(achievementProgress.userId, userId),
          eq(achievementProgress.achievementId, achievementId)
        )
      )
      .limit(1);

    let progressRecord;
    const newProgress = Math.min(progress, achievement.progressRequired);
    const shouldUnlock = newProgress >= achievement.progressRequired && 
                        (!existingProgress || !existingProgress.unlockedAt);

    if (existingProgress) {
      const updatedProgress = Math.min(
        existingProgress.progress + progress,
        achievement.progressRequired
      );

      await db.update(achievementProgress)
        .set({
          progress: updatedProgress,
          unlockedAt: shouldUnlock ? new Date() : existingProgress.unlockedAt,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(achievementProgress.userId, userId),
            eq(achievementProgress.achievementId, achievementId)
          )
        );

      progressRecord = {
        ...existingProgress,
        progress: updatedProgress,
        unlockedAt: shouldUnlock ? new Date() : existingProgress.unlockedAt,
      };
    } else {
      const [created] = await db.insert(achievementProgress)
        .values({
          userId,
          achievementId,
          progress: newProgress,
          unlockedAt: shouldUnlock ? new Date() : null,
        })
        .returning();

      progressRecord = created;
    }

    // Grant badge reward if achievement just unlocked
    if (shouldUnlock && achievement.badgeRewardId) {
      await grantBadge(userId, achievement.badgeRewardId);
    }

    return NextResponse.json({
      success: true,
      progress: progressRecord,
      unlocked: shouldUnlock,
    });
  } catch (error) {
    console.error('Error tracking achievement:', error);
    return NextResponse.json(
      { error: 'Failed to track achievement' },
      { status: 500 }
    );
  }
}

async function grantBadge(userId: string, badgeId: string) {
  try {
    // Add badge to user's collection (implementation depends on badge system)
    console.log(`Badge ${badgeId} granted to user ${userId}`);
    // TODO: Implement badge granting logic
  } catch (error) {
    console.error('Error granting badge:', error);
  }
}
