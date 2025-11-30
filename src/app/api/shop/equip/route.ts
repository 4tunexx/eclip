import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userInventory, userProfiles, cosmetics } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import postgres from 'postgres';

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
    let inventoryItem: any = null;
    try {
      [inventoryItem] = await db.select()
        .from(userInventory)
        .where(and(eq(userInventory.userId, user.id), eq(userInventory.cosmeticId, cosmeticId)))
        .limit(1);
    } catch {}

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Cosmetic not owned' },
        { status: 400 }
      );
    }

    // Verify cosmetic type matches
    let cosmetic: any = null;
    try {
      [cosmetic] = await db.select()
        .from(cosmetics)
        .where(eq(cosmetics.id, cosmeticId))
        .limit(1);
    } catch {}

    if (!cosmetic || cosmetic.type !== type) {
      return NextResponse.json(
        { error: 'Invalid cosmetic type' },
        { status: 400 }
      );
    }

    // Get or create profile
    let profile: any = null;
    try {
      [profile] = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.id))
        .limit(1);
    } catch {}

    const updateData: any = {};
    
    if (type === 'Frame') {
      updateData.equippedFrameId = cosmeticId;
    } else if (type === 'Banner') {
      updateData.equippedBannerId = cosmeticId;
    } else if (type === 'Badge') {
      updateData.equippedBadgeId = cosmeticId;
    } else if (type === 'Title') {
      updateData.title = (cosmetic as any)?.name || 'Title';
    }

    try {
      if (profile) {
        await db.update(userProfiles)
          .set({ ...updateData, updatedAt: new Date() })
          .where(eq(userProfiles.id, profile.id));
      } else {
        await db.insert(userProfiles).values({ userId: user.id, ...updateData });
      }
    } catch (drizzleErr) {
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      try {
        const table = 'profiles'
        const cols = await sql.unsafe('SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2;', ['public', table])
        const set = new Set(cols.map((c:any)=>c.column_name))
        const frameCol = set.has('equipped_frame_id') ? 'equipped_frame_id' : 'equippedFrameId'
        const bannerCol = set.has('equipped_banner_id') ? 'equipped_banner_id' : 'equippedBannerId'
        const badgeCol = set.has('equipped_badge_id') ? 'equipped_badge_id' : 'equippedBadgeId'
        const titleCol = set.has('title') ? 'title' : 'title'
        const userCol = set.has('user_id') ? 'user_id' : 'userId'
        const exists = await sql.unsafe(`SELECT id FROM "public"."${table}" WHERE "${userCol}" = $1 LIMIT 1;`, [user.id])
        if (exists.length) {
          const id = exists[0].id
          const updates: string[] = []
          const params: any[] = []
          if (updateData.equippedFrameId) { updates.push(`"${frameCol}" = $${params.push(updateData.equippedFrameId)}`) }
          if (updateData.equippedBannerId) { updates.push(`"${bannerCol}" = $${params.push(updateData.equippedBannerId)}`) }
          if (updateData.equippedBadgeId) { updates.push(`"${badgeCol}" = $${params.push(updateData.equippedBadgeId)}`) }
          if (updateData.title) { updates.push(`"${titleCol}" = $${params.push(updateData.title)}`) }
          params.push(id)
          await sql.unsafe(`UPDATE "public"."${table}" SET ${updates.join(', ')}, "updated_at" = NOW() WHERE "id" = $${params.length};`, params)
        } else {
          const fields = [`"${userCol}"`, updateData.equippedFrameId && `"${frameCol}"`, updateData.equippedBannerId && `"${bannerCol}"`, updateData.equippedBadgeId && `"${badgeCol}"`, updateData.title && `"${titleCol}"`].filter(Boolean).join(', ')
          const vals: any[] = [user.id]
          if (updateData.equippedFrameId) vals.push(updateData.equippedFrameId)
          if (updateData.equippedBannerId) vals.push(updateData.equippedBannerId)
          if (updateData.equippedBadgeId) vals.push(updateData.equippedBadgeId)
          if (updateData.title) vals.push(updateData.title)
          const placeholders = vals.map((_,i)=>`$${i+1}`).join(', ')
          await sql.unsafe(`INSERT INTO "public"."${table}" (${fields}) VALUES (${placeholders});`, vals)
        }
        await sql.end({ timeout: 5 })
      } catch (fallbackErr) {
        try { await sql.end({ timeout: 5 }) } catch {}
        throw fallbackErr
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

    console.error('Equip error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

