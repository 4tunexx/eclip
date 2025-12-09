import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { forumThreads } from '@/lib/db/schema';
import { getCurrentUser, checkFullVerification } from '@/lib/auth';
import { z } from 'zod';
import postgres from 'postgres';

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

    // Check if user has verified email and Steam account (unless admin/moderator)
    const verification = await checkFullVerification(user);
    if (!verification.verified) {
      return NextResponse.json(
        { error: verification.reason || 'Email and Steam verification required to create forum threads' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { categoryId, title, content } = createThreadSchema.parse(body);

    // Restrict certain categories to ADMIN/MOD only (e.g., Updates/News)
    let restricted = false;
    try {
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      try {
        const rows = await sql.unsafe('SELECT "title" FROM "public"."forum_categories" WHERE "id" = $1 LIMIT 1;', [categoryId]);
        const catTitle = rows[0]?.title?.toLowerCase();
        if (catTitle && (catTitle.includes('update') || catTitle.includes('news'))) restricted = true;
      } catch {
        const kv = await sql.unsafe('SELECT "value" FROM "public"."KeyValueConfig" WHERE "key" = $1 LIMIT 1;', ['forum_categories']);
        const cats = kv[0]?.value || [];
        const cat = Array.isArray(cats) ? cats.find((c: any) => c.id === categoryId) : null;
        const catTitle = cat?.title?.toLowerCase();
        if (catTitle && (catTitle.includes('update') || catTitle.includes('news'))) restricted = true;
      }
      await sql.end({ timeout: 5 });
    } catch {}

    if (restricted) {
      const role = (user as any).role?.toUpperCase() || 'USER';
      if (!(role === 'ADMIN' || role === 'MOD' || role === 'MODERATOR')) {
        return NextResponse.json({ error: 'Only admins or moderators can post here' }, { status: 403 });
      }
    }

    let thread: any = null;
    try {
      [thread] = await db.insert(forumThreads).values({
        categoryId,
        authorId: user.id,
        title,
        content,
        replyCount: 0,
        views: 0,
        isPinned: false,
        isLocked: false,
      }).returning();
    } catch (drizzleErr) {
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      try {
        const cols = await sql.unsafe('SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2;', ['public','Thread']);
        const set = new Set(cols.map((c: any) => c.column_name));
        const authorCol = set.has('author_id') ? 'author_id' : (set.has('authorId') ? 'authorId' : null);
        const createdCol = set.has('created_at') ? 'created_at' : (set.has('createdAt') ? 'createdAt' : null);
        const catCol = set.has('category_id') ? 'category_id' : (set.has('categoryId') ? 'categoryId' : null);
        const replyCountCol = set.has('reply_count') ? 'reply_count' : (set.has('replyCount') ? 'replyCount' : null);
        const fields = ['id','title', catCol || 'categoryId', authorCol || 'authorId', replyCountCol || 'replyCount', 'views', 'is_pinned','is_locked', createdCol || 'createdAt'];
        const ins = await sql.unsafe(
          `INSERT INTO "public"."Thread" ("id","title","${catCol || 'categoryId'}","${authorCol || 'authorId'}","${replyCountCol || 'replyCount'}","views","is_pinned","is_locked","${createdCol || 'createdAt'}") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *;`,
          [title, categoryId, user.id, 0, 0, false, false]
        );
        thread = ins[0];
        await sql.end({ timeout: 5 });
      } catch (fallbackErr) {
        try { await sql.end({ timeout: 5 }); } catch {}
        throw fallbackErr;
      }
    }

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

