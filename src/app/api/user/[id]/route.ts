import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userProfiles, cosmetics } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // Get user data
    const user = await db
      .select({
        id: users.id,
        username: users.username,
        avatar: users.avatar,
        rank: users.rank,
        level: users.level,
        coins: users.coins,
        esr: users.esr,
        rankTier: users.rankTier,
        rankDivision: users.rankDivision,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user profile with equipped cosmetics
    const profile = await db
      .select({
        equippedFrameId: userProfiles.equippedFrameId,
        equippedBannerId: userProfiles.equippedBannerId,
        title: userProfiles.title,
      })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    // Get equipped frame cosmetic
    let equippedFrame: any = null;
    if (profile[0]?.equippedFrameId) {
      const frameData = await db
        .select()
        .from(cosmetics)
        .where(eq(cosmetics.id, profile[0].equippedFrameId));
      if (frameData.length > 0) {
        equippedFrame = {
          id: frameData[0].id,
          name: frameData[0].name,
          imageUrl: frameData[0].imageUrl,
          metadata: frameData[0].metadata,
        };
      }
    }

    // Get equipped banner cosmetic
    let equippedBanner: any = null;
    if (profile[0]?.equippedBannerId) {
      const bannerData = await db
        .select()
        .from(cosmetics)
        .where(eq(cosmetics.id, profile[0].equippedBannerId));
      if (bannerData.length > 0) {
        equippedBanner = {
          id: bannerData[0].id,
          name: bannerData[0].name,
          imageUrl: bannerData[0].imageUrl,
          metadata: bannerData[0].metadata,
        };
      }
    }

    const userData = user[0];

    return NextResponse.json({
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar || '',
      rank: userData.rank || 'Unranked',
      level: userData.level || 1,
      coins: userData.coins || 0,
      esr: userData.esr || 1000,
      rankTier: userData.rankTier || 'Bronze',
      rankDivision: userData.rankDivision || 1,
      title: profile[0]?.title || '',
      equippedFrame,
      equippedBanner,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
