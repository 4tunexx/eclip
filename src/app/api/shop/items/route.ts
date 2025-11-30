import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cosmetics, userInventory } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';

export async function GET() {
  try {
    const user = await getCurrentUser();
    let items: any[] = [];
    try {
      items = await db.select()
        .from(cosmetics)
        .where(eq(cosmetics.isActive, true));
    } catch (drizzleErr) {
      // Fallback to legacy public."Cosmetic"
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      try {
        const cols = await sql.unsafe('SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2;', ['public','Cosmetic']);
        const set = new Set(cols.map((c: any) => c.column_name));
        const nameCol = set.has('name') ? 'name' : null;
        const descCol = set.has('description') ? 'description' : null;
        const typeCol = set.has('type') ? 'type' : null;
        const rarityCol = set.has('rarity') ? 'rarity' : null;
        const priceCol = set.has('price') ? 'price' : null;
        const imageCol = set.has('image_url') ? 'image_url' : (set.has('imageUrl') ? 'imageUrl' : null);
        const activeCol = set.has('is_active') ? 'is_active' : (set.has('isActive') ? 'isActive' : null);

        const where = activeCol ? ` WHERE "${activeCol}" = $1` : '';
        const rows = await sql.unsafe(`SELECT * FROM "public"."Cosmetic"${where};`, activeCol ? [true] : []);
        items = rows.map((r: any) => ({
          id: r.id,
          name: nameCol ? r[nameCol] : r.id,
          description: descCol ? r[descCol] : null,
          type: typeCol ? r[typeCol] : 'Frame',
          rarity: rarityCol ? r[rarityCol] : 'Common',
          price: priceCol ? Number(r[priceCol]) : 0,
          imageUrl: imageCol ? r[imageCol] : null,
          isActive: activeCol ? !!r[activeCol] : true,
        }));
        await sql.end({ timeout: 5 });
      } catch (fallbackErr) {
        try { await sql.end({ timeout: 5 }); } catch {}
        throw fallbackErr;
      }
    }

    // Get user's inventory if logged in
    let ownedItemIds: string[] = [];
    if (user) {
      try {
        const inventory = await db.select()
          .from(userInventory)
          .where(eq(userInventory.userId, user.id));
        ownedItemIds = inventory.map(item => item.cosmeticId);
      } catch {}
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

