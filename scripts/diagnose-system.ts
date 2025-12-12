import { db } from '@/lib/db';
import { users, sessions, matches, forumThreads, missions } from '@/lib/db/schema';
import { count } from 'drizzle-orm';

async function diagnoseSystem() {
  console.log('🔍 SYSTEM DIAGNOSTIC REPORT\n');
  console.log('=' .repeat(50));
  
  try {
    // Test database connection
    console.log('\n🔗 Database Connection Status:');
    const userCount = await db.select({ value: count() }).from(users);
    console.log('✅ Connected to Neon Database');
    
    // User Statistics
    console.log('\n👥 User Statistics:');
    const totalUsers = await db.select({ value: count() }).from(users);
    console.log(`   Total Users: ${totalUsers[0]?.value || 0}`);
    
    // Get all users with their roles
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      steamId: users.steamId,
    }).from(users);
    
    console.log(`\n📋 Registered Users (${allUsers.length}):`);
    allUsers.slice(0, 10).forEach((user, idx) => {
      const steamStatus = user.steamId ? '✅ Steam' : '❌ No Steam';
      const emailStatus = user.emailVerified ? '✅ Verified' : '❌ Not Verified';
      const roleLabel = (user.role || 'USER').toUpperCase();
      console.log(`   ${idx + 1}. ${user.username} | ${roleLabel} | ${emailStatus} | ${steamStatus}`);
    });
    
    // Session Statistics
    console.log('\n🔑 Session Management:');
    const sessionCounts = await db.select({ value: count() }).from(sessions);
    console.log(`   Active Sessions: ${sessionCounts[0]?.value || 0}`);
    
    // Match Statistics
    console.log('\n🎮 Game Statistics:');
    const matchCount = await db.select({ value: count() }).from(matches);
    console.log(`   Total Matches: ${matchCount[0]?.value || 0}`);
    
    // Forum Statistics
    console.log('\n📝 Forum Statistics:');
    const threadCount = await db.select({ value: count() }).from(forumThreads);
    console.log(`   Forum Threads: ${threadCount[0]?.value || 0}`);
    
    // Mission Statistics
    console.log('\n📌 Mission Statistics:');
    const missionCount = await db.select({ value: count() }).from(missions);
    console.log(`   Total Missions: ${missionCount[0]?.value || 0}`);
    
    // Check for authentication issues
    console.log('\n🔐 Authentication Health Check:');
    const adminUsers = allUsers.filter(u => u.role === 'ADMIN');
    console.log(`   Admin Users: ${adminUsers.length}`);
    if (adminUsers.length > 0) {
      console.log(`   Admin Usernames: ${adminUsers.map(u => u.username).join(', ')}`);
    }
    
    const unverifiedUsers = allUsers.filter(u => !u.emailVerified);
    console.log(`   Unverified Email Accounts: ${unverifiedUsers.length}`);
    
    const steamConnectedUsers = allUsers.filter(u => u.steamId);
    console.log(`   Steam Connected Accounts: ${steamConnectedUsers.length}`);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ System diagnostics complete!\n');
    
  } catch (error) {
    console.error('\n❌ Diagnostic Error:', error);
    process.exit(1);
  }
}

diagnoseSystem();
