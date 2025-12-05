import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });

async function checkData() {
  try {
    const missions = await sql`SELECT COUNT(*) as count FROM missions`;
    const achievements = await sql`SELECT COUNT(*) as count FROM achievements`;
    const badges = await sql`SELECT COUNT(*) as count FROM badges`;
    
    console.log('\n📊 Current Database State:');
    console.log(`  Missions: ${missions[0].count}`);
    console.log(`  Achievements: ${achievements[0].count}`);
    console.log(`  Badges: ${badges[0].count}`);
    console.log('');
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkData();
