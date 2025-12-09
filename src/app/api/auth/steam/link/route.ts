import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { config } from '@/lib/config';

/**
 * POST /api/auth/steam/link
 * Links a Steam account to the currently logged-in user's email account
 * This is used when a user registered with email and wants to add Steam auth
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // User must have email verified to link Steam
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Email must be verified before linking Steam' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { steamId } = body;

    if (!steamId || !/^\d{17}$/.test(steamId)) {
      return NextResponse.json(
        { error: 'Invalid Steam ID format' },
        { status: 400 }
      );
    }

    // Check if this Steam ID is already linked to another user
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.steamId, steamId))
      .limit(1);

    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json(
        { error: 'This Steam account is already linked to another user' },
        { status: 400 }
      );
    }

    // Update user with Steam ID
    await db.update(users)
      .set({ steamId })
      .where(eq(users.id, user.id));

    console.log('[Steam Link] User linked Steam account:', { userId: user.id, steamId });

    return NextResponse.json({
      success: true,
      message: 'Steam account linked successfully',
    });
  } catch (error) {
    console.error('[Steam Link] Error:', error);
    return NextResponse.json(
      { error: 'Failed to link Steam account' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/steam/link-url
 * Returns the Steam OAuth URL for linking (without creating a session)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Email must be verified before linking Steam' },
        { status: 403 }
      );
    }

    // Generate Steam OAuth URL that returns to a linking page
    const returnUrl = new URL(`${config.api.baseUrl}/api/auth/steam/link-return`);
    const steamAuthUrl = new URL('https://steamcommunity.com/openid/login');
    
    steamAuthUrl.searchParams.append('openid.ns', 'http://specs.openid.net/auth/2.0');
    steamAuthUrl.searchParams.append('openid.identity', 'http://specs.openid.net/auth/2.0/identifier_select');
    steamAuthUrl.searchParams.append('openid.claimed_id', 'http://specs.openid.net/auth/2.0/identifier_select');
    steamAuthUrl.searchParams.append('openid.mode', 'checkid_setup');
    steamAuthUrl.searchParams.append('openid.return_to', returnUrl.toString());
    steamAuthUrl.searchParams.append('openid.realm', config.steam.realm);
    steamAuthUrl.searchParams.append('openid.response_nonce', crypto.randomUUID());

    return NextResponse.json({
      url: steamAuthUrl.toString(),
    });
  } catch (error) {
    console.error('[Steam Link URL] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Steam link URL' },
      { status: 500 }
    );
  }
}
