import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cosmetics } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      gradient,
      price,
      rarity,
      is_vip,
      vip_tier_required,
      is_active
    } = body;

    const metadata = {
      gradient,
      is_vip: is_vip || false,
      vip_tier_required: vip_tier_required || 'none'
    };

    const [updatedBanner] = await db
      .update(cosmetics)
      .set({
        name,
        description: description || '',
        rarity: (rarity || 'common').charAt(0).toUpperCase() + (rarity || 'common').slice(1).toLowerCase() as 'Common' | 'Rare' | 'Epic' | 'Legendary',
        price: price?.toString() || '0',
        imageUrl: JSON.stringify(metadata),
        isActive: is_active !== false,
        updatedAt: new Date(),
      })
      .where(eq(cosmetics.id, id))
      .returning();

    if (!updatedBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ banner: updatedBanner });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db
      .delete(cosmetics)
      .where(eq(cosmetics.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
