import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { userProfiles, cosmetics } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  // Get profile data
  const [profile] = await db.select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  // Get equipped cosmetics if any
  let equippedFrame = null;
  let equippedBanner = null;
  let equippedBadge = null;

  if (profile?.equippedFrameId) {
    const [frame] = await db.select()
      .from(cosmetics)
      .where(eq(cosmetics.id, profile.equippedFrameId))
      .limit(1);
    equippedFrame = frame?.imageUrl || null;
  }

  if (profile?.equippedBannerId) {
    const [banner] = await db.select()
      .from(cosmetics)
      .where(eq(cosmetics.id, profile.equippedBannerId))
      .limit(1);
    equippedBanner = banner?.imageUrl || null;
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    level: user.level,
    xp: Number(user.xp),
    rank: user.rank,
    mmr: user.mmr,
    coins: Number(user.coins),
    isAdmin: user.role === 'ADMIN',
    emailVerified: user.emailVerified,
    title: profile?.title,
    equippedFrame,
    equippedBanner,
    equippedBadge,
    stats: profile?.stats || null,
  });
}

