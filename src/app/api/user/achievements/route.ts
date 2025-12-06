import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userAchievements, achievements } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

/**
 * GET /api/user/achievements
 * Get current user's achievements with progress
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's achievements with progress
    const userAchievementsList = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, user.id))
      .execute();

    const achievementIds = userAchievementsList.map(ua => ua.achievementId);

    // Get full achievement details
    let achievementDetails: any[] = [];
    if (achievementIds.length > 0) {
      achievementDetails = await db
        .select()
        .from(achievements)
        .execute();
    }

    // Merge achievements with user progress
    const result = achievementDetails.map(achievement => {
      const userProgress = userAchievementsList.find(ua => ua.achievementId === achievement.id);
      return {
        ...achievement,
        userProgress,
        unlocked: userProgress?.unlockedAt ? true : false,
        progress: userProgress?.progress || 0,
        unlockedAt: userProgress?.unlockedAt,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
