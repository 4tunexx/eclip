import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cosmetics, userInventory } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    // Get all active cosmetics
    const items = await db.select()
      .from(cosmetics)
      .where(eq(cosmetics.isActive, true));

    // Get user's inventory if logged in
    let ownedItemIds: string[] = [];
    if (user) {
      const inventory = await db.select()
        .from(userInventory)
        .where(eq(userInventory.userId, user.id));
      
      ownedItemIds = inventory.map(item => item.cosmeticId);
    }

    // Map items with ownership status
    const itemsWithOwnership = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      rarity: item.rarity,
      price: Number(item.price),
      imageUrl: item.imageUrl,
      owned: ownedItemIds.includes(item.id),
    }));

    return NextResponse.json({ items: itemsWithOwnership });
  } catch (error) {
    console.error('Error fetching shop items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

