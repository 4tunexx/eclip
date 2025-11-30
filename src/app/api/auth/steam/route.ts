import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

// Steam OpenID authentication endpoint
export async function GET(request: NextRequest) {
  try {
    const steamApiKey = config.steam.apiKey;
    if (!steamApiKey) {
      return NextResponse.json(
        { error: 'Steam authentication not configured' },
        { status: 500 }
      );
    }

    const realm = config.steam.realm!;
    const returnTo = config.steam.returnUrl!;

    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': returnTo,
      'openid.realm': realm,
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    });

    const redirectUrl = `https://steamcommunity.com/openid/login?${params.toString()}`;
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Steam auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

