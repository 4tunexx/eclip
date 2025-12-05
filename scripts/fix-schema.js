import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });

async function fixSchema() {
  try {
    console.log('🔧 Starting schema fixes...\n');

    // 1. Create missions table
    console.log('📝 Creating missions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS missions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('platform', 'cs2', 'social', 'cosmetic', 'progression', 'event')),
        requirement_type TEXT NOT NULL,
        requirement_value TEXT,
        target INTEGER NOT NULL,
        reward_xp INTEGER NOT NULL DEFAULT 0,
        reward_coins INTEGER NOT NULL DEFAULT 0,
        reward_cosmetic_id UUID,
        is_daily BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('  ✓ Missions table created');

    // 2. Create user_mission_progress table
    console.log('📝 Creating user_mission_progress table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_mission_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        mission_id UUID NOT NULL REFERENCES missions(id),
        progress INTEGER NOT NULL DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, mission_id)
      )
    `;
    console.log('  ✓ User mission progress table created');

    // 3. Update achievements table to add missing fields
    console.log('📝 Updating achievements table...');
    
    // Check if fields exist before adding
    const achievementsCols = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'achievements'
    `;
    const colNames = achievementsCols.map(c => c.column_name);

    if (!colNames.includes('category')) {
      await sql`ALTER TABLE achievements ADD COLUMN category TEXT DEFAULT 'cs2'`;
      console.log('  ✓ Added category column');
    }
    
    if (!colNames.includes('requirement_type')) {
      await sql`ALTER TABLE achievements ADD COLUMN requirement_type TEXT`;
      console.log('  ✓ Added requirement_type column');
    }
    
    if (!colNames.includes('requirement_value')) {
      await sql`ALTER TABLE achievements ADD COLUMN requirement_value TEXT`;
      console.log('  ✓ Added requirement_value column');
    }
    
    if (!colNames.includes('target')) {
      await sql`ALTER TABLE achievements ADD COLUMN target INTEGER DEFAULT 1`;
      console.log('  ✓ Added target column');
    }
    
    if (!colNames.includes('reward_xp')) {
      await sql`ALTER TABLE achievements ADD COLUMN reward_xp INTEGER DEFAULT 0`;
      console.log('  ✓ Added reward_xp column');
    }
    
    if (!colNames.includes('reward_badge_id')) {
      await sql`ALTER TABLE achievements ADD COLUMN reward_badge_id UUID`;
      console.log('  ✓ Added reward_badge_id column');
    }
    
    if (!colNames.includes('is_secret')) {
      await sql`ALTER TABLE achievements ADD COLUMN is_secret BOOLEAN DEFAULT FALSE`;
      console.log('  ✓ Added is_secret column');
    }
    
    if (!colNames.includes('is_active')) {
      await sql`ALTER TABLE achievements ADD COLUMN is_active BOOLEAN DEFAULT TRUE`;
      console.log('  ✓ Added is_active column');
    }

    // 4. Create proper badges table
    console.log('📝 Creating badges table...');
    await sql`
      CREATE TABLE IF NOT EXISTS badges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'celestial')),
        icon_key TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('  ✓ Badges table created');

    // 5. Create user_achievements table properly
    console.log('📝 Verifying user_achievements table...');
    const userAchievementsCols = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'user_achievements'
    `;
    
    if (userAchievementsCols.length === 0) {
      await sql`
        CREATE TABLE IF NOT EXISTS user_achievements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          achievement_id UUID NOT NULL REFERENCES achievements(id),
          progress INTEGER NOT NULL DEFAULT 0,
          unlocked_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, achievement_id)
        )
      `;
      console.log('  ✓ User achievements table created');
    } else {
      console.log('  ✓ User achievements table exists');
    }

    // 6. Create indices for performance
    console.log('📝 Creating performance indices...');
    await sql`CREATE INDEX IF NOT EXISTS idx_missions_category ON missions(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_missions_daily ON missions(is_daily)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_missions_active ON missions(is_active)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_mission_progress ON user_mission_progress(user_id, mission_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_achievements ON user_achievements(user_id, achievement_id)`;
    console.log('  ✓ Indices created');

    console.log('\n✅ Schema fixes complete!\n');
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

fixSchema();
