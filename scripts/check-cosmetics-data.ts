import 'dotenv/config';
import { db } from '@/lib/db';
import { cosmetics } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function checkCosmeticsData() {
  try {
    console.log('🔍 Checking cosmetics data structure...\n');

    // Get one banner
    const [banner] = await db.select().from(cosmetics).where(eq(cosmetics.type, 'Banner')).limit(1);
    if (banner) {
      console.log('📋 Sample Banner:');
      console.log('  ID:', banner.id);
      console.log('  Name:', banner.name);
      console.log('  Type:', banner.type);
      console.log('  Rarity:', banner.rarity);
      console.log('  Price:', banner.price);
      console.log('  ImageUrl:', banner.imageUrl);
      console.log('  Metadata:', JSON.stringify(banner.metadata, null, 2));
      console.log('  metadata.gradient:', (banner.metadata as any)?.gradient);
    }

    console.log('\n---\n');

    // Get one frame
    const [frame] = await db.select().from(cosmetics).where(eq(cosmetics.type, 'Frame')).limit(1);
    if (frame) {
      console.log('📋 Sample Frame:');
      console.log('  ID:', frame.id);
      console.log('  Name:', frame.name);
      console.log('  Type:', frame.type);
      console.log('  Rarity:', frame.rarity);
      console.log('  Price:', frame.price);
      console.log('  ImageUrl:', frame.imageUrl);
      console.log('  Metadata:', JSON.stringify(frame.metadata, null, 2));
      console.log('  metadata.border_color:', (frame.metadata as any)?.border_color);
      console.log('  metadata.border_gradient:', (frame.metadata as any)?.border_gradient);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

checkCosmeticsData();
