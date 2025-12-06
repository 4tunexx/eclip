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
    } catch (e) {
      console.log('[API/Auth/Me] Cosmetics fetch error:', (e as any).message);
    }

    const responseData = {
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
    };

    console.log('[API/Auth/Me] Returning user data:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[API/Auth/Me] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
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

