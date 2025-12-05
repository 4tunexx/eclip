import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { missions, userMissionProgress, users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/missions
 * Get all active missions or filter by category/type
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const isDaily = url.searchParams.get('daily') === 'true';

    let query = db.select().from(missions).where(eq(missions.isActive, true));

    if (category) {
      query = query.where(eq(missions.category, category));
    }
    if (isDaily) {
      query = query.where(eq(missions.isDaily, true));
    }

    const allMissions = await query;

    // Get user's progress for each mission
    const progressData = await db.select()
      .from(userMissionProgress)
      .where(eq(userMissionProgress.userId, user.id));

    const progressMap = new Map(progressData.map(p => [p.missionId, p]));

    const missionsWithProgress = allMissions.map(mission => ({
      ...mission,
      userProgress: progressMap.get(mission.id) || null,
    }));

    return NextResponse.json(missionsWithProgress);
  } catch (error) {
    console.error('Error fetching missions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch missions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/missions/progress
 * Update mission progress for user
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { missionId, progress } = await request.json();

    if (!missionId || progress === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create progress record
    const existingProgress = await db.select()
      .from(userMissionProgress)
      .where(
        and(
          eq(userMissionProgress.userId, user.id),
          eq(userMissionProgress.missionId, missionId)
        )
      )
      .limit(1);

    const mission = await db.select()
      .from(missions)
      .where(eq(missions.id, missionId))
      .limit(1);

    if (!mission[0]) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    let progressRecord;

    if (existingProgress[0]) {
      // Update existing
      const newProgress = Math.min(
        existingProgress[0].progress + progress,
        mission[0].objectiveValue
      );

      const isCompleted = newProgress >= mission[0].objectiveValue;

      await db.update(userMissionProgress)
        .set({
          progress: newProgress,
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userMissionProgress.userId, user.id),
            eq(userMissionProgress.missionId, missionId)
          )
        );

      progressRecord = { ...existingProgress[0], progress: newProgress, completed: isCompleted };

      // Grant rewards if just completed
      if (isCompleted && !existingProgress[0].completed) {
        await grantMissionRewards(user.id, mission[0]);
      }
    } else {
      // Create new
      const newProgress = Math.min(progress, mission[0].objectiveValue);
      const isCompleted = newProgress >= mission[0].objectiveValue;

      const [created] = await db.insert(userMissionProgress)
        .values({
          userId: user.id,
          missionId: missionId,
          progress: newProgress,
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : null,
        })
        .returning();

      progressRecord = created;

      // Grant rewards if completed
      if (isCompleted) {
        await grantMissionRewards(user.id, mission[0]);
      }
    }

    return NextResponse.json({
      success: true,
      progress: progressRecord,
      completed: progressRecord.completed,
      rewardGranted: progressRecord.completed,
    });
  } catch (error) {
    console.error('Error updating mission progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

async function grantMissionRewards(userId: string, mission: any) {
  try {
    // Add XP and coins to user
    const [currentUser] = await db.select().from(users).where(eq(users.id, userId));

    if (currentUser) {
      const newXp = currentUser.xp + (mission.rewardXp || 0);
      const newCoins = parseFloat(currentUser.coins || 0) + parseFloat(mission.rewardCoins || 0);

      await db.update(users)
        .set({
          xp: newXp,
          coins: newCoins.toString(),
        })
        .where(eq(users.id, userId));
    }
  } catch (error) {
    console.error('Error granting mission rewards:', error);
  }
}
