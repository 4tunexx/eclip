-- Clean all sessions from database
-- Run this if you're still experiencing session mixing issues

DELETE FROM sessions;

-- Verify all sessions are deleted
SELECT COUNT(*) as remaining_sessions FROM sessions;

-- Check if any user has multiple sessions (should be 0 rows)
SELECT user_id, COUNT(*) as session_count
FROM sessions
GROUP BY user_id
HAVING COUNT(*) > 1;
