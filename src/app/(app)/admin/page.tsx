'use client';

import Link from 'next/link';
import { 
  Gamepad2, 
  Trophy, 
  BarChart, 
  Shield,
  Users,
  Gem,
  LayoutGrid,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminIndexPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage all platform content and systems</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Active accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Matches Played</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,678</div>
            <p className="text-xs text-muted-foreground">Total matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cosmetics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">Items available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">100%</div>
            <p className="text-xs text-muted-foreground">All services online</p>
          </CardContent>
        </Card>
      </div>

      {/* Requirement-Based Systems */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Requirement-Based Systems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/missions">
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  Missions
                </CardTitle>
                <CardDescription>Create and manage daily/platform missions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">16 requirement types • Track user progress</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/achievements">
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Achievements
                </CardTitle>
                <CardDescription>Define achievement unlock conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">16 requirement types • Unlock rewards</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/badges">
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  Badges
                </CardTitle>
                <CardDescription>Manage cosmetic badges and rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">6 requirement types • 4 rarities</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/esr-tiers">
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5" />
                  ESR Tiers
                </CardTitle>
                <CardDescription>Configure ESR tier thresholds</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">15 tiers • 5 ranks × 3 divisions</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Core Management */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Core Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/users">
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Users
                </CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">View all users • Edit roles • Ban/unban</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/matches">
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  Matches
                </CardTitle>
                <CardDescription>Track and manage match records</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">View matches • Manage results • Stats</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/cosmetics">
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gem className="w-5 h-5" />
                  Cosmetics
                </CardTitle>
                <CardDescription>Create and manage cosmetic items</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Frames • Banners • Badges • Titles</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/anti-cheat">
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Anti-Cheat
                </CardTitle>
                <CardDescription>Monitor and manage AC system</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Review logs • Manage suspicions • Ban users</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Settings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Configuration</h2>
        <Link href="/admin/config">
          <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Site Configuration
              </CardTitle>
              <CardDescription>Manage global platform settings and appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Logo • Banner • Maintenance • Economy settings</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* System Info */}
      <Card className="border-l-4 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Database</p>
            <p className="text-xl font-bold text-green-500">✓ Connected</p>
            <p className="text-xs text-muted-foreground">Neon PostgreSQL</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Tables</p>
            <p className="text-xl font-bold">26/26</p>
            <p className="text-xs text-muted-foreground">All tables present</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Migrations</p>
            <p className="text-xl font-bold text-green-500">✓ Latest</p>
            <p className="text-xs text-muted-foreground">All migrations applied</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
