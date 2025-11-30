import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cosmetics, userInventory, users, transactions } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const purchaseSchema = z.object({
  cosmeticId: z.string().uuid(),
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
    const { cosmeticId } = purchaseSchema.parse(body);

    // Get cosmetic
    const [cosmetic] = await db.select()
      .from(cosmetics)
      .where(and(eq(cosmetics.id, cosmeticId), eq(cosmetics.isActive, true)))
      .limit(1);

    if (!cosmetic) {
      return NextResponse.json(
        { error: 'Cosmetic not found' },
        { status: 404 }
      );
    }

    // Check if already owned
    const [existing] = await db.select()
      .from(userInventory)
      .where(and(eq(userInventory.userId, user.id), eq(userInventory.cosmeticId, cosmeticId)))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: 'Already owned' },
        { status: 400 }
      );
    }

    // Check if user has enough coins
    const price = Number(cosmetic.price);
    const userCoins = Number(user.coins);

    if (userCoins < price) {
      return NextResponse.json(
        { error: 'Insufficient coins' },
        { status: 400 }
      );
    }

    // Transaction: Deduct coins, add to inventory, create transaction record
    await db.transaction(async (tx) => {
      // Deduct coins
      await tx.update(users)
        .set({ coins: (userCoins - price).toString() })
        .where(eq(users.id, user.id));

      // Add to inventory
      await tx.insert(userInventory).values({
        userId: user.id,
        cosmeticId: cosmetic.id,
      });

      // Create transaction record
      await tx.insert(transactions).values({
        userId: user.id,
        type: 'PURCHASE',
        amount: (-price).toString(),
        description: `Purchased ${cosmetic.name}`,
        referenceId: cosmetic.id,
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Purchase error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

