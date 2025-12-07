import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { userProfiles, cosmetics } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { getRankFromESR } from '@/lib/rank-calculator';

export async function GET() {
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const allCookies = (await cookieStore).getAll();
    const sessionCookie = (await cookieStore).get('session');
    console.log('[API/Auth/Me] Cookies count:', allCookies.length, 'hasSession:', !!sessionCookie);

    const user = await getCurrentUser();
    if (!user) {
      console.log('[API/Auth/Me] No user found (401)');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('[API/Auth/Me] User authenticated:', user.id, 'email:', (user as any).email);

    // Try Drizzle profile first
    let profile: any = null;
    try {
      const [p] = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.id))
        .limit(1);
      profile = p || null;
    } catch (e) {
      console.log('[API/Auth/Me] Drizzle profile fetch error:', (e as any).message);
    }

    let equippedFrame: string | null = null;
    let equippedBanner: string | null = null;
    let equippedBadge: string | null = null;

    try {
      if (profile?.equippedFrameId) {
        const [frame] = await db.select().from(cosmetics).where(eq(cosmetics.id, profile.equippedFrameId)).limit(1);
        if (frame) {
          const frameData = frame as any;
          const metadata = frameData.metadata || {};
          equippedFrame = JSON.stringify({
            id: frameData.id,
            name: frameData.name,
            rarity: frameData.rarity,
            ...metadata
          });
        }
      }
      if (profile?.equippedBannerId) {
        const [banner] = await db.select().from(cosmetics).where(eq(cosmetics.id, profile.equippedBannerId)).limit(1);
        if (banner) {
          const bannerData = banner as any;
          const metadata = bannerData.metadata || {};
          equippedBanner = JSON.stringify({
            id: bannerData.id,
            name: bannerData.name,
            rarity: bannerData.rarity,
            ...metadata
          });
        }
      }
      if (profile?.equippedBadgeId) {
        const [badge] = await db.select().from(cosmetics).where(eq(cosmetics.id, profile.equippedBadgeId)).limit(1);
        if (badge) {
          const badgeData = badge as any;
          const metadata = badgeData.metadata || {};
          equippedBadge = JSON.stringify({
            id: badgeData.id,
            name: badgeData.name,
            rarity: badgeData.rarity,
            ...metadata
          });
        }
      }
    } catch (e) {
      console.log('[API/Auth/Me] Cosmetics fetch error:', (e as any).message);
    }

    const esr = Number((user as any).esr ?? 1000);
    const rankInfo = getRankFromESR(esr);

    const responseData = {
      id: (user as any).id,
      email: (user as any).email || null,
      username: (user as any).username || null,
      avatarUrl: (user as any).avatar || (user as any).avatarUrl || null,
      level: (user as any).level ?? 1,
      xp: Number((user as any).xp ?? 0),
      rank: rankInfo.tier,
      esr: esr,
      coins: Number((user as any).coins ?? 0),
      isAdmin: ((user as any).role || '').toUpperCase() === 'ADMIN',
      emailVerified: Boolean((user as any).emailVerified ?? (profile?.emailVerifiedAt ? true : false)),
      title: profile?.title || null,
      equippedFrame,
      equippedBanner,
      equippedBadge,
      stats: profile?.stats || null,
    };

    console.log('[API/Auth/Me] Returning user data:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[API/Auth/Me] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

