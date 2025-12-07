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
      border_color,
      border_width,
      border_style,
      shadow_color,
      animation_type,
      animation_speed,
      price,
      rarity,
      is_vip,
      vip_tier_required,
      is_active
    } = body;

    const metadata = {
      border_color: border_color || '#9333ea',
      border_width: border_width || 4,
      border_style: border_style || 'solid',
      shadow_color: shadow_color || 'rgba(147, 51, 234, 0.5)',
      animation_type: animation_type || 'none',
      animation_speed: animation_speed || 1,
      is_vip: is_vip || false,
      vip_tier_required: vip_tier_required || 'none'
    };

    const [updatedFrame] = await db
      .update(cosmetics)
      .set({
        name,
        description: description || '',
        rarity: (rarity || 'common').charAt(0).toUpperCase() + (rarity || 'common').slice(1).toLowerCase() as 'Common' | 'Rare' | 'Epic' | 'Legendary',
        price: price?.toString() || '0',
        metadata: metadata,
        isActive: is_active !== false,
        updatedAt: new Date(),
      })
      .where(eq(cosmetics.id, id))
      .returning();

    if (!updatedFrame) {
      return NextResponse.json({ error: 'Frame not found' }, { status: 404 });
    }

    return NextResponse.json({ frame: updatedFrame });
  } catch (error) {
    console.error('Error updating frame:', error);
    return NextResponse.json({ error: 'Failed to update frame' }, { status: 500 });
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
    console.error('Error deleting frame:', error);
    return NextResponse.json({ error: 'Failed to delete frame' }, { status: 500 });
  }
}
