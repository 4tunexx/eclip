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

    const banners = await db
      .select()
      .from(cosmetics)
      .where(eq(cosmetics.type, 'Banner'));

    return NextResponse.json({ banners, from_database: true });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
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
      gradient,
      price,
      rarity,
      is_vip,
      vip_tier_required,
      is_active
    } = body;

    if (!id || !name || !gradient) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, gradient' },
        { status: 400 }
      );
    }

    // Store as JSON metadata since we don't have dedicated columns
    const metadata = {
      gradient,
      is_vip: is_vip || false,
      vip_tier_required: vip_tier_required || 'none'
    };

    const [newBanner] = await db
      .insert(cosmetics)
      .values({
        name,
        description: description || '',
        type: 'Banner',
        rarity: (rarity || 'common').charAt(0).toUpperCase() + (rarity || 'common').slice(1).toLowerCase() as 'Common' | 'Rare' | 'Epic' | 'Legendary',
        price: price?.toString() || '0',
        imageUrl: JSON.stringify(metadata), // Store metadata in imageUrl as JSON
        isActive: is_active !== false,
      })
      .returning();

    return NextResponse.json({ banner: newBanner }, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
