import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cosmetics } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const frames = await db
      .select()
      .from(cosmetics)
      .where(eq(cosmetics.type, 'Frame'));

    return NextResponse.json({ frames, from_database: true });
  } catch (error) {
    console.error('Error fetching frames:', error);
    return NextResponse.json({ error: 'Failed to fetch frames' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
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

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name' },
        { status: 400 }
      );
    }

    // Store frame properties in metadata field
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

    const [newFrame] = await db
      .insert(cosmetics)
      .values({
        name,
        description: description || '',
        type: 'Frame',
        rarity: (rarity || 'common').charAt(0).toUpperCase() + (rarity || 'common').slice(1).toLowerCase() as 'Common' | 'Rare' | 'Epic' | 'Legendary',
        price: price?.toString() || '0',
        metadata: metadata,
        isActive: is_active !== false,
      })
      .returning();

    return NextResponse.json({ frame: newFrame }, { status: 201 });
  } catch (error) {
    console.error('Error creating frame:', error);
    return NextResponse.json({ error: 'Failed to create frame' }, { status: 500 });
  }
}
