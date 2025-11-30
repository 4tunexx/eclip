import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { forumPosts, forumThreads, users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createPostSchema = z.object({
  threadId: z.string().uuid(),
  content: z.string().min(1),
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
    const { threadId, content } = createPostSchema.parse(body);

    // Check if thread exists
    const [thread] = await db.select()
      .from(forumThreads)
      .where(eq(forumThreads.id, threadId))
      .limit(1);

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    if (thread.isLocked) {
      return NextResponse.json(
        { error: 'Thread is locked' },
        { status: 403 }
      );
    }

    // Create post and update thread
    await db.transaction(async (tx) => {
      await tx.insert(forumPosts).values({
        threadId,
        authorId: user.id,
        content,
      });

      await tx.update(forumThreads)
        .set({
          replyCount: (thread.replyCount || 0) + 1,
          lastReplyAt: new Date(),
          lastReplyAuthorId: user.id,
          updatedAt: new Date(),
        })
        .where(eq(forumThreads.id, threadId));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const threadId = searchParams.get('threadId');

    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId is required' },
        { status: 400 }
      );
    }

    // Get posts for thread
    let posts = await db.select({ post: forumPosts, author: users })
      .from(forumPosts)
      .innerJoin(users, eq(forumPosts.authorId, users.id))
      .where(eq(forumPosts.threadId, threadId))
      .orderBy(forumPosts.createdAt as any);

    let formatted = posts.map(({ post, author }: any) => ({
      id: post.id,
      content: post.content,
      author: { id: author.id, username: author.username, avatarUrl: author.avatarUrl, role: author.role },
      createdAt: (post.createdAt as Date).toISOString(),
      updatedAt: (post.updatedAt as Date | null)?.toISOString?.() || null,
    }))

    // Attach rep for posts
    try {
      const postgresMod = await import('postgres')
      const sql = postgresMod.default(process.env.DATABASE_URL!, { max: 1 })
      const keys = formatted.map(p => `rep_post_${p.id}`)
      if (keys.length) {
        const rows = await sql.unsafe('SELECT "key","value" FROM "public"."KeyValueConfig" WHERE "key" = ANY($1::text[])', [keys])
        const repMap = new Map(rows.map((r:any)=>[r.key, parseInt((r.value||'0'),10)||0]))
        formatted = formatted.map(p => ({ ...p, rep: repMap.get(`rep_post_${p.id}`) || 0 }))
      }
      await sql.end({ timeout: 5 })
    } catch {}

    return NextResponse.json({ posts: formatted });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

