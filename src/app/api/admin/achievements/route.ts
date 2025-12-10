import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { achievements, rolePermissions } from '@/lib/db/schema';
import { getCurrentUser, isUserAdmin } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

async function checkAdminPermission(userId: string) {
  const permResult = await db.select()
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.role, 'ADMIN')
      )
    )
    .limit(1)
    .execute();

  return !!permResult.length;
}

/**
 * GET /api/admin/achievements
 * Get all achievements for admin panel
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allAchievements = await db.select().from(achievements).execute();

    return NextResponse.json(allAchievements);
  } catch (error) {
    console.error('Error fetching achievements for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/achievements
 * Create a new achievement
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const achievementData = await request.json();

    const createdResult = await db.insert(achievements)
      .values({
        id: randomUUID(),
        code: achievementData.code,
        name: achievementData.name,
        description: achievementData.description,
        category: achievementData.category,
        requirementType: achievementData.requirementType,
        requirementValue: achievementData.requirementValue,
        target: achievementData.target || 1,
        points: achievementData.points || 0,
        rewardXp: achievementData.rewardXp || 0,
        rewardBadgeId: achievementData.rewardBadgeId || null,
        isSecret: achievementData.isSecret || false,
        isActive: true,
      })
      .returning()
      .execute();

    const created = createdResult[0];

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating achievement:', error);
    return NextResponse.json(
      { error: 'Failed to create achievement' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/achievements/[id]
 * Update an achievement
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const achievementId = url.pathname.split('/').pop();
    const achievementData = await request.json();

    const updatedResult = await db.update(achievements)
      .set({
        name: achievementData.name,
        description: achievementData.description,
        category: achievementData.category,
        requirementType: achievementData.requirementType,
        requirementValue: achievementData.requirementValue,
        target: achievementData.target,
        points: achievementData.points,
        rewardXp: achievementData.rewardXp,
        rewardBadgeId: achievementData.rewardBadgeId,
        isSecret: achievementData.isSecret,
        isActive: achievementData.isActive,
      })
      .where(eq(achievements.id, achievementId!))
      .returning()
      .execute();

    const updated = updatedResult[0];

    if (!updated) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating achievement:', error);
    return NextResponse.json(
      { error: 'Failed to update achievement' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/achievements/[id]
 * Delete/deactivate an achievement
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const achievementId = url.pathname.split('/').pop();

    const updatedResult = await db.update(achievements)
      .set({
        isActive: false,
      })
      .where(eq(achievements.id, achievementId!))
      .returning()
      .execute();

    const updated = updatedResult[0];

    if (!updated) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    return NextResponse.json(
      { error: 'Failed to delete achievement' },
      { status: 500 }
    );
  }
}
