import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { forumThreads, forumPosts, users } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');

    let query = db.select({
      thread: forumThreads,
      author: users,
    })
      .from(forumThreads)
      .innerJoin(users, eq(forumThreads.authorId, users.id))
      .orderBy(desc(forumThreads.lastReplyAt), desc(forumThreads.createdAt));

    if (categoryId) {
      query = query.where(eq(forumThreads.categoryId, categoryId)) as any;
    }

    const threads = await query;

    // Get last reply authors
    const threadsWithLastReply = await Promise.all(
      threads.map(async ({ thread, author }) => {
        let lastReplyAuthor = null;
        if (thread.lastReplyAuthorId) {
          const [lastAuthor] = await db.select()
            .from(users)
            .where(eq(users.id, thread.lastReplyAuthorId))
            .limit(1);
          lastReplyAuthor = lastAuthor ? {
            username: lastAuthor.username,
            avatarUrl: lastAuthor.avatarUrl,
          } : null;
        }

        return {
          id: thread.id,
          categoryId: thread.categoryId,
          title: thread.title,
          author: {
            username: author.username,
            avatarUrl: author.avatarUrl,
          },
          replies: thread.replyCount || 0,
          views: thread.views || 0,
          isPinned: thread.isPinned,
          isLocked: thread.isLocked,
          lastPost: thread.lastReplyAt ? {
            author: lastReplyAuthor,
            date: thread.lastReplyAt.toISOString(),
          } : null,
          createdAt: thread.createdAt.toISOString(),
        };
      })
    );

    return NextResponse.json({ threads: threadsWithLastReply });
  } catch (error) {
    console.error('Error fetching forum threads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

