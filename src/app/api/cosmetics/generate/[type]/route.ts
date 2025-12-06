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
  { params }: { params: { type: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const rarity = (searchParams.get('rarity') || 'common').toLowerCase() as
      | 'legendary'
      | 'epic'
      | 'rare'
      | 'common';
    const title = searchParams.get('title') || 'Eclip.pro';
    const subtitle = searchParams.get('subtitle');
    const label = searchParams.get('label') || 'Badge';

    let svg: string;

    switch (params.type) {
      case 'frame':
        svg = generateAvatarFrameSVG({ type: rarity, username: title });
        break;

      case 'banner':
        svg = generateBannerSVG({
          type: rarity,
          title,
          subtitle: subtitle || undefined,
        });
        break;

      case 'badge':
        svg = generateBadgeSVG({ type: rarity, label });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid cosmetic type. Use: frame, banner, badge' },
          { status: 400 }
        );
    }

    // Return as SVG with proper content-type
    return new NextResponse(svg.replace(/^data:image\/svg\+xml;base64,/, ''), {
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
