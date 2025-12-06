import postgres from 'postgres';
import 'dotenv/config';

async function createLevelUpLogic() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    console.log('⚡ Creating level-up calculation logic...\n');

    // XP to Level mapping formula: Level = floor(XP / 100) + 1
    // So: 0-99 XP = Level 1, 100-199 = Level 2, etc.
    console.log('Creating function to calculate level from XP...');
    
    await sql`
      CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp_amount INTEGER)
      RETURNS INTEGER AS $$
      BEGIN
        RETURN FLOOR(xp_amount::DECIMAL / 100) + 1;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `;
    console.log('✓ Function created: calculate_level_from_xp(xp)');

    // Create rank update function
    console.log('\nCreating function to calculate rank from ESR...');
    
    await sql`
      CREATE OR REPLACE FUNCTION calculate_rank_from_esr(esr_amount INTEGER)
      RETURNS TABLE(rank TEXT, rank_tier TEXT, rank_division INTEGER) AS $$
      BEGIN
        RETURN QUERY SELECT 
          CASE 
            WHEN esr_amount < 1200 THEN 'Bronze'
            WHEN esr_amount < 1500 THEN 'Silver'
            WHEN esr_amount < 1800 THEN 'Gold'
            WHEN esr_amount < 2100 THEN 'Platinum'
            WHEN esr_amount < 2500 THEN 'Diamond'
            ELSE 'Radiant'
          END::TEXT,
          CASE 
            WHEN esr_amount < 1200 THEN 'Beginner'
            WHEN esr_amount < 1350 THEN 'Bronze I'
            WHEN esr_amount < 1500 THEN 'Bronze II'
            WHEN esr_amount < 1650 THEN 'Silver I'
            WHEN esr_amount < 1800 THEN 'Silver II'
            WHEN esr_amount < 1950 THEN 'Gold I'
            WHEN esr_amount < 2100 THEN 'Gold II'
            WHEN esr_amount < 2250 THEN 'Platinum I'
            WHEN esr_amount < 2400 THEN 'Platinum II'
            WHEN esr_amount < 2550 THEN 'Diamond I'
            ELSE 'Radiant'
          END::TEXT,
          CASE 
            WHEN esr_amount < 1200 THEN 1
            WHEN esr_amount < 1350 THEN 1
            WHEN esr_amount < 1500 THEN 2
            WHEN esr_amount < 1650 THEN 1
            WHEN esr_amount < 1800 THEN 2
            WHEN esr_amount < 1950 THEN 1
            WHEN esr_amount < 2100 THEN 2
            WHEN esr_amount < 2250 THEN 1
            WHEN esr_amount < 2400 THEN 2
            WHEN esr_amount < 2550 THEN 1
            ELSE 1
          END::INTEGER;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `;
    console.log('✓ Function created: calculate_rank_from_esr(esr)');

    // Update users table to use computed levels
    console.log('\nAdding helper columns for tracking...');
    
    try {
      await sql`ALTER TABLE users ADD COLUMN level_computed INTEGER GENERATED ALWAYS AS (calculate_level_from_xp(xp)) STORED;`;
      console.log('✓ Added computed column: level_computed');
    } catch (e) {
      console.log('~ level_computed already exists');
    }

    console.log('\n✅ Level-up logic created!');
    console.log('\nFormulas:');
    console.log('  Level = floor(XP / 100) + 1');
    console.log('  Ranks: Bronze (< 1200) → Silver → Gold → Platinum → Diamond → Radiant (based on ESR)');
    console.log('\nTest query to see calculated level:');
    console.log('  SELECT username, xp, calculate_level_from_xp(xp) as calculated_level FROM users;');

  } catch (error) {
    if (error?.message?.includes('already exists')) {
      console.log('✓ Functions already exist');
    } else {
      console.error('Failed:', error?.message || error);
      process.exitCode = 1;
    }
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
}

createLevelUpLogic();
