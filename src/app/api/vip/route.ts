import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, vip_subscriptions } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, gt, and } from 'drizzle-orm';

/**
 * GET /api/vip/status
 * Check user's current VIP status and expiration
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check active VIP subscription
    const subscription = await db
      .select()
      .from(vip_subscriptions)
      .where(
        and(
          eq(vip_subscriptions.userId, user.id),
          eq(vip_subscriptions.status, 'active'),
          gt(vip_subscriptions.expiresAt, new Date())
        )
      )
      .orderBy(vip_subscriptions.expiresAt)
      .limit(1);

    if (subscription.length === 0) {
      return NextResponse.json({
        vip_active: false,
        expires_at: null,
        auto_renew: false,
        days_remaining: 0,
        benefits: getVipBenefits(false)
      });
    }

    const sub = subscription[0];
    const now = new Date();
    const daysRemaining = Math.ceil((sub.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      vip_active: true,
      expires_at: sub.expiresAt,
      auto_renew: sub.autoRenew,
      days_remaining: daysRemaining,
      subscription_id: sub.id,
      benefits: getVipBenefits(true)
    });
  } catch (error) {
    console.error('Error checking VIP status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * VIP Benefits configuration
 */
function getVipBenefits(isVip: boolean) {
  if (!isVip) {
    return {
      role_color: null,
      role_badge: null,
      queue_priority: false,
      esr_boost_percent: 0,
      xp_boost_percent: 0,
      team_leader: false,
      enhanced_profile: false,
      exclusive_cosmetics: false
    };
  }

  return {
    role_color: '#FFD700', // Gold color for VIP
    role_badge: '👑',
    queue_priority: true,
    esr_boost_percent: 10, // +10% ESR gains
    xp_boost_percent: 20, // +20% XP gains
    team_leader: true, // First in queue selection
    enhanced_profile: true, // Expanded mini profile on hover
    exclusive_cosmetics: true // Access to VIP-only cosmetics
  };
}

/**
 * POST /api/vip/purchase
 * Purchase VIP subscription (100 coins/month)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // VIP costs 100 coins per month
    const VIP_COST = 100;
    const userResult = await db
      .select({ coins: users.coins, role: users.role })
      .from(users)
      .where(eq(users.id, user.id));

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userCoins = parseFloat(userResult[0].coins || '0');

    if (userCoins < VIP_COST) {
      return NextResponse.json(
        { error: `Insufficient coins. Need ${VIP_COST}, have ${Math.floor(userCoins)}` },
        { status: 400 }
      );
    }

    // Calculate expiry (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const renewalDay = expiryDate.getDate();

    // Deduct coins from user
    const newCoins = userCoins - VIP_COST;
    await db
      .update(users)
      .set({
        coins: newCoins.toString(),
        isVip: true,
        vipExpiresAt: expiryDate,
        vipAutoRenew: true,
        role: 'VIP', // Set role to VIP if not already admin/moderator
        roleColor: '#FFD700' // Gold color
      })
      .where(eq(users.id, user.id));

    // Create subscription record
    await db
      .insert(vip_subscriptions)
      .values({
        userId: user.id,
        expiresAt: expiryDate,
        autoRenew: true,
        renewalDay: renewalDay,
        totalCostCoins: VIP_COST,
        status: 'active'
      });

    return NextResponse.json({
      success: true,
      message: 'Successfully purchased VIP subscription!',
      vip_active: true,
      expires_at: expiryDate,
      auto_renew: true,
      coins_remaining: Math.floor(newCoins),
      benefits: getVipBenefits(true)
    });
  } catch (error) {
    console.error('Error purchasing VIP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vip/cancel
 * Cancel VIP subscription
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    // Mark subscription as cancelled
    await db
      .update(vip_subscriptions)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason || 'User cancelled'
      })
      .where(
        and(
          eq(vip_subscriptions.userId, user.id),
          eq(vip_subscriptions.status, 'active')
        )
      );

    // Update user
    await db
      .update(users)
      .set({
        isVip: false,
        vipAutoRenew: false,
        role: 'USER' // Reset to USER role
        // Note: Keep roleColor as is, will be overridden on re-login
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      message: 'VIP subscription cancelled',
      vip_active: false
    });
  } catch (error) {
    console.error('Error cancelling VIP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
