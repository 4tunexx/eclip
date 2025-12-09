import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/auth/steam/link-return
 * Handles the Steam OAuth callback for account linking
 * Links the Steam ID to the currently logged-in user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(new URL('/?steam-link=unauthorized', request.url));
    }

    if (!user.emailVerified) {
      return NextResponse.redirect(new URL('/?steam-link=unverified', request.url));
    }

    const url = new URL(request.url);
    const params = url.searchParams;

    const openidParams = new URLSearchParams();
    for (const [k, v] of params.entries()) {
      if (k.startsWith('openid.')) openidParams.append(k, v);
    }
    openidParams.set('openid.mode', 'check_authentication');

    console.log('[Steam Link Return] Verifying with Steam...');

    const verifyResp = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: openidParams.toString(),
    });
    const verifyText = await verifyResp.text();

    if (!/is_valid\s*:\s*true/.test(verifyText)) {
      console.error('[Steam Link Return] Verification failed');
      return NextResponse.redirect(new URL('/?steam-link=invalid', request.url));
    }

    const claimedId = params.get('openid.claimed_id') || '';
    const match = claimedId.match(/\/id\/(\d+)/) || claimedId.match(/\/openid\/id\/(\d+)/) || claimedId.match(/(\d{17})/);
    if (!match) {
      console.error('[Steam Link Return] Could not extract Steam ID from:', claimedId);
      return NextResponse.redirect(new URL('/?steam-link=missingid', request.url));
    }
    const steamId = match[1];
    console.log('[Steam Link Return] Extracted Steam ID:', steamId);

    // Check if this Steam ID is already linked to another account
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.steamId, steamId))
      .limit(1);

    if (existingUser && existingUser.id !== user.id) {
      console.warn('[Steam Link Return] Steam ID already linked to different user');
      return NextResponse.redirect(new URL('/?steam-link=already-linked', request.url));
    }

    // Update current user with Steam ID
    await db.update(users)
      .set({ steamId })
      .where(eq(users.id, user.id));

    console.log('[Steam Link Return] Successfully linked Steam ID:', { userId: user.id, steamId });
    return NextResponse.redirect(new URL('/?steam-link=success', request.url));
  } catch (error) {
    console.error('[Steam Link Return] Error:', error);
    return NextResponse.redirect(new URL('/?steam-link=error', request.url));
  }
}
