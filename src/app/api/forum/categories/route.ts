import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { forumCategories } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import postgres from 'postgres';

export async function GET() {
  try {
    let categories: any[] = [];
    try {
      categories = await db.select()
        .from(forumCategories)
        .orderBy(asc(forumCategories.order));
    } catch (drizzleErr) {
      // Fallback: public."KeyValueConfig" categories or empty
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      try {
        const rows = await sql.unsafe('SELECT "value" FROM "public"."KeyValueConfig" WHERE "key" = $1 LIMIT 1;', ['forum_categories']);
        if (rows.length && rows[0].value) {
          const v = rows[0].value;
          categories = typeof v === 'string' ? JSON.parse(v) : v;
        } else {
          categories = [];
        }
        await sql.end({ timeout: 5 });
      } catch (fallbackErr) {
        try { await sql.end({ timeout: 5 }); } catch {}
        categories = [];
      }
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching forum categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

