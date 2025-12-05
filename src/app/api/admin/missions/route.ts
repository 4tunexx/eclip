import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { missions, rolePermissions } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

async function checkAdminPermission(userId: string) {
  const [perm] = await db.select()
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.userId, userId),
        eq(rolePermissions.permission, 'manage_missions')
      )
    )
    .limit(1);

  return !!perm;
}

/**
 * GET /api/admin/missions
 * Get all missions for admin panel
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

    const allMissions = await db.select().from(missions);

    return NextResponse.json(allMissions);
  } catch (error) {
    console.error('Error fetching missions for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch missions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/missions
 * Create a new mission
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

    const missionData = await request.json();

    const [created] = await db.insert(missions)
      .values({
        id: uuidv4(),
        title: missionData.title,
        description: missionData.description,
        category: missionData.category,
        isDaily: missionData.isDaily || false,
        isActive: true,
        metricName: missionData.metricName,
        objectiveValue: missionData.objectiveValue,
        rewardXp: missionData.rewardXp || 0,
        rewardCoins: missionData.rewardCoins || '0',
        resetInterval: missionData.resetInterval || 'never',
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating mission:', error);
    return NextResponse.json(
      { error: 'Failed to create mission' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/missions/[id]
 * Update a mission
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
    const missionId = url.pathname.split('/').pop();
    const missionData = await request.json();

    const [updated] = await db.update(missions)
      .set({
        title: missionData.title,
        description: missionData.description,
        category: missionData.category,
        isDaily: missionData.isDaily,
        isActive: missionData.isActive,
        metricName: missionData.metricName,
        objectiveValue: missionData.objectiveValue,
        rewardXp: missionData.rewardXp,
        rewardCoins: missionData.rewardCoins,
        resetInterval: missionData.resetInterval,
        updatedAt: new Date(),
      })
      .where(eq(missions.id, missionId!))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating mission:', error);
    return NextResponse.json(
      { error: 'Failed to update mission' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/missions/[id]
 * Delete/deactivate a mission
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
    const missionId = url.pathname.split('/').pop();

    const [updated] = await db.update(missions)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(missions.id, missionId!))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mission:', error);
    return NextResponse.json(
      { error: 'Failed to delete mission' },
      { status: 500 }
    );
  }
}
