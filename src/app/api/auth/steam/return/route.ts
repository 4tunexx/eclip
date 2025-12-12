import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import postgres from 'postgres';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createSession, getSession } from '@/lib/auth';

async function fetchSteamAvatar(steamId: string): Promise<string | null> {
  if (!config.steam.apiKey) return null;
  try {
    const resp = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.steam.apiKey}&steamids=${steamId}`);
    const data = await resp.json();
    const avatar = data?.response?.players?.[0]?.avatarfull;
    return avatar || null;
  } catch (err) {
    console.warn('[Steam Auth] Failed to fetch Steam avatar', err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[Steam Auth] Processing return from Steam');
    const url = new URL(request.url);
    const params = url.searchParams;

    const openidParams = new URLSearchParams();
    for (const [k, v] of params.entries()) {
      if (k.startsWith('openid.')) openidParams.append(k, v);
    }
    openidParams.set('openid.mode', 'check_authentication');

    console.log('[Steam Auth] Verifying with Steam...');

    const verifyResp = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: openidParams.toString(),
    });
    const verifyText = await verifyResp.text();
    console.log('[Steam Auth] Verification response:', verifyText.substring(0, 100));
    
    if (!/is_valid\s*:\s*true/.test(verifyText)) {
      console.error('[Steam Auth] Verification failed');
      return NextResponse.redirect(new URL('/?steam=invalid', request.url));
    }

    const claimedId = params.get('openid.claimed_id') || '';
    const match = claimedId.match(/\/id\/(\d+)/) || claimedId.match(/\/openid\/id\/(\d+)/) || claimedId.match(/(\d{17})/);
    if (!match) {
      console.error('[Steam Auth] Could not extract Steam ID from:', claimedId);
      return NextResponse.redirect(new URL('/?steam=missingid', request.url));
    }
    const steamId = match[1];
    console.log('[Steam Auth] Extracted Steam ID:', steamId);

    // Check if user is already logged in (linking scenario)
    const existingSession = await getSession();
    
    // Try drizzle users table first
    try {
      // Check if this Steam ID is already linked to an account
      const [linkedUser] = await db.select().from(users).where(eq(users.steamId, steamId)).limit(1);
      
      let userId: string | undefined;
      let isLinking = false;

      if (linkedUser) {
        // Steam ID already exists - use that user
        userId = linkedUser.id as string;
        console.log('[Steam Auth] Found existing user with this Steam ID');
      } else if (existingSession) {
        // User is logged in - link this Steam ID to their account
        console.log('[Steam Auth] User is logged in, linking Steam ID...');
        const [currentUser] = await db.select().from(users).where(eq(users.id, existingSession.userId)).limit(1);
        
        if (currentUser) {
          userId = currentUser.id as string;
          isLinking = true;
          
          // Update user with Steam ID
          await db.update(users)
            .set({ steamId })
            .where(eq(users.id, userId));
          console.log('[Steam Auth] Successfully linked Steam ID to existing user');
        }
      } else {
        // New user registering with Steam
        const [u] = await db.insert(users).values({
          email: `${steamId}@steam.local`,
          username: `steam_${steamId.slice(-6)}`,
          passwordHash: null,
          steamId,
          emailVerified: false, // Steam users must verify email separately
          level: 1,
          xp: 0,
          esr: 1000,
          rank: 'Bronze',
          coins: '0',
          role: 'USER',
        }).returning();
        userId = u.id as string;
        console.log('[Steam Auth] Created new user with Steam ID');
      }

      let avatarUrl = linkedUser?.avatar as string | undefined;
      
      // Sync Steam avatar if we have none or a temp placeholder
      if (!avatarUrl) {
        const steamAvatar = await fetchSteamAvatar(steamId);
        if (steamAvatar) {
          await db.update(users)
            .set({ avatar: steamAvatar })
            .where(eq(users.id, userId));
        }
      }
      
        // Only create new session if not already logged in (not linking)
        if (existingSession && isLinking) {
          // User is already logged in with session, just redirect to success
          const redirectUrl = new URL('/dashboard?steam-link=success', request.url);
          return NextResponse.redirect(redirectUrl);
        } else {
          // Create session and set cookie for new login
          const session = await createSession(userId!);
          
          console.log('[Steam Auth] Created session:', { userId, token: session.token.substring(0, 20) + '...', expiresAt: session.expiresAt });
          
          // Create redirect response to dashboard
          const redirectUrl = new URL('/dashboard', request.url);
          const response = NextResponse.redirect(redirectUrl);
          
          // Determine if production
          const isProduction = process.env.NODE_ENV === 'production' || 
                              process.env.API_BASE_URL?.includes('eclip.pro');
          
          // Set cookie on response with consistent settings
          response.cookies.set({
            name: 'session',
            value: session.token,
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            expires: session.expiresAt,
            path: '/',
            ...(isProduction && { domain: '.eclip.pro' }),
          });
          
          // Clear the logout timestamp to allow UserContext to refetch
          response.headers.set('Set-Cookie', `logout_timestamp=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC;`);
          
          return response;
        }
    } catch (drizzleErr) {
      console.log('[Steam Auth] Drizzle error, falling back to legacy table:', drizzleErr);
      
      // Fallback to legacy public."User" table
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
      try {
        const existing = await sql.unsafe('SELECT "id" FROM "public"."User" WHERE "steam_id" = $1 LIMIT 1;', [steamId]);
        let userId = existing.length ? existing[0].id : null;
        
        if (!userId) {
          const ins = await sql.unsafe(
            'INSERT INTO "public"."User" ("id", "steam_id", "username", "eclip_id", "created_at", "updated_at", "rank_points", "coins") VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW(), $4, $5) RETURNING "id";',
            [steamId, `steam_${steamId.slice(-6)}`, `E-${steamId}`, 1000, '0.00']
          );
          userId = ins[0].id;
        }
        
        const steamAvatar = await fetchSteamAvatar(steamId);
        if (steamAvatar) {
          try {
            await sql.unsafe('UPDATE "public"."User" SET "avatar" = $1 WHERE "id" = $2;', [steamAvatar, userId]);
          } catch {}
        }
        
        const session = await createSession(userId);
        
        const redirectUrl = new URL('/dashboard', request.url);
        const response = NextResponse.redirect(redirectUrl);
        
        const isProduction = process.env.NODE_ENV === 'production' || 
                            process.env.API_BASE_URL?.includes('eclip.pro');
        
        response.cookies.set({
          name: 'session',
          value: session.token,
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
          expires: session.expiresAt,
          path: '/',
          ...(isProduction && { domain: '.eclip.pro' }),
        });
        
        await sql.end({ timeout: 5 });
        return response;
      } catch (fallbackErr) {
        try { await sql.end({ timeout: 5 }); } catch {}
        console.error('[Steam Auth] Fallback error:', fallbackErr);
        return NextResponse.redirect(new URL('/?steam=error', request.url));
      }
    }
  } catch (error) {
    console.error('[Steam Auth] Error:', error);
    return NextResponse.redirect(new URL('/?steam=error', request.url));
  }
}
