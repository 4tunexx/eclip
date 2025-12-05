import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { missions, userMissionProgress } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

/**
 * GET /api/missions/[id]
 * Get detailed info about a specific mission
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [mission] = await db.select()
      .from(missions)
      .where(eq(missions.id, params.id));

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    // Get user's progress
    const [progress] = await db.select()
      .from(userMissionProgress)
      .where(eq(userMissionProgress.missionId, params.id))
      .limit(1);

    return NextResponse.json({
      ...mission,
      userProgress: progress || null,
    });
  } catch (error) {
    console.error('Error fetching mission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mission' },
      { status: 500 }
    );
  }
}
