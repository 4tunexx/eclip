import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { achievements, rolePermissions } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

async function checkAdminPermission(userId: string) {
  const [perm] = await db.select()
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.userId, userId),
        eq(rolePermissions.permission, 'manage_achievements')
      )
    )
    .limit(1);

  return !!perm;
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

    const hasPermission = await checkAdminPermission(user.id);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allAchievements = await db.select().from(achievements);

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

    const hasPermission = await checkAdminPermission(user.id);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const achievementData = await request.json();

    const [created] = await db.insert(achievements)
      .values({
        id: uuidv4(),
        title: achievementData.title,
        description: achievementData.description,
        category: achievementData.category,
        metricType: achievementData.metricType,
        progressRequired: achievementData.progressRequired,
        badgeRewardId: achievementData.badgeRewardId || null,
        isRepeatable: achievementData.isRepeatable || false,
        isActive: true,
        iconUrl: achievementData.iconUrl || null,
        createdAt: new Date(),
      })
      .returning();

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

    const hasPermission = await checkAdminPermission(user.id);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const achievementId = url.pathname.split('/').pop();
    const achievementData = await request.json();

    const [updated] = await db.update(achievements)
      .set({
        title: achievementData.title,
        description: achievementData.description,
        category: achievementData.category,
        metricType: achievementData.metricType,
        progressRequired: achievementData.progressRequired,
        badgeRewardId: achievementData.badgeRewardId,
        isRepeatable: achievementData.isRepeatable,
        isActive: achievementData.isActive,
        iconUrl: achievementData.iconUrl,
        updatedAt: new Date(),
      })
      .where(eq(achievements.id, achievementId!))
      .returning();

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

    const hasPermission = await checkAdminPermission(user.id);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const achievementId = url.pathname.split('/').pop();

    const [updated] = await db.update(achievements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(achievements.id, achievementId!))
      .returning();

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
