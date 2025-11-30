import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { forumCategories } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const categories = await db.select()
      .from(forumCategories)
      .orderBy(asc(forumCategories.order));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching forum categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

