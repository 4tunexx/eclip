#!/bin/bash

# Comprehensive commit script for all changes

set -e

cd "$(dirname "$0")"

echo "📝 Staging all changes..."
git add -A

echo "📊 Checking staged files..."
git status

echo ""
echo "✅ Committing changes..."
git commit -m "feat: fix database schema alignment, session management, and mobile responsiveness

Major fixes applied:
- Fixed database schema mismatch (missions table columns)
- Fixed daily login endpoint column references (objectiveType, objectiveValue)
- Fixed session mixing bug with automatic cleanup
- Fixed email verification session cleanup
- Fixed Steam avatar sync and session management
- Made admin/profile/settings tabs mobile responsive
- Added daily login tracking API
- Added DAILY_LOGIN mission requirement type
- Improved error handling and logging

Files modified: 15+
New files: 10+
Documentation: 9 files

Ready for production deployment." 2>&1

echo ""
echo "🚀 Pushing to remote..."
git push origin master

echo ""
echo "✅ All changes committed and pushed!"
echo ""
echo "📊 Git log (last commit):"
git log -1 --oneline
