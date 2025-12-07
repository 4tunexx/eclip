import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cosmetics, userInventory, userProfiles } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';

const legacyOwned = async (userId: string) => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    const rows = await sql.unsafe(
      'SELECT c.*, ui."user_id", ui."item_id" FROM "public"."UserItem" ui JOIN "public"."Cosmetic" c ON ui."item_id" = c."id" WHERE ui."user_id" = $1;',
      [userId]
    );
    const mapped = rows.map((r: any) => ({
      id: r.id,
      name: r.name ?? r.title ?? r.id,
      description: r.description ?? '',
      type: r.type ?? 'Frame',
      rarity: r.rarity ?? 'Common',
      imageUrl: r.image_url ?? r.imageUrl ?? null,
    }));
    await sql.end({ timeout: 5 });
    return mapped;
  } catch (err) {
    try { await sql.end({ timeout: 5 }); } catch {}
    throw err;
  }
};

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const typeFilter = url.searchParams.get('type');

    let owned: any[] = [];
    try {
      owned = await db
        .select({
          id: cosmetics.id,
          name: cosmetics.name,
          description: cosmetics.description,
          type: cosmetics.type,
          rarity: cosmetics.rarity,
          imageUrl: cosmetics.imageUrl,
        })
        .from(userInventory)
        .innerJoin(cosmetics, eq(userInventory.cosmeticId, cosmetics.id))
        .where(eq(userInventory.userId, user.id));
    } catch (drizzleErr) {
      owned = await legacyOwned(user.id);
    }

    // If Drizzle succeeded but returned empty while legacy data exists, try legacy
    if (owned.length === 0) {
      try {
        const legacy = await legacyOwned(user.id);
        if (legacy.length > 0) owned = legacy;
      } catch {}
    }

    const [profile] = await db
      .select({
        bannerId: userProfiles.equippedBannerId,
        frameId: userProfiles.equippedFrameId,
        badgeId: userProfiles.equippedBadgeId,
        title: userProfiles.title,
      })
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    const equippedIds = {
      Banner: profile?.bannerId,
      Frame: profile?.frameId,
      Title: undefined as string | undefined, // titles are stored on users or profiles title field; not tracking id here
      Badge: profile?.badgeId,
    };

    const grouped = {
      banners: owned
        .filter((c) => c.type === 'Banner')
        .map((c) => ({ 
          ...c, 
          equipped: c.id === equippedIds.Banner,
          preview: `/api/cosmetics/generate/banner?rarity=${c.rarity?.toLowerCase() || 'common'}&title=${c.name}`
        })),
      frames: owned
        .filter((c) => c.type === 'Frame')
        .map((c) => ({ 
          ...c, 
          equipped: c.id === equippedIds.Frame,
          preview: `/api/cosmetics/generate/frame?rarity=${c.rarity?.toLowerCase() || 'common'}&username=${c.name}`
        })),
      titles: owned
        .filter((c) => c.type === 'Title')
        .map((c) => ({ ...c, equipped: profile?.title ? profile.title === c.name : false })),
      badges: owned
        .filter((c) => c.type === 'Badge')
        .map((c) => ({ 
          ...c, 
          equipped: c.id === equippedIds.Badge,
          preview: `/api/cosmetics/generate/badge?rarity=${c.rarity?.toLowerCase() || 'common'}&label=${c.name}`
        })),
    };

    if (typeFilter) {
      switch (typeFilter) {
        case 'Banner':
          return NextResponse.json(grouped.banners);
        case 'Frame':
          return NextResponse.json(grouped.frames);
        case 'Title':
          return NextResponse.json(grouped.titles);
        case 'Badge':
          return NextResponse.json(grouped.badges);
        default:
          return NextResponse.json([], { status: 200 });
      }
    }

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('[API/User/Cosmetics] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
