'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/icons/logo';
import { Users, Gamepad2, Trophy, Loader2 } from 'lucide-react';
import { UserAvatar } from '@/components/user-avatar';
import Particles from '@/components/particles';
import { HeroBanner } from '@/components/layout/hero-banner';
import { CountingNumber } from '@/components/counting-number';
import { CollapsibleHeader } from '@/components/layout/collapsible-header';
import { useUser } from '@/hooks/use-user';


export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [stats, setStats] = useState<any>(null);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Redirect authenticated users to dashboard (only once)
  useEffect(() => {
    if (!isLoading && user) {
      // Check if user just logged out (within last 2 seconds)
      const logoutTime = localStorage.getItem('logout_timestamp');
      if (logoutTime) {
        const timeSinceLogout = Date.now() - parseInt(logoutTime);
        if (timeSinceLogout < 2000) {
          // User just logged out, don't redirect
          console.log('[LandingPage] Ignoring redirect - user just logged out');
          return;
        }
        // Clear old logout timestamp
        localStorage.removeItem('logout_timestamp');
      }
      
      // Use replace to avoid back button issues
      window.location.replace('/dashboard');
    }
  }, [user, isLoading]);

  // Fetch real stats and top players
  useEffect(() => {
    const fetchData = async () => {
      try {
        setStatsLoading(true);
        const [statsRes, playersRes] = await Promise.all([
          fetch('/api/stats/public'),
          fetch('/api/leaderboards/public?limit=5'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (playersRes.ok) {
          const playersData = await playersRes.json();
          setTopPlayers(playersData.players || []);
        }
      } catch (error) {
        console.error('Failed to fetch landing page data:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show nothing while checking auth or redirecting
  if (isLoading || user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-transparent font-body custom-crosshair">
      <Particles />
      <CollapsibleHeader />

      {/* Main Content */}
      <main className="flex-grow z-10 relative">
        {/* Hero Section */}
        <HeroBanner />

        {/* Stats Section */}
        <section className="container mx-auto -mt-16 px-4 relative z-20">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="bg-card/60 backdrop-blur-lg border border-white/10 glow-card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium tracking-tight text-primary">Online Players</h3>
                        <Users className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                           {statsLoading ? (
                             <Loader2 className="h-6 w-6 animate-spin" />
                           ) : (
                             <CountingNumber targetValue={stats?.onlinePlayers || 0} />
                           )}
                        </div>
                        <p className="text-xs text-muted-foreground">Currently in queue or in-game</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/60 backdrop-blur-lg border border-white/10 glow-card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium tracking-tight text-primary">Active Matches</h3>
                        <Gamepad2 className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                           {statsLoading ? (
                             <Loader2 className="h-6 w-6 animate-spin" />
                           ) : (
                             <CountingNumber targetValue={stats?.activeMatches || 0} />
                           )}
                        </div>
                        <p className="text-xs text-muted-foreground">5v5 competitive matches live now</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/60 backdrop-blur-lg border border-white/10 glow-card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium tracking-tight text-primary">Total Coins Earned</h3>
                        <Trophy className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                           {statsLoading ? (
                             <Loader2 className="h-6 w-6 animate-spin" />
                           ) : (
                             <CountingNumber targetValue={stats?.totalCoins || 0} />
                           )}
                        </div>
                        <p className="text-xs text-muted-foreground">Awarded to players for skill and dedication</p>
                    </CardContent>
                </Card>
            </div>
        </section>


        {/* Top Players Section */}
        <section className="container mx-auto px-4 py-16 sm:py-24">
          <h2 className="mb-8 text-center font-headline text-3xl font-bold tracking-tighter md:text-4xl">
            Top Players on the Rise
          </h2>
          {statsLoading || topPlayers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              {statsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <p className="text-muted-foreground">No players yet. Be the first!</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {topPlayers.map((player) => (
                <Card key={player.id} className="overflow-hidden bg-card/60 backdrop-blur-lg border border-white/10 text-center glow-card-hover">
                  <CardContent className="p-6 flex flex-col items-center">
                      <UserAvatar
                        avatarUrl={player.avatarUrl}
                        username={player.username}
                        className="h-20 w-20 mb-4"
                      />
                      <h3 className="font-bold truncate w-full">{player.username}</h3>
                      <div className="text-sm text-muted-foreground mt-2">
                        ESR: <span className="font-semibold text-primary">{player.esr}</span>
                      </div>
                      <Badge variant="outline" className="mt-2 border-primary text-primary">
                        {player.rank} {player.rankTier}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">Level {player.level}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 z-10 relative">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
            <div className="flex flex-col items-center gap-2 md:items-start">
                <Logo />
                <p className="text-sm text-muted-foreground">
                    © 2025 Eclip.pro. All rights reserved.
                </p>
            </div>
            <div className="flex gap-6 text-sm">
                <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    Terms of Service
                </Link>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    Privacy Policy
                </Link>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    Contact
                </Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
