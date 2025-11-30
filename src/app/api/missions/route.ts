import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { missions, userMissionProgress } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, or, isNull, gt } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get active missions (daily and weekly)
    const activeMissions = await db.select()
      .from(missions)
      .where(
        and(
          eq(missions.isActive, true),
          or(
            isNull(missions.expiresAt),
            gt(missions.expiresAt, new Date())
          )
        )
      );

    // Get user progress for all missions
    const userProgress = await db.select()
      .from(userMissionProgress)
      .where(eq(userMissionProgress.userId, user.id));

    const progressMap = new Map(
      userProgress.map(p => [p.missionId, p])
    );

    // Combine missions with progress
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
        rewardCoins: Number(mission.rewardCoins),
        progress: progress?.progress || 0,
        total: mission.objectiveValue,
        completed: progress?.completed || false,
        reward: mission.rewardCoins 
          ? `${Number(mission.rewardCoins)} Coins`
          : `${mission.rewardXp} XP`,
      };
    });

    // Separate daily and weekly
    const dailyMissions = missionsWithProgress.filter(m => m.type === 'DAILY');
    const weeklyMissions = missionsWithProgress.filter(m => m.type === 'WEEKLY');

    return NextResponse.json({
      daily: dailyMissions,
      weekly: weeklyMissions,
    });
  } catch (error) {
    console.error('Error fetching missions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

