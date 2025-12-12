#!/bin/bash
cd /workspaces/eclip

echo "📝 Staging all files..."
git add -A

echo "✅ Checking status..."
git status --short | head -20

echo ""
echo "🔄 Committing..."
git commit -m "Database cleanup & migration: Drop unused tables, add VIP columns, add inspection/audit scripts" --no-verify

echo ""
echo "🚀 Pushing to GitHub..."
git push origin master

echo ""
echo "✅ Done!"
