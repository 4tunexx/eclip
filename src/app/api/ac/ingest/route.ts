import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { acEvents } from '@/lib/db/schema';
import { z } from 'zod';

const acEventSchema = z.object({
  userId: z.string().uuid(),
  matchId: z.string().uuid().optional(),
  code: z.string(),
  severity: z.number().min(1).max(10),
  details: z.record(z.any()).optional(),
});

import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    // Verify AC ingest secret
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '');
    
    if (!config.ac.ingestSecret || providedSecret !== config.ac.ingestSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = acEventSchema.parse(body);

    const [event] = await db.insert(acEvents).values({
      userId: data.userId,
      matchId: data.matchId,
      code: data.code,
      severity: data.severity,
      details: data.details || null,
      reviewed: false,
    }).returning();

    // TODO: Calculate suspicion score
    // TODO: Auto-ban logic for extreme cases

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error ingesting AC event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

