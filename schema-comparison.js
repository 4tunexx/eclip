require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Actual DB schema from inspection
const actualSchema = {
  achievements: ['id', 'code', 'name', 'description', 'points', 'category', 'requirement_type', 'requirement_value', 'target', 'reward_xp', 'reward_badge_id', 'is_secret', 'is_active'],
  user_achievements: ['id', 'user_id', 'achievement_id', 'unlocked_at'], // NO progress, created_at, updated_at
  matches: ['id', 'ladder', 'server_instance_id', 'started_at', 'ended_at', 'status', 'server_id', 'map', 'team_a_players', 'team_b_players', 'winner_team', 'match_start', 'match_end'],
  // NO: score_team1, score_team2, server_host, server_port, map_image_url, created_at, updated_at
  user_profiles: ['id', 'user_id', 'title', 'equipped_frame_id', 'equipped_banner_id', 'equipped_badge_id', 'stats', 'created_at', 'updated_at'],
  users: ['id', 'steam_id', 'username', 'eclip_id', 'created_at', 'avatar', 'rank_points', 'coins', 'updated_at', 'role_color', 'rank_tier', 'rank_division', 'email', 'password_hash', 'role', 'email_verified', 'email_verification_token', 'password_reset_token', 'password_reset_expires', 'level', 'xp', 'esr', 'rank', 'level_computed'],
  cosmetics: ['id', 'name', 'description', 'type', 'rarity', 'price', 'image_url', 'is_active', 'created_at', 'updated_at'],
};

// Code schema expectations from schema.ts (UPDATED)
const codeSchema = {
  achievements: ['id', 'code', 'name', 'description', 'points', 'category', 'requirementType', 'requirementValue', 'target', 'rewardXp', 'rewardBadgeId', 'isSecret', 'isActive'],
  user_achievements: ['id', 'userId', 'achievementId', 'unlockedAt'],
  matches: ['id', 'ladder', 'serverInstanceId', 'startedAt', 'endedAt', 'status', 'serverId', 'map', 'teamAPlayers', 'teamBPlayers', 'winnerTeam', 'matchStart', 'matchEnd'],
  user_profiles: ['id', 'userId', 'title', 'equippedFrameId', 'equippedBannerId', 'equippedBadgeId', 'stats', 'createdAt', 'updatedAt'],
  users: ['id', 'email', 'username', 'passwordHash', 'steamId', 'eclipId', 'avatar', 'rankPoints', 'coins', 'roleColor', 'rankTier', 'rankDivision', 'level', 'xp', 'esr', 'rank', 'role', 'emailVerified', 'emailVerificationToken', 'passwordResetToken', 'passwordResetExpires', 'createdAt', 'updatedAt'],
  cosmetics: ['id', 'name', 'description', 'type', 'rarity', 'price', 'imageUrl', 'isActive', 'createdAt', 'updatedAt'],
};

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

console.log('🔍 SCHEMA MISMATCH ANALYSIS\n');
console.log('='.repeat(70));

for (const [table, codeColumns] of Object.entries(codeSchema)) {
  const actualColumns = actualSchema[table];
  if (!actualColumns) {
    console.log(`\n⚠️  Table: ${table}`);
    console.log(`   NOT FOUND IN DATABASE!`);
    continue;
  }

  const codeColumnsSnake = codeColumns.map(toSnakeCase);
  const missing = codeColumnsSnake.filter(col => !actualColumns.includes(col));
  const extra = actualColumns.filter(col => !codeColumnsSnake.includes(col));

  if (missing.length > 0 || extra.length > 0) {
    console.log(`\n⚠️  Table: ${table}`);
    if (missing.length > 0) {
      console.log(`   ❌ Code expects but DB missing: ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
      console.log(`   ℹ️  DB has but code doesn't use: ${extra.join(', ')}`);
    }
  } else {
    console.log(`\n✅ Table: ${table} - All columns match!`);
  }
}

console.log('\n' + '='.repeat(70));
console.log('\n🔍 Now scanning API routes for potential issues...\n');

// Find all API routes that query these tables
const apiDir = path.join(__dirname, 'src', 'app', 'api');

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  // Check for problematic patterns
  if (content.includes('matches.mapImageUrl') || content.includes('mapImageUrl')) {
    issues.push('Uses mapImageUrl (does not exist in DB)');
  }
  if (content.includes('userAchievements.progress') && !content.includes('// Progress')) {
    issues.push('Uses progress column from user_achievements (does not exist)');
  }
  if (content.includes('matches.scoreTeam1') || content.includes('scoreTeam1')) {
    issues.push('Uses scoreTeam1/scoreTeam2 (does not exist in DB)');
  }
  if (content.includes('matches.serverHost') || content.includes('serverHost')) {
    issues.push('Uses serverHost/serverPort (does not exist in DB)');
  }
  if (content.includes('.select().from(matches)')) {
    issues.push('Uses .select() wildcard on matches (will fail on missing columns)');
  }
  if (content.includes('.select().from(userAchievements)')) {
    issues.push('Uses .select() wildcard on userAchievements (will fail on missing columns)');
  }
  
  return issues;
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  const results = [];
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      results.push(...scanDirectory(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const issues = scanFile(fullPath);
      if (issues.length > 0) {
        results.push({ file: fullPath.replace(__dirname, ''), issues });
      }
    }
  }
  
  return results;
}

try {
  const problems = scanDirectory(apiDir);
  
  if (problems.length === 0) {
    console.log('✅ No schema mismatch issues found in API routes!');
  } else {
    console.log('⚠️  POTENTIAL ISSUES FOUND:\n');
    problems.forEach(({ file, issues }) => {
      console.log(`📄 ${file}`);
      issues.forEach(issue => console.log(`   ❌ ${issue}`));
      console.log();
    });
  }
} catch (error) {
  console.error('Error scanning files:', error.message);
}

pool.end();
