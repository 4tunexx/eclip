import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { forumThreads, forumPosts, users } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import postgres from 'postgres';

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

    let threads: any[] = [];
    try {
      threads = await query;
    } catch (drizzleErr) {
      // Fallback to legacy public."Thread" joined with public."User"
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      try {
        const cols = await sql.unsafe('SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2;', ['public','Thread']);
        const set = new Set(cols.map((c: any) => c.column_name));
        const authorCol = set.has('author_id') ? 'author_id' : (set.has('authorId') ? 'authorId' : null);
        const lastReplyCol = set.has('last_reply_at') ? 'last_reply_at' : (set.has('lastReplyAt') ? 'lastReplyAt' : null);
        const lastReplyAuthorCol = set.has('last_reply_author_id') ? 'last_reply_author_id' : (set.has('lastReplyAuthorId') ? 'lastReplyAuthorId' : null);
        const createdCol = set.has('created_at') ? 'created_at' : (set.has('createdAt') ? 'createdAt' : null);
        const categoryCol = set.has('category_id') ? 'category_id' : (set.has('categoryId') ? 'categoryId' : null);
        const replyCountCol = set.has('reply_count') ? 'reply_count' : (set.has('replyCount') ? 'replyCount' : null);
        const viewsCol = set.has('views') ? 'views' : null;
        const isPinnedCol = set.has('is_pinned') ? 'is_pinned' : (set.has('isPinned') ? 'isPinned' : null);
        const isLockedCol = set.has('is_locked') ? 'is_locked' : (set.has('isLocked') ? 'isLocked' : null);

        const where = categoryId && categoryCol ? ` WHERE "${categoryCol}" = $1` : '';
        const order1 = lastReplyCol ? `"${lastReplyCol}" DESC NULLS LAST` : (createdCol ? `"${createdCol}" DESC` : '"id" DESC');
        const order2 = createdCol ? `, "${createdCol}" DESC` : '';

      const rows = await sql.unsafe(
          `SELECT * FROM "public"."Thread"${where} ORDER BY ${order1}${order2};`,
          categoryId && categoryCol ? [categoryId] : []
        );

        // Default category: map to "General Discussion" from KV if missing
        let defaultCategoryId: string | null = null;
        try {
          const kv = await sql.unsafe('SELECT "value" FROM "public"."KeyValueConfig" WHERE "key" = $1 LIMIT 1;', ['forum_categories']);
          const catsRaw = kv[0]?.value;
          const cats = typeof catsRaw === 'string' ? JSON.parse(catsRaw) : catsRaw;
          if (Array.isArray(cats)) {
            const gen = cats.find((c: any) => (c.title || '').toLowerCase().includes('general'));
            defaultCategoryId = gen?.id || null;
          }
        } catch {}

        // Optionally fetch authors
        let authorsById: Record<string,string> = {};
        if (authorCol) {
          const ids = rows.map((r: any) => r[authorCol]).filter(Boolean);
          if (ids.length) {
            const usersRows = await sql.unsafe(`SELECT "id", "username", "avatarUrl", "role" FROM "public"."User" WHERE "id" = ANY($1::uuid[])`, [ids]);
            authorsById = Object.fromEntries(usersRows.map((u: any) => [u.id, u.username]));
          }
        }

        threads = rows.map((r: any) => ({
          thread: {
            id: r.id,
            categoryId: categoryCol ? r[categoryCol] : defaultCategoryId,
            title: r.title,
            replyCount: replyCountCol ? (r[replyCountCol] || 0) : 0,
            views: viewsCol ? (r[viewsCol] || 0) : 0,
            isPinned: isPinnedCol ? !!r[isPinnedCol] : false,
            isLocked: isLockedCol ? !!r[isLockedCol] : false,
            lastReplyAt: lastReplyCol && r[lastReplyCol] ? new Date(r[lastReplyCol]) : null,
            lastReplyAuthorId: lastReplyAuthorCol ? r[lastReplyAuthorCol] : null,
            createdAt: createdCol && r[createdCol] ? new Date(r[createdCol]) : new Date(),
          },
          author: { username: (authorCol && authorsById[r[authorCol]]) || 'Unknown', avatarUrl: null, role: undefined },
        }));
        await sql.end({ timeout: 5 });
      } catch (fallbackErr) {
        try { await sql.end({ timeout: 5 }); } catch {}
        throw fallbackErr;
      }
    }

    // Get last reply authors
    let threadsWithLastReply = await Promise.all(
      threads.map(async ({ thread, author }) => {
        let lastReplyAuthor = null;
        if (thread.lastReplyAuthorId) {
          const [lastAuthor] = await db.select()
            .from(users)
            .where(eq(users.id, thread.lastReplyAuthorId))
            .limit(1);
          lastReplyAuthor = lastAuthor ? {
            username: (lastAuthor as any).username || (lastAuthor as any).email || 'Unknown',
            avatarUrl: (lastAuthor as any).avatarUrl || null,
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

    // Attach rep counters from KeyValueConfig
    try {
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      const keys = threadsWithLastReply.map(t => `rep_thread_${t.id}`);
      if (keys.length) {
        const rows = await sql.unsafe('SELECT "key","value" FROM "public"."KeyValueConfig" WHERE "key" = ANY($1::text[])', [keys]);
        const repMap = new Map(rows.map((r:any)=>[r.key, parseInt((r.value||'0'),10)||0]));
        threadsWithLastReply = threadsWithLastReply.map(t => ({ ...t, rep: repMap.get(`rep_thread_${t.id}`) || 0 }));
      }
      await sql.end({ timeout: 5 });
    } catch {}

    return NextResponse.json({ threads: threadsWithLastReply });
  } catch (error) {
    console.error('Error fetching forum threads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

