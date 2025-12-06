import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';

/**
 * GET /api/vip/status
 * Check user's current VIP status
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

    try {
      // Try using Drizzle ORM first
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      const result = await sql`
        SELECT vs.id, vt.tier_name, vs.expires_at, vt.benefits
        FROM user_subscriptions vs
        JOIN vip_tiers vt ON vs.tier_id = vt.id
        WHERE vs.user_id = ${user.id} 
        AND vs.is_active = true 
        AND vs.expires_at > NOW()
        ORDER BY vs.expires_at DESC
        LIMIT 1
      `;
      await sql.end();

      if (result.length === 0) {
        return NextResponse.json({
          vip_active: false,
          tier: null,
          benefits: {}
        });
      }

      const sub = result[0];
      return NextResponse.json({
        vip_active: true,
        tier: sub.tier_name,
        expires_at: sub.expires_at,
        benefits: sub.benefits
      });
    } catch (err) {
      // VIP tables don't exist yet
      return NextResponse.json({
        vip_active: false,
        tier: null,
        benefits: {}
      });
    }
  } catch (error) {
    console.error('Error checking VIP status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vip/purchase
 * Purchase a VIP tier
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

    const body = await request.json();
    const { tier_name } = body;

    if (!tier_name) {
      return NextResponse.json(
        { error: 'tier_name required' },
        { status: 400 }
      );
    }

    const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
    
    try {
      // Get VIP tier details
      const tierResult = await sql`
        SELECT * FROM vip_tiers 
        WHERE tier_name = ${tier_name} AND is_active = true
      `;

      if (tierResult.length === 0) {
        await sql.end();
        return NextResponse.json(
          { error: 'VIP tier not found' },
          { status: 404 }
        );
      }

      const tier = tierResult[0];

      // Get user current coins
      const userResult = await db
        .select({ coins: users.coins })
        .from(users)
        .where(eq(users.id, user.id));

      const userCoins = parseFloat(userResult[0]?.coins || '0');
      
      if (userCoins < tier.price_coins) {
        await sql.end();
        return NextResponse.json(
          { error: `Insufficient coins. Need ${tier.price_coins}, have ${userCoins}` },
          { status: 400 }
        );
      }

      // Transaction: deduct coins + create subscription
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + tier.duration_days);

      // Deduct coins
      await db
        .update(users)
        .set({ coins: `${userCoins - tier.price_coins}` })
        .where(eq(users.id, user.id));

      // Create subscription
      await sql`
        INSERT INTO user_subscriptions (user_id, tier_id, expires_at, auto_renew, is_active)
        VALUES (${user.id}, ${tier.id}, ${expiryDate.toISOString()}, false, true)
        ON CONFLICT (user_id, tier_id) 
        DO UPDATE SET expires_at = ${expiryDate.toISOString()}, is_active = true
      `;

      await sql.end();

      return NextResponse.json({
        success: true,
        message: `Successfully purchased ${tier.tier_name}`,
        tier: tier.tier_name,
        expires_at: expiryDate,
        benefits: tier.benefits,
        coins_remaining: userCoins - tier.price_coins
      });
    } catch (error) {
      await sql.end();
      throw error;
    }
  } catch (error) {
    console.error('Error purchasing VIP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
