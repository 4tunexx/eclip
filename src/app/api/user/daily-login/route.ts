// Daily Login Tracking API
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userMissionProgress, missions, users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

/**
 * POST /api/user/daily-login
 * Track daily login and update daily login mission
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the daily login mission
    const [dailyLoginMission] = await db
      .select()
      .from(missions)
      .where(and(
        eq(missions.objectiveType, 'daily_login'),
        eq(missions.isActive, true)
      ))
      .limit(1);

    if (!dailyLoginMission) {
      return NextResponse.json({ 
        success: false, 
        message: 'Daily login mission not configured' 
      });
    }

    // Check if user has progress for this mission
    const [existingProgress] = await db
      .select()
      .from(userMissionProgress)
      .where(
        and(
          eq(userMissionProgress.userId, user.id),
          eq(userMissionProgress.missionId, dailyLoginMission.id)
        )
      )
      .limit(1);

    const target = dailyLoginMission.objectiveValue ?? 1;
    
    if (existingProgress) {
      const newProgress = Math.min((existingProgress.progress || 0) + 1, target);
      const isCompleted = newProgress >= target;

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
            eq(userMissionProgress.missionId, dailyLoginMission.id)
          )
        );

      // Grant rewards if just completed
      if (isCompleted && !existingProgress.completed) {
        await grantMissionRewards(user.id, dailyLoginMission);
      }

      return NextResponse.json({
        success: true,
        progress: newProgress,
        completed: isCompleted,
        target: target,
      });
    } else {
      // Create new progress
      const isCompleted = 1 >= target;
      
      await db.insert(userMissionProgress).values({
        userId: user.id,
        missionId: dailyLoginMission.id,
        progress: 1,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      });

      // Grant rewards if completed
      if (isCompleted) {
        await grantMissionRewards(user.id, dailyLoginMission);
      }

      return NextResponse.json({
        success: true,
        progress: 1,
        completed: isCompleted,
        target: target,
      });
    }
  } catch (error) {
    console.error('[Daily Login] Error:', error);
    return NextResponse.json(
      { error: 'Failed to track daily login' },
      { status: 500 }
    );
  }
}

async function grantMissionRewards(userId: string, mission: any) {
  try {
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
        
      console.log(`[Daily Login] Granted rewards to user ${userId}: +${mission.rewardXp} XP, +${mission.rewardCoins} coins`);
    }
  } catch (error) {
    console.error('[Daily Login] Error granting rewards:', error);
  }
}
