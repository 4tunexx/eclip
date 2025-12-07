import 'dotenv/config';
import { db } from '@/lib/db';
import { cosmetics } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

async function migrateCosmeticsToMetadata() {
  try {
    console.log('🔍 Checking cosmetics for metadata migration...');

    // Get all cosmetics
    const allCosmetics = await db.select().from(cosmetics);
    console.log(`📦 Found ${allCosmetics.length} cosmetics`);

    let migratedCount = 0;

    for (const item of allCosmetics) {
      let needsUpdate = false;
      let newMetadata = {};

      // ALWAYS parse imageUrl if it's JSON - this is the real data!
      if (item.imageUrl) {
        try {
          const parsed = JSON.parse(item.imageUrl);
          // If imageUrl contains object data, use it as metadata
          if (typeof parsed === 'object' && parsed !== null) {
            newMetadata = parsed;
            needsUpdate = true;
            console.log(`  🔄 ${item.type} "${item.name}": Migrating data from imageUrl to metadata`);
            console.log(`      Data:`, JSON.stringify(parsed).slice(0, 100) + '...');
          }
        } catch {
          // imageUrl is not JSON, might be a plain gradient string for banners
          if (item.type === 'Banner' && item.imageUrl.includes('gradient')) {
            newMetadata = { gradient: item.imageUrl };
            needsUpdate = true;
            console.log(`  🔄 Banner "${item.name}": Using imageUrl string as gradient`);
          }
        }
      }

      // Update if needed
      if (needsUpdate) {
        await db
          .update(cosmetics)
          .set({ metadata: newMetadata })
          .where(sql`${cosmetics.id} = ${item.id}`);
        migratedCount++;
      }
    }

    console.log(`\n✅ Migration complete! Updated ${migratedCount} cosmetics.`);
    console.log(`📊 ${allCosmetics.length - migratedCount} cosmetics didn't need migration.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateCosmeticsToMetadata();
