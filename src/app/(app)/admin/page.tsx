'use client';

import Link from 'next/link';

export default function AdminIndexPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">🎮 Admin Panel</h1>
        <p className="text-gray-400">Manage all platform content with standardized requirement types</p>
      </div>

      {/* Requirement-Based Systems */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">⚙️ Requirement-Based Systems</h2>
        <p className="text-gray-400 mb-4">
          These systems use standardized <strong>Requirement Types</strong> for admins to choose from
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/missions">
            <div className="bg-gray-800 hover:bg-gray-700 border border-green-700 p-4 rounded cursor-pointer transition">
              <h3 className="font-semibold text-green-400">🎮 Missions</h3>
              <p className="text-sm text-gray-400 mt-1">Create daily/platform/ingame missions</p>
              <div className="text-xs text-green-300 mt-2">
                16 requirement types available
              </div>
            </div>
          </Link>

          <Link href="/admin/achievements">
            <div className="bg-gray-800 hover:bg-gray-700 border border-yellow-700 p-4 rounded cursor-pointer transition">
              <h3 className="font-semibold text-yellow-400">🏆 Achievements</h3>
              <p className="text-sm text-gray-400 mt-1">Define achievement unlock conditions</p>
              <div className="text-xs text-yellow-300 mt-2">
                16 requirement types available
              </div>
            </div>
          </Link>

          <Link href="/admin/badges">
            <div className="bg-gray-800 hover:bg-gray-700 border border-orange-700 p-4 rounded cursor-pointer transition">
              <h3 className="font-semibold text-orange-400">🏅 Badges</h3>
              <p className="text-sm text-gray-400 mt-1">Manage cosmetic badges and rewards</p>
              <div className="text-xs text-orange-300 mt-2">
                6 requirement types available
              </div>
            </div>
          </Link>

          <Link href="/admin/esr-tiers">
            <div className="bg-gray-800 hover:bg-gray-700 border border-cyan-700 p-4 rounded cursor-pointer transition">
              <h3 className="font-semibold text-cyan-400">📊 ESR Ranks & Tiers</h3>
              <p className="text-sm text-gray-400 mt-1">Configure ESR tier thresholds</p>
              <div className="text-xs text-cyan-300 mt-2">
                15 tiers (5 ranks × 3 divisions)
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Core Management */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">📋 Core Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/users">
            <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-4 rounded cursor-pointer transition">
              <h3 className="font-semibold text-blue-400">👥 Users</h3>
              <p className="text-sm text-gray-400 mt-1">Manage user accounts and permissions</p>
            </div>
          </Link>

          <Link href="/admin/matches">
            <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-4 rounded cursor-pointer transition">
              <h3 className="font-semibold text-green-400">🎯 Matches</h3>
              <p className="text-sm text-gray-400 mt-1">Track and manage match records</p>
            </div>
          </Link>

          <Link href="/admin/cosmetics">
            <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-4 rounded cursor-pointer transition">
              <h3 className="font-semibold text-purple-400">✨ Cosmetics</h3>
              <p className="text-sm text-gray-400 mt-1">Create and manage cosmetic items</p>
            </div>
          </Link>

          <Link href="/admin/anti-cheat">
            <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-4 rounded cursor-pointer transition">
              <h3 className="font-semibold text-red-400">🛡️ Anti-Cheat</h3>
              <p className="text-sm text-gray-400 mt-1">Monitor and manage anti-cheat system</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Requirement Types Guide */}
      <div className="bg-blue-900 border border-blue-700 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">📚 Requirement Types Reference</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-green-300 mb-2">🎮 Mission Requirement Types (16)</h3>
            <div className="bg-gray-800 p-3 rounded text-sm space-y-1 text-gray-300">
              <div className="grid grid-cols-2 gap-2">
                <span>• KILLS</span>
                <span>• ASSISTS</span>
                <span>• HEADSHOTS</span>
                <span>• WINS</span>
                <span>• MATCHES_PLAYED</span>
                <span>• BOMB_PLANTS</span>
                <span>• BOMB_DEFUSES</span>
                <span>• CLUTCHES_WON</span>
                <span>• MVP_EARNED</span>
                <span>• CONSECUTIVE_WINS</span>
                <span>• OBJECTIVE_ROUNDS</span>
                <span>• DAMAGE_DEALT</span>
                <span>• MONEY_EARNED</span>
                <span>• ROUNDS_PLAYED</span>
                <span>• TIMESPAN_DAYS</span>
                <span>• DEATHS</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-yellow-300 mb-2">🏆 Achievement Requirement Types (16)</h3>
            <div className="bg-gray-800 p-3 rounded text-sm space-y-1 text-gray-300">
              <div className="grid grid-cols-2 gap-2">
                <span>• LEVEL_REACH</span>
                <span>• ESR_REACH</span>
                <span>• KILL_MILESTONE</span>
                <span>• WIN_STREAK</span>
                <span>• MATCH_COUNT</span>
                <span>• MVP_COUNT</span>
                <span>• HEADSHOT_PERCENTAGE</span>
                <span>• CLUTCH_SUCCESS</span>
                <span>• DAMAGE_MILESTONE</span>
                <span>• PLAYTIME_HOURS</span>
                <span>• SOCIAL_FRIENDS</span>
                <span>• FORUM_POSTS</span>
                <span>• ACHIEVEMENT_COLLECTOR</span>
                <span>• BADGE_COLLECTOR</span>
                <span>• COMMUNITY_CONTRIBUTOR</span>
                <span>• TOURNAMENT_PLACED</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-orange-300 mb-2">🏅 Badge Requirement Types (6)</h3>
            <div className="bg-gray-800 p-3 rounded text-sm space-y-1 text-gray-300">
              <div className="grid grid-cols-1 gap-2">
                <span>• ACHIEVEMENT_UNLOCK</span>
                <span>• BATTLE_PASS_TIER</span>
                <span>• PURCHASE_COSMETIC</span>
                <span>• SEASONAL_RANK</span>
                <span>• TOURNAMENT_VICTORY</span>
                <span>• REFERRAL_COUNT</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-cyan-300 mb-2">📊 ESR Tier Structure (15 Total)</h3>
            <div className="bg-gray-800 p-3 rounded text-sm space-y-1 text-gray-300">
              <div className="space-y-1">
                <span><strong>Beginner:</strong> 0-900 ESR (3 divisions)</span>
                <span><strong>Rookie:</strong> 900-1300 ESR (3 divisions)</span>
                <span><strong>Pro:</strong> 1300-1900 ESR (3 divisions)</span>
                <span><strong>Ace:</strong> 1900-2200 ESR (3 divisions)</span>
                <span><strong>Legend:</strong> 2200+ ESR (3 divisions)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Info */}
      <div className="bg-purple-900 border border-purple-700 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">ℹ️ Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-purple-300 mb-2">🎮 Roles</h3>
            <ul className="text-gray-300 space-y-1">
              <li>✓ ADMIN</li>
              <li>✓ MODERATOR</li>
              <li>✓ VIP</li>
              <li>✓ INSIDER</li>
              <li>✓ USER</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-purple-300 mb-2">📊 Rating System</h3>
            <ul className="text-gray-300 space-y-1">
              <li>✓ ESR Rating</li>
              <li>✓ +25 per win</li>
              <li>✓ -15 per loss</li>
              <li>✓ 15 tiers total</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-purple-300 mb-2">✅ System Status</h3>
            <ul className="text-gray-300 space-y-1">
              <li>✓ 26/26 tables</li>
              <li>✓ 500+ records</li>
              <li>✓ Migrations OK</li>
              <li>✓ Production ready</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
