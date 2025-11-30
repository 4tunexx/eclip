import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { forumThreads } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const createThreadSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(3).max(200),
  content: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { categoryId, title, content } = createThreadSchema.parse(body);

    const [thread] = await db.insert(forumThreads).values({
      categoryId,
      authorId: user.id,
      title,
      content,
      replyCount: 0,
      views: 0,
      isPinned: false,
      isLocked: false,
    }).returning();

    return NextResponse.json({ thread });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

