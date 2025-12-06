import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userInventory, cosmetics } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

/**
 * GET /api/user/badges
 * Get current user's badges from inventory
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's cosmetics from inventory (badges type)
    const userBadges = await db
      .select({
        cosmetic: cosmetics,
        inventory: userInventory,
      })
      .from(userInventory)
      .innerJoin(cosmetics, eq(userInventory.cosmeticId, cosmetics.id))
      .where(
        eq(userInventory.userId, user.id)
      )
      .execute();

    // Filter for badge type cosmetics only
    const badges = userBadges
      .filter(ub => ub.cosmetic.type === 'Badge')
      .map(ub => ({
        id: ub.cosmetic.id,
        name: ub.cosmetic.name,
        description: ub.cosmetic.description,
        type: ub.cosmetic.type,
        rarity: ub.cosmetic.rarity,
        imageUrl: ub.cosmetic.imageUrl,
        category: 'Badge',
        acquiredAt: ub.inventory.purchasedAt,
      }));

    return NextResponse.json(badges);
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}
