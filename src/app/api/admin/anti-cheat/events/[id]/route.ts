import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { acEvents } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const reviewSchema = z.object({
  reviewed: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MOD')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const eventId = id;
    const body = await request.json();
    const { reviewed } = reviewSchema.parse(body);

    await db.update(acEvents)
      .set({
        reviewed,
        reviewedBy: reviewed ? user.id : null,
        reviewedAt: reviewed ? new Date() : null,
      })
      .where(eq(acEvents.id, eventId));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating AC event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

