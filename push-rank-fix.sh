#!/bin/bash
# Commit and push leaderboard rank fixes

cd /workspaces/eclip

echo "🔄 Committing leaderboard rank fixes..."
git add -A

git commit -m "fix: correct rank display on landing page and leaderboards

- Fixed hardcoded 'Bronze' rank default that doesn't exist in system
- Implement proper rank calculation using getRankFromESR() function
- Correctly calculate divisions (I, II, III) based on ESR thresholds
- Updated /api/leaderboards/public to use dynamic rank calculation
- Updated /api/leaderboards/route.ts to use dynamic rank calculation

Now displays correct ranks:
- Beginner (0-500 ESR)
- Rookie (500-1000 ESR)
- Pro (1000-2000 ESR)
- Ace (2000-3500 ESR)
- Legend (3500+ ESR)

Each tier has 3 divisions (I, II, III) calculated from ESR ranges"

echo ""
echo "🚀 Pushing to remote..."
git push origin master

echo ""
echo "✅ COMMITTED AND PUSHED!"
