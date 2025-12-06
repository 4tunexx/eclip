import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { userProfiles, cosmetics } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('[API/Auth/Me] No user found (401)');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('[API/Auth/Me] User authenticated:', user.id);

    // Try Drizzle profile first
    let profile: any = null;
    try {
      const [p] = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.id))
        .limit(1);
      profile = p || null;
    } catch {}

    let equippedFrame: string | null = null;
    let equippedBanner: string | null = null;
    let equippedBadge: string | null = null;

    try {
      if (profile?.equippedFrameId) {
        const [frame] = await db.select().from(cosmetics).where(eq(cosmetics.id, profile.equippedFrameId)).limit(1);
        equippedFrame = (frame as any)?.imageUrl || null;
      }
      if (profile?.equippedBannerId) {
        const [banner] = await db.select().from(cosmetics).where(eq(cosmetics.id, profile.equippedBannerId)).limit(1);
        equippedBanner = (banner as any)?.imageUrl || null;
      }
      if (profile?.equippedBadgeId) {
        const [badge] = await db.select().from(cosmetics).where(eq(cosmetics.id, profile.equippedBadgeId)).limit(1);
        equippedBadge = (badge as any)?.imageUrl || null;
      }
    } catch {}

    // Fallback to legacy profile/cosmetics if needed
    if (!profile || (!equippedFrame && !equippedBanner && !equippedBadge)) {
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      try {
        const pr = await sql.unsafe('SELECT * FROM "public"."profiles" WHERE "user_id" = $1 LIMIT 1;', [user.id]);
        if (pr.length) {
          profile = profile || pr[0];
          const cf = pr[0].equipped_frame_id;
          const cb = pr[0].equipped_banner_id;
          const cg = pr[0].equipped_badge_id;
          if (cf) {
            const fr = await sql.unsafe('SELECT "image_url" FROM "public"."Cosmetic" WHERE "id" = $1 LIMIT 1;', [cf]);
            equippedFrame = fr[0]?.image_url || equippedFrame;
          }
          if (cb) {
            const br = await sql.unsafe('SELECT "image_url" FROM "public"."Cosmetic" WHERE "id" = $1 LIMIT 1;', [cb]);
            equippedBanner = br[0]?.image_url || equippedBanner;
          }
          if (cg) {
            const gr = await sql.unsafe('SELECT "image_url" FROM "public"."Cosmetic" WHERE "id" = $1 LIMIT 1;', [cg]);
            equippedBadge = gr[0]?.image_url || equippedBadge;
          }
        }
        await sql.end({ timeout: 5 });
      } catch {
        try { await sql.end({ timeout: 5 }); } catch {}
      }
    }

    return NextResponse.json({
      id: (user as any).id,
      email: (user as any).email || null,
      username: (user as any).username || null,
      avatarUrl: (user as any).avatarUrl || null,
      level: (user as any).level ?? 1,
      xp: Number((user as any).xp ?? 0),
      rank: (user as any).rank ?? 'Bronze',
      esr: (user as any).esr ?? 1000,
      coins: Number((user as any).coins ?? 0),
      isAdmin: ((user as any).role || '').toUpperCase() === 'ADMIN',
      emailVerified: Boolean((user as any).emailVerified ?? (profile?.emailVerifiedAt ? true : false)),
      title: profile?.title || null,
      equippedFrame,
      equippedBanner,
      equippedBadge,
      stats: profile?.stats || null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

