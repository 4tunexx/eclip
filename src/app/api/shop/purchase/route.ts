import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cosmetics, userInventory, users, transactions, notifications } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import postgres from 'postgres';

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
    let cosmetic: any = null;
    try {
      [cosmetic] = await db.select()
        .from(cosmetics)
        .where(and(eq(cosmetics.id, cosmeticId), eq(cosmetics.isActive, true)))
        .limit(1);
    } catch (drizzleErr) {
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      try {
        const cols = await sql.unsafe('SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2;', ['public','Cosmetic']);
        const set = new Set(cols.map((c: any) => c.column_name));
        const activeCol = set.has('is_active') ? 'is_active' : (set.has('isActive') ? 'isActive' : null);
        const rows = await sql.unsafe(`SELECT * FROM "public"."Cosmetic" WHERE "id" = $1${activeCol ? ' AND "'+activeCol+'" = $2' : ''} LIMIT 1;`, activeCol ? [cosmeticId, true] : [cosmeticId]);
        cosmetic = rows[0];
        await sql.end({ timeout: 5 });
      } catch (fallbackErr) {
        try { await sql.end({ timeout: 5 }); } catch {}
        throw fallbackErr;
      }
    }

    if (!cosmetic) {
      return NextResponse.json(
        { error: 'Cosmetic not found' },
        { status: 404 }
      );
    }

    // Check if already owned
    let existing: any = null;
    try {
      [existing] = await db.select()
        .from(userInventory)
        .where(and(eq(userInventory.userId, user.id), eq(userInventory.cosmeticId, cosmeticId)))
        .limit(1);
    } catch {}

    if (existing) {
      return NextResponse.json(
        { error: 'Already owned' },
        { status: 400 }
      );
    }

    // Check if user has enough coins
    const price = Number((cosmetic as any).price || (cosmetic as any)?.price?.value || 0);
    const userCoins = Number(user.coins);

    if (userCoins < price) {
      return NextResponse.json(
        { error: 'Insufficient coins' },
        { status: 400 }
      );
    }

    // Transaction: Deduct coins, add to inventory, create transaction record, and create notification
    try {
      await db.transaction(async (tx) => {
        await tx.update(users)
          .set({ coins: (userCoins - price).toString() })
          .where(eq(users.id, user.id));

        await tx.insert(userInventory).values({ userId: user.id, cosmeticId: (cosmetic as any).id });

        await tx.insert(transactions).values({
          userId: user.id,
          type: 'PURCHASE',
          amount: (-price).toString(),
          description: `Purchased ${(cosmetic as any).name}`,
          referenceId: (cosmetic as any).id,
        });

        // Create notification for cosmetic purchase
        const notificationType = (cosmetic as any).type === 'Frame' 
          ? 'COSMETIC_FRAME_PURCHASED' 
          : (cosmetic as any).type === 'Banner'
          ? 'COSMETIC_BANNER_PURCHASED'
          : 'COSMETIC_PURCHASED';

        await tx.insert(notifications).values({
          userId: user.id,
          type: notificationType,
          title: `${(cosmetic as any).name} Acquired!`,
          message: `You've purchased ${(cosmetic as any).name}. Visit your profile to equip it!`,
          data: JSON.stringify({
            cosmeticId: (cosmetic as any).id,
            cosmeticName: (cosmetic as any).name,
            cosmeticType: (cosmetic as any).type,
            redirectTo: `/profile?tab=settings`,
          }),
          read: false,
        });
      });
    } catch (drizzleErr) {
      // Legacy fallback
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      try {
        await sql.unsafe('UPDATE "public"."User" SET "coins" = (CAST("coins" AS numeric) - $1)::text, "updatedAt" = NOW() WHERE "id" = $2;', [price, user.id]);
        await sql.unsafe('INSERT INTO "public"."UserItem" ("id","user_id","item_id","purchased_at") VALUES (gen_random_uuid(), $1, $2, NOW());', [user.id, (cosmetic as any).id]);
        await sql.unsafe('INSERT INTO "public"."WalletTransaction" ("id","user_id","type","amount","description","reference_id","created_at") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW());', [user.id, 'PURCHASE', -price, `Purchased ${(cosmetic as any).name}`, (cosmetic as any).id]);
        await sql.end({ timeout: 5 });
      } catch (fallbackErr) {
        try { await sql.end({ timeout: 5 }); } catch {}
        throw fallbackErr;
      }
    }

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

