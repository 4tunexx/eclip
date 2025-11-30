import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userInventory, userProfiles, cosmetics } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const equipSchema = z.object({
  cosmeticId: z.string().uuid(),
  type: z.enum(['Frame', 'Banner', 'Badge', 'Title']),
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

    const body = await request.json();
    const { cosmeticId, type } = equipSchema.parse(body);

    // Verify user owns the cosmetic
    const [inventoryItem] = await db.select()
      .from(userInventory)
      .where(and(eq(userInventory.userId, user.id), eq(userInventory.cosmeticId, cosmeticId)))
      .limit(1);

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Cosmetic not owned' },
        { status: 400 }
      );
    }

    // Verify cosmetic type matches
    const [cosmetic] = await db.select()
      .from(cosmetics)
      .where(eq(cosmetics.id, cosmeticId))
      .limit(1);

    if (!cosmetic || cosmetic.type !== type) {
      return NextResponse.json(
        { error: 'Invalid cosmetic type' },
        { status: 400 }
      );
    }

    // Get or create profile
    const [profile] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    const updateData: any = {};
    
    if (type === 'Frame') {
      updateData.equippedFrameId = cosmeticId;
    } else if (type === 'Banner') {
      updateData.equippedBannerId = cosmeticId;
    } else if (type === 'Badge') {
      updateData.equippedBadgeId = cosmeticId;
    }

    if (profile) {
      await db.update(userProfiles)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(userProfiles.id, profile.id));
    } else {
      await db.insert(userProfiles).values({
        userId: user.id,
        ...updateData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Equip error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

