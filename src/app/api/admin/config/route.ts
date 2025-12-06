import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { siteConfig } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

/**
 * GET /api/admin/config
 * Get all site configuration settings
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await db.select().from(siteConfig).execute();
    const config: Record<string, any> = {};

    for (const setting of settings) {
      config[setting.key] = setting.value;
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching site config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/config
 * Update site configuration settings
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { section, config } = body;

    const sectionKeys: Record<string, string[]> = {
      appearance: ['siteName', 'tagline', 'logoUrl', 'logoHeight', 'faviconUrl'],
      landing: ['heroTitle', 'heroSubtitle', 'heroBannerUrl', 'heroButtonText', 'heroButtonLink'],
      features: ['enableSocialFeatures', 'enableForumFeatures', 'enableVIPFeatures', 'enableCosmeticShop', 'enableMissions', 'enableAchievements', 'maintenanceMode', 'maintenanceMessage'],
      economy: ['coinsPerWin', 'coinsPerLoss', 'xpPerWin', 'xpPerLoss'],
      social: ['supportEmail', 'discordServerUrl', 'twitterUrl'],
    };

    const keysToUpdate = sectionKeys[section] || [];

    for (const key of keysToUpdate) {
      if (key in config) {
        const value = config[key];
        const existing = await db.select().from(siteConfig).where(eq(siteConfig.key, key)).limit(1).execute();

        if (existing.length > 0) {
          await db.update(siteConfig).set({
            value: typeof value === 'object' ? value : { value },
            updatedAt: new Date(),
            updatedBy: user.id,
          }).where(eq(siteConfig.key, key)).execute();
        } else {
          await db.insert(siteConfig).values({
            key,
            value: typeof value === 'object' ? value : { value },
            updatedBy: user.id,
          }).execute();
        }
      }
    }

    return NextResponse.json({
      message: `${section} configuration updated successfully`,
      section,
    });
  } catch (error) {
    console.error('Error updating site config:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
