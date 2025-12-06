#!/usr/bin/env node
/**
 * Seed cosmetics, VIP tiers, and shop data
 * Creates: Frames (10), Banners (20), cosmetics data + VIP purchase system
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    console.log('🛍️ Setting up cosmetics and VIP system...\n');

    // 1. Create cosmetics table if not exists
    console.log('📦 Creating cosmetics table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cosmetics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL CHECK (type IN ('Frame', 'Banner', 'Badge', 'Title')),
        rarity TEXT NOT NULL CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')),
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Cosmetics table ready\n');

    // 2. Create user inventory table if not exists
    console.log('📦 Creating user inventory table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        cosmetic_id UUID NOT NULL REFERENCES cosmetics(id) ON DELETE CASCADE,
        purchased_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, cosmetic_id)
      )
    `);
    console.log('✅ User inventory table ready\n');

    // 3. Create VIP tiers table
    console.log('📦 Creating VIP tiers table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vip_tiers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tier_name TEXT NOT NULL UNIQUE,
        tier_level INT NOT NULL UNIQUE,
        price_coins INT NOT NULL,
        duration_days INT NOT NULL,
        benefits JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ VIP tiers table ready\n');

    // 4. Create user subscriptions table
    console.log('📦 Creating user subscriptions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tier_id UUID NOT NULL REFERENCES vip_tiers(id) ON DELETE CASCADE,
        purchased_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL,
        auto_renew BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        UNIQUE(user_id, tier_id)
      )
    `);
    console.log('✅ User subscriptions table ready\n');

    // 5. Seed Frames (10)
    console.log('🖼️ Seeding 10 Frames...');
    const frameNames = [
      'Classic Gold', 'Neon Blue', 'Emerald Green', 'Royal Purple', 'Ruby Red',
      'Silver Storm', 'Golden Glow', 'Crystal Clear', 'Dark Night', 'Sunset Orange'
    ];
    
    for (let i = 0; i < frameNames.length; i++) {
      const rarities = ['Common', 'Common', 'Rare', 'Rare', 'Epic', 'Legendary'];
      const rarity = rarities[i % rarities.length];
      const priceMap = { Common: 100, Rare: 500, Epic: 2000, Legendary: 5000 };
      
      await pool.query(
        `INSERT INTO cosmetics (name, description, type, rarity, price, image_url, is_active)
         VALUES ($1, $2, 'Frame', $3, $4, $5, true)
         ON CONFLICT DO NOTHING`,
        [
          frameNames[i],
          `Beautiful ${frameNames[i]} frame for your profile`,
          rarity,
          priceMap[rarity],
          `https://via.placeholder.com/150?text=${frameNames[i].replace(' ', '+')}`
        ]
      );
    }
    console.log('✅ 10 Frames seeded\n');

    // 6. Seed Banners (20)
    console.log('🎨 Seeding 20 Banners...');
    const bannerThemes = [
      'Mountains', 'Ocean', 'Forest', 'City', 'Desert',
      'Galaxy', 'Aurora', 'Fire', 'Ice', 'Thunder',
      'Sakura', 'Cyberpunk', 'Retro', 'Neon', 'Gradient',
      'Abstract', 'Geometric', 'Marble', 'Wood', 'Metal'
    ];
    
    for (let i = 0; i < bannerThemes.length; i++) {
      const rarities = ['Common', 'Common', 'Common', 'Rare', 'Rare', 'Epic', 'Legendary'];
      const rarity = rarities[i % rarities.length];
      const priceMap = { Common: 150, Rare: 750, Epic: 2500, Legendary: 7500 };
      
      await pool.query(
        `INSERT INTO cosmetics (name, description, type, rarity, price, image_url, is_active)
         VALUES ($1, $2, 'Banner', $3, $4, $5, true)
         ON CONFLICT DO NOTHING`,
        [
          `${bannerThemes[i]} Banner`,
          `Epic ${bannerThemes[i]} themed banner for your profile`,
          rarity,
          priceMap[rarity],
          `https://via.placeholder.com/300x100?text=${bannerThemes[i]}`
        ]
      );
    }
    console.log('✅ 20 Banners seeded\n');

    // 7. Seed Titles (5)
    console.log('🏷️ Seeding 5 Titles...');
    const titles = [
      'Legendary', 'Champion', 'Master', 'Elite', 'Immortal'
    ];
    
    for (const title of titles) {
      await pool.query(
        `INSERT INTO cosmetics (name, description, type, rarity, price, image_url, is_active)
         VALUES ($1, $2, 'Title', $3, $4, $5, true)
         ON CONFLICT DO NOTHING`,
        [
          title,
          `Display "${title}" title under your name`,
          'Epic',
          3000,
          `https://via.placeholder.com/100?text=${title}`
        ]
      );
    }
    console.log('✅ 5 Titles seeded\n');

    // 8. Create VIP Tiers
    console.log('👑 Creating VIP tiers...');
    const vipTiers = [
      {
        name: 'VIP Bronze',
        level: 1,
        price: 500,
        duration: 30,
        benefits: {
          xp_boost: 1.1,
          coin_boost: 1.0,
          daily_mission_limit: 10,
          cosmetics_discount: 0.05
        }
      },
      {
        name: 'VIP Silver',
        level: 2,
        price: 1500,
        duration: 30,
        benefits: {
          xp_boost: 1.25,
          coin_boost: 1.1,
          daily_mission_limit: 15,
          cosmetics_discount: 0.10,
          exclusive_cosmetics: true
        }
      },
      {
        name: 'VIP Gold',
        level: 3,
        price: 4000,
        duration: 30,
        benefits: {
          xp_boost: 1.5,
          coin_boost: 1.25,
          daily_mission_limit: 20,
          cosmetics_discount: 0.15,
          exclusive_cosmetics: true,
          priority_matchmaking: true,
          ad_free: true
        }
      },
      {
        name: 'VIP Platinum',
        level: 4,
        price: 9999,
        duration: 30,
        benefits: {
          xp_boost: 2.0,
          coin_boost: 1.5,
          daily_mission_limit: 99,
          cosmetics_discount: 0.20,
          exclusive_cosmetics: true,
          priority_matchmaking: true,
          ad_free: true,
          custom_title: true,
          early_access_features: true
        }
      }
    ];

    for (const tier of vipTiers) {
      await pool.query(
        `INSERT INTO vip_tiers (tier_name, tier_level, price_coins, duration_days, benefits, is_active)
         VALUES ($1, $2, $3, $4, $5::jsonb, true)
         ON CONFLICT (tier_name) DO NOTHING`,
        [tier.name, tier.level, tier.price, tier.duration, JSON.stringify(tier.benefits)]
      );
    }
    console.log('✅ 4 VIP Tiers created (Bronze, Silver, Gold, Platinum)\n');

    // 9. Summary
    const cosmCount = await pool.query(`SELECT COUNT(*) as count FROM cosmetics WHERE is_active = true`);
    const vipCount = await pool.query(`SELECT COUNT(*) as count FROM vip_tiers WHERE is_active = true`);
    
    console.log('═'.repeat(60));
    console.log('\n✅ SHOP & VIP SYSTEM READY!\n');
    console.log('📊 SUMMARY:');
    console.log(`   Frames: 10 (prices 100-5000 coins)`);
    console.log(`   Banners: 20 (prices 150-7500 coins)`);
    console.log(`   Titles: 5 (prices 3000 coins)`);
    console.log(`   Total Cosmetics: ${cosmCount.rows[0].count}`);
    console.log();
    console.log('👑 VIP TIERS: ${vipCount.rows[0].count}');
    vipTiers.forEach(tier => {
      console.log(`   ${tier.name}: ${tier.price} coins/month`);
    });
    console.log();
    console.log('🎁 VIP BENEFITS:');
    console.log('   Bronze:   1.1x XP boost');
    console.log('   Silver:   1.25x XP, 1.1x Coins, Exclusive cosmetics');
    console.log('   Gold:     1.5x XP, 1.25x Coins, Priority queue, Ad-free');
    console.log('   Platinum: 2x XP, 1.5x Coins, Custom title, Early access');
    console.log();
    console.log('🛒 SHOP API ENDPOINTS:');
    console.log('   GET  /api/shop/items         - List all cosmetics');
    console.log('   POST /api/shop/purchase      - Buy cosmetic');
    console.log('   POST /api/shop/equip         - Equip cosmetic');
    console.log('   POST /api/vip/purchase       - Buy VIP tier');
    console.log('   GET  /api/vip/status         - Check VIP status');
    console.log();
    console.log('═'.repeat(60) + '\n');

    await pool.end();
  } catch(e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
