import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import postgres from 'postgres';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    const openidParams = new URLSearchParams();
    for (const [k, v] of params.entries()) {
      if (k.startsWith('openid.')) openidParams.append(k, v);
    }
    openidParams.set('openid.mode', 'check_authentication');

    const verifyResp = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: openidParams.toString(),
    });
    const verifyText = await verifyResp.text();
    if (!/is_valid\s*:\s*true/.test(verifyText)) {
      return NextResponse.redirect(new URL('/?steam=invalid', request.url));
    }

    const claimedId = params.get('openid.claimed_id') || '';
    const match = claimedId.match(/\/id\/(\d+)/) || claimedId.match(/\/openid\/id\/(\d+)/) || claimedId.match(/(\d{17})/);
    if (!match) {
      return NextResponse.redirect(new URL('/?steam=missingid', request.url));
    }
    const steamId = match[1];

    // Try drizzle users table first
    try {
      const [existing] = await db.select().from(users).where(eq(users.steamId, steamId)).limit(1);
      let userId = existing?.id as string | undefined;
      if (!userId) {
        const [u] = await db.insert(users).values({
          email: `${steamId}@steam.local`,
          username: `steam_${steamId.slice(-6)}`,
          passwordHash: null,
          steamId,
          emailVerified: true,
          level: 1,
          xp: 0,
          mmr: 1000,
          rank: 'Bronze',
          coins: '0',
          role: 'USER',
        }).returning();
        userId = u.id as string;
      }
      await createSession(userId);
      return NextResponse.redirect(new URL('/dashboard?steam=ok', request.url));
    } catch {
      // Fallback: legacy public."User"
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
        await sql.end({ timeout: 5 });
        if (userId) {
          await createSession(userId);
          return NextResponse.redirect(new URL('/dashboard?steam=ok', request.url));
        }
        return NextResponse.redirect(new URL('/?steam=ok', request.url));
      } catch (e) {
        try { await sql.end({ timeout: 5 }); } catch {}
        return NextResponse.redirect(new URL('/?steam=error', request.url));
      }
    }
  } catch (error) {
    console.error('Steam return error:', error);
    return NextResponse.redirect(new URL('/?steam=error', request.url));
  }
}
