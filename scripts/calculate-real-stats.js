#!/usr/bin/env node

/**
 * REAL USER STATISTICS CALCULATOR
 * Calculates actual stats from match data, not mockups
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function calculateStats() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║            REAL USER STATISTICS - FROM ACTUAL MATCH DATA                   ║');
    console.log('║            (Calculated, not hardcoded, based on match history)             ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    // Get all users with their stats
    const userStats = await client.query(`
      SELECT 
        u.id,
        u.username,
        u.esr,
        u.level,
        u.xp,
        COALESCE(COUNT(DISTINCT mp.match_id), 0) as matches_played,
        COALESCE(SUM(mp.kills), 0) as total_kills,
        COALESCE(SUM(mp.deaths), 0) as total_deaths,
        COALESCE(SUM(mp.assists), 0) as total_assists,
        COALESCE(SUM(CASE WHEN mp.is_winner THEN 1 ELSE 0 END), 0) as matches_won,
        COALESCE(AVG(mp.kills), 0) as avg_kills,
        COALESCE(AVG(mp.deaths), 0) as avg_deaths,
        COALESCE(AVG(mp.hs_percentage), 0) as avg_hs_percent,
        COALESCE(SUM(mp.mvps), 0) as total_mvps,
        (SELECT COUNT(*) FROM user_inventory WHERE user_id = u.id) as cosmetics_owned,
        (SELECT COUNT(*) FROM user_achievements ua WHERE ua.user_id = u.id) as achievements_unlocked
      FROM users u
      LEFT JOIN match_players mp ON u.id = mp.user_id
      GROUP BY u.id, u.username, u.esr, u.level, u.xp
      ORDER BY u.esr DESC
    `);

    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('🏆 USER RANKINGS BY ESR (REAL DATA FROM MATCHES)');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    console.log(
      '  Rank | Username'.padEnd(25) + 
      ' | ESR'.padEnd(8) + 
      ' | Level'.padEnd(8) + 
      ' | Matches'.padEnd(10) + 
      ' | W-L'.padEnd(10) + 
      ' | K/D'
    );
    console.log('─'.repeat(100));

    for (let i = 0; i < userStats.rows.length; i++) {
      const u = userStats.rows[i];
      const wl = u.matches_played > 0 
        ? `${u.matches_won}-${u.matches_played - u.matches_won}`
        : '0-0';
      const kd = u.total_deaths > 0 
        ? (u.total_kills / u.total_deaths).toFixed(2)
        : u.total_kills > 0 ? u.total_kills.toFixed(2) : '0.00';

      console.log(
        `  ${(i + 1).toString().padEnd(4)} | ${u.username.padEnd(20)} | ${u.esr.toString().padEnd(6)} | ${u.level.toString().padEnd(6)} | ${u.matches_played.toString().padEnd(8)} | ${wl.padEnd(8)} | ${kd}`
      );
    }

    // Detailed stats for each user
    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('📊 DETAILED USER STATISTICS');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    for (const user of userStats.rows) {
      const winRate = user.matches_played > 0 
        ? ((user.matches_won / user.matches_played) * 100).toFixed(1)
        : 0;

      console.log(`\n👤 ${user.username.toUpperCase()}`);
      console.log('─'.repeat(70));
      console.log(`  Rank Information:`);
      console.log(`    • ESR (Elo Rating): ${user.esr}`);
      console.log(`    • Level: ${user.level}`);
      console.log(`    • Total XP: ${user.xp}`);
      console.log(`\n  Match Statistics (REAL DATA):`);
      console.log(`    • Matches Played: ${user.matches_played}`);
      console.log(`    • Matches Won: ${user.matches_won}`);
      console.log(`    • Win Rate: ${winRate}%`);
      console.log(`    • Total Kills: ${user.total_kills}`);
      console.log(`    • Total Deaths: ${user.total_deaths}`);
      console.log(`    • Total Assists: ${user.total_assists}`);
      console.log(`    • Avg Kills/Match: ${user.avg_kills.toFixed(2)}`);
      console.log(`    • Avg Deaths/Match: ${user.avg_deaths.toFixed(2)}`);
      console.log(`    • Headshot %: ${user.avg_hs_percent.toFixed(1)}%`);
      console.log(`    • Total MVPs: ${user.total_mvps}`);
      console.log(`\n  Progression:`);
      console.log(`    • Cosmetics Owned: ${user.cosmetics_owned}`);
      console.log(`    • Achievements: ${user.achievements_unlocked}`);
    }

    // Overall statistics
    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('📈 OVERALL STATISTICS');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const totalMatches = await client.query('SELECT COUNT(*) as count FROM matches');
    const totalPlayers = await client.query('SELECT COUNT(DISTINCT user_id) as count FROM match_players');
    const totalKills = await client.query('SELECT COALESCE(SUM(kills), 0) as total FROM match_players');
    const totalDeaths = await client.query('SELECT COALESCE(SUM(deaths), 0) as total FROM match_players');
    const avgKd = totalDeaths.rows[0].total > 0 
      ? (totalKills.rows[0].total / totalDeaths.rows[0].total).toFixed(2)
      : 0;

    console.log(`Total Matches: ${totalMatches.rows[0].count}`);
    console.log(`Players Participated: ${totalPlayers.rows[0].count}`);
    console.log(`Total Kills: ${totalKills.rows[0].total}`);
    console.log(`Total Deaths: ${totalDeaths.rows[0].total}`);
    console.log(`Average K/D Ratio: ${avgKd}`);

    // Map statistics
    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('🗺️  MAP STATISTICS');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const mapStats = await client.query(`
      SELECT 
        map,
        COUNT(*) as matches_played,
        SUM(CASE WHEN winner_team = '1' THEN 1 ELSE 0 END) as team_1_wins,
        SUM(CASE WHEN winner_team = '2' THEN 1 ELSE 0 END) as team_2_wins
      FROM matches
      GROUP BY map
      ORDER BY matches_played DESC
    `);

    for (const map of mapStats.rows) {
      console.log(`${map.map}: ${map.matches_played} matches (Team 1: ${map.team_1_wins}W, Team 2: ${map.team_2_wins}W)`);
    }

    // Achievement status
    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('🏅 ACHIEVEMENT STATUS');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const achievements = await client.query(`
      SELECT 
        a.name,
        a.description,
        a.points,
        COUNT(ua.id) as users_unlocked
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id
      GROUP BY a.id, a.name, a.description, a.points
      ORDER BY users_unlocked DESC
    `);

    for (const ach of achievements.rows) {
      console.log(`${ach.name.padEnd(25)} | ${ach.users_unlocked} users | ${ach.points}pts`);
    }

    // Mission status
    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('🎯 MISSION STATUS');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const missions = await client.query(`
      SELECT 
        m.title,
        m.category,
        COUNT(DISTINCT ump.user_id) as users_participating,
        SUM(CASE WHEN ump.completed THEN 1 ELSE 0 END) as completed
      FROM missions m
      LEFT JOIN user_mission_progress ump ON m.id = ump.mission_id
      GROUP BY m.id, m.title, m.category
      ORDER BY users_participating DESC
    `);

    for (const mission of missions.rows) {
      const completionRate = mission.users_participating > 0
        ? ((mission.completed / mission.users_participating) * 100).toFixed(1)
        : 0;
      console.log(`${mission.title.padEnd(25)} | ${mission.users_participating} users | ${mission.completed} completed (${completionRate}%)`);
    }

    // Economic stats
    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('💰 ECONOMIC STATISTICS');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const transactions = await client.query(`
      SELECT 
        type,
        COUNT(*) as count,
        COALESCE(SUM(amount::numeric), 0) as total
      FROM transactions
      GROUP BY type
    `);

    for (const trans of transactions.rows) {
      console.log(`${trans.type.padEnd(15)} | ${trans.count.toString().padEnd(6)} transactions | Total: ${trans.total}`);
    }

    const totalInventory = await client.query('SELECT COUNT(*) as count FROM user_inventory');
    console.log(`\nTotal cosmetics sold: ${totalInventory.rows[0].count}`);

    // Forum activity
    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('💬 FORUM ACTIVITY');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const forumStats = await client.query(`
      SELECT 
        fc.title,
        COUNT(DISTINCT ft.id) as threads,
        COUNT(DISTINCT fp.id) as posts
      FROM forum_categories fc
      LEFT JOIN forum_threads ft ON fc.id = ft.category_id
      LEFT JOIN forum_posts fp ON ft.id = fp.thread_id
      GROUP BY fc.id, fc.title
      ORDER BY fc.title
    `);

    for (const forum of forumStats.rows) {
      console.log(`${forum.title.padEnd(25)} | ${forum.threads} threads | ${forum.posts} posts`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log('✅ ALL STATISTICS ARE REAL AND CALCULATED FROM ACTUAL DATABASE DATA');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

calculateStats();
