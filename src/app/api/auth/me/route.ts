import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { userProfiles, cosmetics, vip_subscriptions } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import postgres from 'postgres';
import { getRankFromESR } from '@/lib/rank-calculator';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Silent 401 - user not logged in (normal during logout)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

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

    // Check if Steam ID is real (17-digit number) vs placeholder
    const steamId = (user as any).steamId || '';
    const hasSteamAuth = /^\d{17}$/.test(steamId);

    // Check VIP status
    let vipStatus = {
      isVip: false,
      expiresAt: null as any,
      daysRemaining: 0,
      autoRenew: false,
    };

    try {
      const activeVip = await db
        .select()
        .from(vip_subscriptions)
        .where(
          and(
            eq(vip_subscriptions.userId, user.id),
            eq(vip_subscriptions.status, 'active'),
            gt(vip_subscriptions.expiresAt, new Date())
          )
        )
        .limit(1);

      if (activeVip.length > 0) {
        const sub = activeVip[0];
        vipStatus.isVip = true;
        vipStatus.expiresAt = sub.expiresAt;
        vipStatus.autoRenew = sub.autoRenew;
        const now = new Date();
        vipStatus.daysRemaining = Math.ceil((sub.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
    } catch (e) {
      console.log('[API/Auth/Me] VIP status fetch error:', (e as any).message);
    }

    const responseData = {
      id: (user as any).id,
      email: (user as any).email || null,
      username: (user as any).username || null,
      avatarUrl: (user as any).avatar || (user as any).avatarUrl || null,
      level: (user as any).level ?? 1,
      xp: Number((user as any).xp ?? 0),
      rank: rankInfo.tier,
      rankTier: rankInfo.tier,
      rankDivision: rankInfo.division,
      esr: esr,
      coins: Number((user as any).coins ?? 0),
      role: (user as any).role || 'USER',
      emailVerified: Boolean((user as any).emailVerified ?? (profile?.emailVerifiedAt ? true : false)),
      hasSteamAuth: hasSteamAuth,
      steamId: hasSteamAuth ? steamId : null,
      title: profile?.title || null,
      equippedFrame,
      equippedBanner,
      equippedBadge,
      stats: profile?.stats || null,
      vip: vipStatus,
    };

    console.log('[API/Auth/Me] Returning user data:', responseData);
    
    // Track daily login asynchronously (don't wait for it)
    fetch(new URL('/api/user/daily-login', request.url).toString(), {
      method: 'POST',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    }).catch(err => console.error('[Auth/Me] Daily login tracking failed:', err));
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[API/Auth/Me] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

