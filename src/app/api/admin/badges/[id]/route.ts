import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { badges } from '@/lib/db/schema';
import { getCurrentUser, isUserAdmin } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// PUT: update badge
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || !isUserAdmin(user)) {
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

    const [updated] = await db.update(badges)
      .set({
        name: title,
        description: description || '',
        rarity: rarity || 'COMMON',
        imageUrl: imageUrl || '',
        unlockType: requirementType || null,
        unlockRefId: requirementValue || null,
        updatedAt: new Date(),
      })
      .where(eq(badges.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: updated.id,
      title: updated.name,
      description: updated.description ?? '',
      rarity: updated.rarity ?? 'COMMON',
      requirementType: updated.unlockType ?? 'ACHIEVEMENT_UNLOCK',
      requirementValue: updated.unlockRefId ?? '',
      imageUrl: updated.imageUrl ?? '',
      isActive: true,
    });
  } catch (error) {
    console.error('Error updating badge:', error);
    return NextResponse.json({ error: 'Failed to update badge' }, { status: 500 });
  }
}

// DELETE: delete badge
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || !isUserAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.delete(badges).where(eq(badges.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting badge:', error);
    return NextResponse.json({ error: 'Failed to delete badge' }, { status: 500 });
  }
}
