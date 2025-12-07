import { NextResponse } from 'next/server';
import {
  generateAvatarFrameSVG,
  generateBannerSVG,
  generateBadgeSVG,
} from '@/lib/cosmetic-generator';

/**
 * Cosmetic Generation Endpoints
 * Generate SVG cosmetics on-the-fly
 * Format: /api/cosmetics/generate/[type]?rarity=legendary&label=ProLeague
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const { searchParams } = new URL(request.url);
    const rarity = (searchParams.get('rarity') || 'common').toLowerCase() as
      | 'legendary'
      | 'epic'
      | 'rare'
      | 'common';
    const title = searchParams.get('title') || 'Eclip.pro';
    const subtitle = searchParams.get('subtitle');
    const username = searchParams.get('username') || title;
    const label = searchParams.get('label') || 'Badge';

    let svgDataUrl: string;

    switch (type) {
      case 'frame':
        svgDataUrl = generateAvatarFrameSVG({ type: rarity, username });
        break;

      case 'banner':
        svgDataUrl = generateBannerSVG({
          type: rarity,
          title,
          subtitle: subtitle || undefined,
        });
        break;

      case 'badge':
        svgDataUrl = generateBadgeSVG({ type: rarity, label });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid cosmetic type. Use: frame, banner, badge' },
          { status: 400 }
        );
    }

    // Extract base64 data and decode to SVG string
    const base64Data = svgDataUrl.replace(/^data:image\/svg\+xml;base64,/, '');
    const svgString = Buffer.from(base64Data, 'base64').toString('utf-8');

    // Return as SVG with proper content-type
    return new NextResponse(svgString, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error generating cosmetic:', error);
    return NextResponse.json(
      { error: 'Failed to generate cosmetic' },
      { status: 500 }
    );
  }
}
