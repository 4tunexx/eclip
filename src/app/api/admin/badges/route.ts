import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { badges } from '@/lib/db/schema';
import { getCurrentUser, isUserAdmin } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// GET: list all badges
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await db.select().from(badges);

    // Map to admin page shape
    const data = rows.map((b) => ({
      id: b.id,
      title: b.name,
      description: b.description ?? '',
      rarity: b.rarity ?? 'COMMON',
      requirementType: b.unlockType ?? 'ACHIEVEMENT_UNLOCK',
      requirementValue: b.unlockRefId ?? '',
      imageUrl: b.imageUrl ?? '',
      isActive: true, // schema lacks is_active; assume active
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
  }
}

// POST: create badge
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      rarity,
      requirementType,
      requirementValue,
      imageUrl,
    } = body;

    if (!title || !rarity) {
      return NextResponse.json({ error: 'Title and rarity are required' }, { status: 400 });
    }

    const [created] = await db.insert(badges).values({
      name: title,
      description: description || '',
      rarity: rarity || 'COMMON',
      imageUrl: imageUrl || '',
      unlockType: requirementType || null,
      unlockRefId: requirementValue || null,
    }).returning();

    return NextResponse.json({
      id: created.id,
      title: created.name,
      description: created.description ?? '',
      rarity: created.rarity ?? 'COMMON',
      requirementType: created.unlockType ?? 'ACHIEVEMENT_UNLOCK',
      requirementValue: created.unlockRefId ?? '',
      imageUrl: created.imageUrl ?? '',
      isActive: true,
    });
  } catch (error) {
    console.error('Error creating badge:', error);
    return NextResponse.json({ error: 'Failed to create badge' }, { status: 500 });
  }
}
