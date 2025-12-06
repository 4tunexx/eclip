#!/bin/bash
LOG_FILE="neon-check.txt"
PAGER=cat psql 'postgresql://neondb_owner:npg_JwbY17enhtTU@ep-square-tree-addwk4t7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' << 'EOF' | tee "$LOG_FILE"

-- Check all tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Count data in key tables
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'achievements', COUNT(*) FROM achievements
UNION ALL
SELECT 'missions', COUNT(*) FROM missions
UNION ALL
SELECT 'cosmetics', COUNT(*) FROM cosmetics
UNION ALL
SELECT 'esr_thresholds', COUNT(*) FROM esr_thresholds
UNION ALL
SELECT 'badges', COUNT(*) FROM badges;

EOF
