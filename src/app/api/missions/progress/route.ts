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
    const missionType = url.searchParams.get('type'); // 'DAILY', 'WEEKLY', 'ACHIEVEMENT'
    const isDaily = url.searchParams.get('daily') === 'true';

    const filters = [eq(missions.isActive, true)];
    if (missionType) {
      filters.push(eq(missions.type, missionType));
    }
    if (isDaily) {
      filters.push(eq(missions.type, 'DAILY'));
    }

    const allMissions = await db
      .select()
      .from(missions)
      .where(filters.length > 1 ? and(...filters) : filters[0])
      .execute();

    // Get user's progress for each mission
    const progressData = await db
      .select()
      .from(userMissionProgress)
      .where(eq(userMissionProgress.userId, user.id))
      .execute();

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
    const existingProgress = await db
      .select()
      .from(userMissionProgress)
      .where(
        and(
          eq(userMissionProgress.userId, user.id),
          eq(userMissionProgress.missionId, missionId)
        )
      )
      .limit(1)
      .execute();

    const mission = await db
      .select()
      .from(missions)
      .where(eq(missions.id, missionId))
      .limit(1)
      .execute();

    if (!mission[0]) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    const missionTarget = mission[0].target ?? 0;

    let progressRecord;

    if (existingProgress[0]) {
      // Update existing
      const newProgress = Math.min(
        (existingProgress[0].progress || 0) + progress,
        missionTarget
      );

      const isCompleted = newProgress >= missionTarget;

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
        )
        .execute();

      progressRecord = { ...existingProgress[0], progress: newProgress, completed: isCompleted };

      // Grant rewards if just completed
      if (isCompleted && !existingProgress[0].completed) {
        await grantMissionRewards(user.id, mission[0]);
      }
    } else {
      // Create new
      const newProgress = Math.min(progress, missionTarget);
      const isCompleted = newProgress >= missionTarget;

      const [created] = await db.insert(userMissionProgress)
        .values({
          userId: user.id,
          missionId: missionId,
          progress: newProgress,
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : null,
        })
        .returning()
        .execute();

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
    const [currentUser] = await db.select().from(users).where(eq(users.id, userId)).execute();

    if (currentUser) {
      const newXp = currentUser.xp + (mission.rewardXp || 0);
      const newCoins = parseFloat(String(currentUser.coins ?? '0')) + Number(mission.rewardCoins ?? 0);

      await db.update(users)
        .set({
          xp: newXp,
          coins: newCoins.toString(),
        })
        .where(eq(users.id, userId))
        .execute();
    }
  } catch (error) {
    console.error('Error granting mission rewards:', error);
  }
}
