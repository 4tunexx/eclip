#!/bin/bash

# Emergency session cleanup script
# Use this if users are still seeing other users' data

echo "🧹 Cleaning all sessions from database..."

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
elif [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Clean all sessions using tsx
npx tsx -e "
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

(async () => {
  try {
    console.log('Deleting all sessions...');
    await sql\`DELETE FROM sessions\`;
    
    const result = await sql\`SELECT COUNT(*) as count FROM sessions\`;
    console.log('✅ All sessions deleted. Remaining sessions:', result[0].count);
    
    if (result[0].count === '0' || result[0].count === 0) {
      console.log('✅ Success! No sessions remaining in database.');
      console.log('👉 Users will need to login again.');
    } else {
      console.log('⚠️  Warning: Some sessions may still exist.');
    }
  } catch (error: any) {
    console.error('❌ Error cleaning sessions:', error.message);
    process.exit(1);
  }
})();
" 2>&1

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Session cleanup complete!"
  echo "👉 All users will need to login again."
  echo "👉 This ensures no session mixing bugs."
else
  echo ""
  echo "❌ Session cleanup failed. Check error above."
  exit 1
fi
