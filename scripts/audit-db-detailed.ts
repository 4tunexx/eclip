// @ts-nocheck
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { users, sessions, matches, forumThreads, missions } from '@/lib/db/schema';
import { count, eq } from 'drizzle-orm';

async function performDatabaseAudit() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║           🔍 COMPREHENSIVE DATABASE AUDIT 🔍            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // 1. USER DATA AUDIT
    console.log('👥 1. USERS TABLE ANALYSIS');
    console.log('━'.repeat(60));
    
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      steamId: users.steamId,
      level: users.level,
      esr: users.esr,
      coins: users.coins,
      createdAt: users.createdAt,
    }).from(users);

    console.log(`✅ Total Users: ${allUsers.length}`);

    const adminUsers = allUsers.filter(u => u.role === 'ADMIN');
    console.log(`🔐 Admin Users: ${adminUsers.length}`);
    if (adminUsers.length === 0) {
      console.log(`   ❌ WARNING: NO ADMIN USERS! Create one immediately!`);
    } else {
      adminUsers.forEach(admin => {
        console.log(`   • ${admin.username} (${admin.email})`);
      });
    }

    const emailVerified = allUsers.filter(u => u.emailVerified).length;
    console.log(`📧 Email Verified: ${emailVerified}/${allUsers.length}`);

    const steamConnected = allUsers.filter(u => u.steamId && !u.steamId.startsWith('temp-')).length;
    console.log(`🎮 Steam Connected: ${steamConnected}/${allUsers.length}`);

    // 2. DATA QUALITY ISSUES
    console.log('\n⚠️  2. DATA QUALITY CHECKS');
    console.log('━'.repeat(60));

    const noEmail = allUsers.filter(u => !u.email).length;
    if (noEmail > 0) console.log(`❌ Users with no email: ${noEmail}`);

    const noUsername = allUsers.filter(u => !u.username).length;
    if (noUsername > 0) console.log(`❌ Users with no username: ${noUsername}`);

    const invalidRoles = allUsers.filter(u => !['USER', 'VIP', 'INSIDER', 'MODERATOR', 'ADMIN'].includes(u.role || '')).length;
    if (invalidRoles > 0) console.log(`❌ Users with invalid roles: ${invalidRoles}`);

    const tempSteamIds = allUsers.filter(u => u.steamId && (u.steamId.startsWith('temp-') || u.steamId === '')).length;
    if (tempSteamIds > 0) console.log(`⚠️  Users with placeholder Steam IDs: ${tempSteamIds}`);

    if (noEmail === 0 && noUsername === 0 && invalidRoles === 0 && tempSteamIds === 0) {
      console.log(`✅ All users have valid data`);
    }

    // 3. USER STATS DISTRIBUTION
    console.log('\n📊 3. USER STATISTICS DISTRIBUTION');
    console.log('━'.repeat(60));

    const levelDistribution = new Map<number, number>();
    allUsers.forEach((u: any) => {
      const level = (u.level as number) || 1;
      levelDistribution.set(level, ((levelDistribution.get(level) || 0) as number) + 1);
    });
    console.log('Level Distribution:');
    Array.from(levelDistribution.entries())
      .sort((a, b) => (a[0] as number) - (b[0] as number))
      .slice(0, 10)
      .forEach(([level, count]) => {
        console.log(`  Level ${level}: ${count} users`);
      });

    const avgEsr = (allUsers.reduce((sum, u) => sum + (u.esr || 1000), 0) / allUsers.length).toFixed(0);
    console.log(`Average ESR: ${avgEsr}`);

    const totalCoins = allUsers.reduce((sum, u: any) => sum + (parseFloat((u.coins as string) ?? '0') || 0), 0);
    console.log(`Total Coins in Circulation: ${totalCoins.toFixed(2)}`);

    // 4. ROLE DISTRIBUTION
    console.log('\n👔 4. ROLE DISTRIBUTION');
    console.log('━'.repeat(60));
    const roleDistribution = new Map<string, number>();
    allUsers.forEach((u: any) => {
      const role = (u.role as string) || 'USER';
      roleDistribution.set(role, ((roleDistribution.get(role) || 0) as number) + 1);
    });
    Array.from(roleDistribution.entries()).forEach(([role, count]) => {
      console.log(`  ${role}: ${count}`);
    });

    // 5. SESSIONS STATUS
    console.log('\n🔑 5. SESSIONS ANALYSIS');
    console.log('━'.repeat(60));
    const sessionCount = await db.select({ value: count() }).from(sessions);
    console.log(`Total Sessions in Database: ${sessionCount[0].value}`);

    // 6. MATCHES DATA
    console.log('\n🎮 6. MATCHES & GAME DATA');
    console.log('━'.repeat(60));
    const matchCount = await db.select({ value: count() }).from(matches);
    console.log(`Total Matches: ${matchCount[0].value}`);

    // 7. FORUM DATA
    console.log('\n📝 7. FORUM CONTENT');
    console.log('━'.repeat(60));
    try {
      const forumCount = await db.select({ value: count() }).from(forumThreads);
      console.log(`Forum Threads: ${forumCount[0].value}`);
    } catch (e) {
      console.log(`⚠️  Forum threads table not accessible`);
    }

    // 8. MISSIONS
    console.log('\n📌 8. MISSIONS SYSTEM');
    console.log('━'.repeat(60));
    try {
      const missionCount = await db.select({ value: count() }).from(missions);
      console.log(`Total Missions: ${missionCount[0].value}`);
    } catch (e) {
      console.log(`⚠️  Missions table not accessible`);
    }

    // 9. RECENT ACTIVITY
    console.log('\n📅 9. RECENT USER ACTIVITY (Last 5 Registrations)');
    console.log('━'.repeat(60));
    const recentSorted = [...allUsers].sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt as string | Date).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt as string | Date).getTime() : 0;
      return dateB - dateA;
    }).slice(0, 5);
    recentSorted.forEach((user: any, idx: number) => {
      const verified = user.emailVerified ? '✅' : '❌';
      const dateStr = user.createdAt ? new Date(user.createdAt as string | Date).toLocaleDateString() : 'Unknown';
      console.log(`  ${idx + 1}. ${user.username} - ${verified} - ${dateStr}`);
    });

    // 10. RECOMMENDATIONS
    console.log('\n💡 10. RECOMMENDATIONS');
    console.log('━'.repeat(60));

    const recommendations: string[] = [];

    if (adminUsers.length === 0) {
      recommendations.push(`❌ CRITICAL: Create an admin user immediately`);
    }

    if (noEmail > 0) {
      recommendations.push(`⚠️  ${noEmail} users have no email address`);
    }

    if (tempSteamIds > 0) {
      recommendations.push(`⚠️  ${tempSteamIds} users have placeholder Steam IDs`);
    }

    if (matchCount[0].value === 0) {
      recommendations.push(`📌 No matches created yet - test match system`);
    }

    if (emailVerified === 0 && allUsers.length > 0) {
      recommendations.push(`📧 No email-verified users - test email verification`);
    }

    if (recommendations.length === 0) {
      console.log(`✅ No critical issues found!`);
    } else {
      recommendations.forEach(rec => console.log(`  ${rec}`));
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ AUDIT COMPLETE\n');

  } catch (error) {
    console.error('\n❌ Audit Error:', error);
  }
}

performDatabaseAudit().catch(console.error);
