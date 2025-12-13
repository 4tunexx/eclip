import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { missions, userMissionProgress } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const dailyOnly = url.searchParams.get('daily') === 'true';

    // Get active missions (optionally filter daily)
    const filters = [eq(missions.isActive, true)];
    if (dailyOnly) {
      // Filter missions with type === 'DAILY'
      filters.push(eq(missions.type, 'DAILY'));
    }

    const activeMissions = await db
      .select()
      .from(missions)
      .where(filters.length > 1 ? and(...filters) : filters[0])
      .execute();

    // Get user progress for all missions
    const userProgress = await db
      .select()
      .from(userMissionProgress)
      .where(eq(userMissionProgress.userId, user.id))
      .execute();

    const progressMap = new Map(
      userProgress.map(p => [p.missionId, p])
    );

    // Normalize shape for UI expectations
    const missionsWithProgress = activeMissions.map(mission => {
      const progress = progressMap.get(mission.id);
      return {
        id: mission.id,
        title: mission.title,
        description: mission.description,
        type: mission.type,
        objectiveType: mission.objectiveType,
        objectiveValue: mission.objectiveValue,
        rewardXp: mission.rewardXp,
        rewardCoins: mission.rewardCoins,
        isActive: mission.isActive,
        userProgress: progress
          ? {
              missionId: progress.missionId,
              progress: progress.progress ?? 0,
              completed: progress.completed ?? false,
              completedAt: progress.completedAt,
            }
          : null,
      };
    });

    // If daily filter requested, return array; otherwise return all active missions array
    return NextResponse.json(missionsWithProgress);
  } catch (error) {
    console.error('Error fetching missions:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Mission Error Details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

