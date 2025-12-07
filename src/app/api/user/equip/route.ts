import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cosmetics, userInventory, userProfiles } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import postgres from 'postgres';

const schema = z.object({
  cosmeticId: z.string().uuid(),
  type: z.enum(['Banner', 'Frame', 'Title', 'Badge']),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { cosmeticId, type } = schema.parse(body);

    // Ensure user owns the cosmetic and type matches
    let owned: any = null;
    try {
      [owned] = await db
        .select({ id: cosmetics.id, type: cosmetics.type, name: cosmetics.name })
        .from(userInventory)
        .innerJoin(cosmetics, eq(userInventory.cosmeticId, cosmetics.id))
        .where(and(eq(userInventory.userId, user.id), eq(cosmetics.id, cosmeticId)))
        .limit(1);
    } catch (drizzleErr) {
      // Legacy fallback: public."UserItem" + public."Cosmetic"
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      try {
        const rows = await sql.unsafe(
          'SELECT c.* FROM "public"."UserItem" ui JOIN "public"."Cosmetic" c ON ui."item_id" = c."id" WHERE ui."user_id" = $1 AND ui."item_id" = $2 LIMIT 1;',
          [user.id, cosmeticId]
        );
        owned = rows[0]
          ? { id: rows[0].id, type: rows[0].type ?? 'Frame', name: rows[0].name ?? rows[0].title ?? 'Cosmetic' }
          : null;
        await sql.end({ timeout: 5 });
      } catch (fallbackErr) {
        try { await sql.end({ timeout: 5 }); } catch {}
        throw fallbackErr;
      }
    }

    if (!owned) {
      return NextResponse.json({ error: 'Cosmetic not owned' }, { status: 403 });
    }

    if (owned.type !== type) {
      return NextResponse.json({ error: 'Type mismatch' }, { status: 400 });
    }

    // Upsert profile row if missing
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    if (!profile) {
      await db.insert(userProfiles).values({ userId: user.id });
    }

    // Apply equip
    const update: Record<string, any> = {};
    if (type === 'Banner') update.equippedBannerId = cosmeticId;
    if (type === 'Frame') update.equippedFrameId = cosmeticId;
    if (type === 'Badge') update.equippedBadgeId = cosmeticId;
    if (type === 'Title') update.title = owned.name;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Unsupported type' }, { status: 400 });
    }

    await db
      .update(userProfiles)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(userProfiles.userId, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('[API/User/Equip] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
