#!/usr/bin/env node
/**
 * Create database triggers for notifications
 * Auto-creates notifications when missions complete or achievements unlock
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createNotificationTriggers() {
  try {
    console.log('🔧 Creating notification triggers...\n');

    // Trigger 1: Create notification when mission is completed
    const missionTrigger = `
    CREATE OR REPLACE FUNCTION create_mission_completion_notification()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.completed = true AND OLD.completed = false THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
          NEW.user_id,
          'mission_completed',
          'Mission Completed',
          'You completed a mission and earned rewards!',
          jsonb_build_object(
            'missionId', NEW.mission_id,
            'progressId', NEW.id
          )
        );
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_mission_completion_notification ON user_mission_progress;
    CREATE TRIGGER trigger_mission_completion_notification
    AFTER UPDATE ON user_mission_progress
    FOR EACH ROW
    EXECUTE FUNCTION create_mission_completion_notification();
    `;

    await pool.query(missionTrigger);
    console.log('✅ Mission completion notification trigger created');

    // Trigger 2: Create notification when achievement is unlocked
    const achievementTrigger = `
    CREATE OR REPLACE FUNCTION create_achievement_unlock_notification()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.unlocked_at IS NOT NULL AND OLD.unlocked_at IS NULL THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
          NEW.user_id,
          'achievement_unlocked',
          'Achievement Unlocked',
          'You unlocked a new achievement!',
          jsonb_build_object(
            'achievementId', NEW.achievement_id,
            'progressId', NEW.id
          )
        );
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_achievement_unlock_notification ON user_achievements;
    CREATE TRIGGER trigger_achievement_unlock_notification
    AFTER UPDATE ON user_achievements
    FOR EACH ROW
    EXECUTE FUNCTION create_achievement_unlock_notification();
    `;

    await pool.query(achievementTrigger);
    console.log('✅ Achievement unlock notification trigger created');

    // Trigger 3: Level-up notification
    const levelUpTrigger = `
    CREATE OR REPLACE FUNCTION create_levelup_notification()
    RETURNS TRIGGER AS $$
    DECLARE
      new_level INT;
      old_level INT;
    BEGIN
      new_level := floor(NEW.xp::float / 100) + 1;
      old_level := floor(OLD.xp::float / 100) + 1;

      IF new_level > old_level THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
          NEW.id,
          'level_up',
          'Level Up! 🎉',
          'Congratulations! You reached Level ' || new_level,
          jsonb_build_object(
            'newLevel', new_level,
            'xp', NEW.xp
          )
        );
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_levelup_notification ON users;
    CREATE TRIGGER trigger_levelup_notification
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_levelup_notification();
    `;

    await pool.query(levelUpTrigger);
    console.log('✅ Level-up notification trigger created');

    // Trigger 4: Rank-up notification
    const rankUpTrigger = `
    CREATE OR REPLACE FUNCTION create_rankup_notification()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.rank != OLD.rank OR NEW.rank_tier != OLD.rank_tier THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
          NEW.id,
          'rank_up',
          'Rank Up! 📈',
          'You ranked up to ' || NEW.rank || ' ' || NEW.rank_tier,
          jsonb_build_object(
            'newRank', NEW.rank,
            'newTier', NEW.rank_tier,
            'esr', NEW.esr
          )
        );
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_rankup_notification ON users;
    CREATE TRIGGER trigger_rankup_notification
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_rankup_notification();
    `;

    await pool.query(rankUpTrigger);
    console.log('✅ Rank-up notification trigger created');

    console.log('\n✅ All notification triggers created successfully!\n');

    // Seed sample notifications
    console.log('📢 Seeding sample notifications for admin...\n');

    const seedNotifications = `
    INSERT INTO notifications (user_id, type, title, message, data, created_at)
    SELECT u.id, 'welcome', 'Welcome to Eclip!', 'Start your journey by completing daily missions', jsonb_build_object('version', '1.0'), NOW()
    FROM users u WHERE u.email = 'admin@eclip.pro'
    ON CONFLICT DO NOTHING;

    INSERT INTO notifications (user_id, type, title, message, data, created_at)
    SELECT u.id, 'mission_completed', 'Daily Mission Completed', 'You completed your first daily mission! +100 XP', jsonb_build_object('xp', 100), NOW() - INTERVAL '1 hour'
    FROM users u WHERE u.email = 'admin@eclip.pro'
    ON CONFLICT DO NOTHING;

    INSERT INTO notifications (user_id, type, title, message, data, created_at)
    SELECT u.id, 'achievement_unlocked', 'Achievement Unlocked', 'First Steps - Complete your first mission', jsonb_build_object('badgeId', '1'), NOW() - INTERVAL '30 minutes'
    FROM users u WHERE u.email = 'admin@eclip.pro'
    ON CONFLICT DO NOTHING;

    INSERT INTO notifications (user_id, type, title, message, data, read, created_at)
    SELECT u.id, 'level_up', 'Level Up! 🎉', 'Congratulations! You reached Level 11', jsonb_build_object('level', 11, 'xp', 1050), true, NOW() - INTERVAL '10 minutes'
    FROM users u WHERE u.email = 'admin@eclip.pro'
    ON CONFLICT DO NOTHING;
    `;

    await pool.query(seedNotifications);
    console.log('✅ Sample notifications seeded');

    // Show stats
    const result = await pool.query(`
    SELECT COUNT(*) as total_notifications,
           SUM(CASE WHEN read = false THEN 1 ELSE 0 END) as unread,
           SUM(CASE WHEN read = true THEN 1 ELSE 0 END) as read
    FROM notifications;
    `);

    console.log('\n📊 Notification Statistics:');
    console.log(`   Total: ${result.rows[0].total_notifications}`);
    console.log(`   Unread: ${result.rows[0].unread}`);
    console.log(`   Read: ${result.rows[0].read}\n`);

    console.log('✅ Notification system fully configured!');
  } catch (error) {
    console.error('❌ Error creating notification triggers:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createNotificationTriggers();
