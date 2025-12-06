import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { missions } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

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

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allMissions = await db.select().from(missions).execute();

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

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const missionData = await request.json();

    const createdResult = await db.insert(missions)
      .values({
        id: randomUUID(),
        title: missionData.title,
        description: missionData.description,
        category: missionData.category,
        requirementType: missionData.requirementType,
        requirementValue: missionData.requirementValue,
        target: missionData.target || 1,
        isDaily: missionData.isDaily || false,
        isActive: true,
        rewardXp: missionData.rewardXp || 0,
        rewardCoins: missionData.rewardCoins || 0,
        rewardCosmeticId: missionData.rewardCosmeticId || null,
      })
      .returning()
      .execute();

    const created = createdResult[0];

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

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const missionId = url.pathname.split('/').pop();
    const missionData = await request.json();

    const updatedResult = await db.update(missions)
      .set({
        title: missionData.title,
        description: missionData.description,
        category: missionData.category,
        requirementType: missionData.requirementType,
        requirementValue: missionData.requirementValue,
        target: missionData.target,
        isDaily: missionData.isDaily,
        isActive: missionData.isActive,
        rewardXp: missionData.rewardXp,
        rewardCoins: missionData.rewardCoins,
        rewardCosmeticId: missionData.rewardCosmeticId,
        updatedAt: new Date(),
      })
      .where(eq(missions.id, missionId!))
      .returning()
      .execute();

    const updated = updatedResult[0];

    if (!updated) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      );
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

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const missionId = url.pathname.split('/').pop();

    const updatedResult = await db.update(missions)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(missions.id, missionId!))
      .returning()
      .execute();

    const updated = updatedResult[0];

    if (!updated) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      );
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
