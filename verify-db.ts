require('dotenv').config({ path: '.env.local' });
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const schema = require('./src/lib/db/schema');

async function checkAndSeedDatabase() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    console.log('🔍 Checking database...\n');

    // Check tables exist
    const tablesResult = await client`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log('✅ Found tables:', tablesResult.length);
    tablesResult.forEach((row: any) => {
      console.log('  -', row.table_name);
    });

    // Check critical data
    console.log('\n📊 Checking data...\n');

    // Check users
    const users = await db.select().from(schema.users).limit(5);
    console.log(`Users: ${users.length} found`);

    // Check achievements
    const achievements = await db.select().from(schema.achievements).limit(1);
    console.log(`Achievements: ${achievements.length} found`);
    
    if (achievements.length === 0) {
      console.log('\n⚠️  No achievements found - creating sample achievements...');
      
      await db.insert(schema.achievements).values([
        {
          name: 'First Blood',
          description: 'Get your first kill',
          category: 'COMBAT',
          requirementType: 'kill_count',
          requirementValue: '1',
          target: 1,
          rewardXp: 100,
          isActive: true
        },
        {
          name: 'Sharpshooter',
          description: 'Get 100 headshot kills',
          category: 'COMBAT',
          requirementType: 'headshot_kills',
          requirementValue: '100',
          target: 100,
          rewardXp: 500,
          isActive: true
        },
        {
          name: 'Climb to Gold',
          description: 'Reach Gold rank',
          category: 'ESR',
          requirementType: 'esr_threshold',
          requirementValue: '1600',
          target: 1600,
          rewardXp: 1000,
          isActive: true
        }
      ]);
      
      console.log('✅ Created 3 sample achievements');
    }

    // Check missions
    const missions = await db.select().from(schema.missions).limit(1);
    console.log(`Missions: ${missions.length} found`);
    
    if (missions.length === 0) {
      console.log('\n⚠️  No missions found - creating sample missions...');
      
      await db.insert(schema.missions).values([
        {
          title: 'Win 1 Match',
          description: 'Win a competitive match',
          category: 'DAILY',
          requirementType: 'win_match',
          requirementValue: '1',
          target: 1,
          rewardXp: 100,
          rewardCoins: 50,
          isDaily: true,
          isActive: true
        },
        {
          title: 'Get 10 Kills',
          description: 'Get 10 kills in matches',
          category: 'DAILY',
          requirementType: 'kill_count',
          requirementValue: '10',
          target: 10,
          rewardXp: 150,
          rewardCoins: 75,
          isDaily: true,
          isActive: true
        }
      ]);
      
      console.log('✅ Created 2 sample missions');
    }

    // Check cosmetics
    const cosmetics = await db.select().from(schema.cosmetics).limit(1);
    console.log(`Cosmetics: ${cosmetics.length} found`);
    
    if (cosmetics.length === 0) {
      console.log('\n⚠️  No cosmetics found - creating sample cosmetics...');
      
      await db.insert(schema.cosmetics).values([
        {
          name: 'Gold Frame',
          description: 'Premium gold avatar frame',
          type: 'Frame',
          rarity: 'Epic',
          price: '500',
          isActive: true
        },
        {
          name: 'Victory Banner',
          description: 'Show off your wins',
          type: 'Banner',
          rarity: 'Rare',
          price: '300',
          isActive: true
        },
        {
          name: 'Champion Badge',
          description: 'Elite player badge',
          type: 'Badge',
          rarity: 'Legendary',
          price: '1000',
          isActive: true
        }
      ]);
      
      console.log('✅ Created 3 sample cosmetics');
    }

    // Check ESR thresholds
    const esrThresholds = await db.select().from(schema.esrThresholds).limit(1);
    console.log(`ESR Thresholds: ${esrThresholds.length} found`);
    
    if (esrThresholds.length === 0) {
      console.log('\n⚠️  No ESR thresholds found - creating tier structure...');
      
      const tiers = [
        { tier: 'Bronze', ranges: [[0, 325], [325, 650], [650, 975], [975, 1300]], color: '#CD7F32' },
        { tier: 'Silver', ranges: [[1300, 1375], [1375, 1450], [1450, 1525], [1525, 1600]], color: '#C0C0C0' },
        { tier: 'Gold', ranges: [[1600, 1675], [1675, 1750], [1750, 1825], [1825, 1900]], color: '#FFD700' },
        { tier: 'Platinum', ranges: [[1900, 2000], [2000, 2100], [2100, 2150], [2150, 2200]], color: '#E5E4E2' },
        { tier: 'Diamond', ranges: [[2200, 2400], [2400, 2700], [2700, 3000], [3000, 5000]], color: '#B9F2FF' }
      ];
      
      for (const tierData of tiers) {
        for (let i = 0; i < 4; i++) {
          await db.insert(schema.esrThresholds).values({
            tier: tierData.tier,
            division: 4 - i, // Division IV to I
            minEsr: tierData.ranges[i][0],
            maxEsr: tierData.ranges[i][1],
            color: tierData.color
          });
        }
      }
      
      console.log('✅ Created ESR tier structure (20 tiers total)');
    }

    console.log('\n✅ Database check complete!\n');
    await client.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    await client.end();
    process.exit(1);
  }
}

checkAndSeedDatabase();
