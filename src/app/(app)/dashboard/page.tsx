'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Swords, 
  Star, 
  Trophy, 
  Gamepad2, 
  Crosshair, 
  TrendingUp,
  CircleDollarSign,
  Bomb,
  ShieldCheck,
  Loader2,
  Zap,
  MessageSquare,
  Target
} from 'lucide-react';
import Image from "next/image";
import { UserAvatar } from "@/components/user-avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { LiveChat } from "@/components/chat/live-chat";
import { useUser } from '@/hooks/use-user';

export default function DashboardPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [missions, setMissions] = useState<any[]>([]);
  const [dailyMissions, setDailyMissions] = useState<any[]>([]);
  const [isLoadingMissions, setIsLoadingMissions] = useState(true);
  const [forumThreads, setForumThreads] = useState<any[]>([]);
  const [isLoadingForum, setIsLoadingForum] = useState(true);
  const { user, isLoading: userLoading } = useUser();
  
  // Refs to avoid duplicate fetches
  const matchesFetchedRef = useRef(false);
  const missionsFetchedRef = useRef(false);
  const forumFetchedRef = useRef(false);

  useEffect(() => {
    if (user && !matchesFetchedRef.current) {
      matchesFetchedRef.current = true;
      fetchMatches();
    }
  }, [user]);

  useEffect(() => {
    if (user && !missionsFetchedRef.current) {
      missionsFetchedRef.current = true;
      fetchMissions();
      // Poll for mission updates every 30 seconds
      const missionInterval = setInterval(fetchMissions, 30000);
      return () => clearInterval(missionInterval);
    }
  }, [user]);

  useEffect(() => {
    if (user && !forumFetchedRef.current) {
      forumFetchedRef.current = true;
      fetchForumThreads();
      // Poll for forum updates every 10 seconds for live updates
      const forumInterval = setInterval(fetchForumThreads, 10000);
      return () => clearInterval(forumInterval);
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches?limit=5');
      const data = await response.json();
      if (response.ok) {
        setMatches(data.matches || []);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const fetchMissions = async () => {
    try {
      const [allRes, dailyRes] = await Promise.all([
        fetch('/api/missions'),
        fetch('/api/missions?daily=true'),
      ]);
      
      if (allRes.ok && dailyRes.ok) {
        const allData = await allRes.json();
        const dailyData = await dailyRes.json();
        setMissions(allData || []);
        setDailyMissions(dailyData || []);
      }
    } catch (error) {
      console.error('Error fetching missions:', error);
    } finally {
      setIsLoadingMissions(false);
    }
  };

  const fetchForumThreads = async () => {
    try {
      const response = await fetch('/api/forum/threads');
      const data = await response.json();
      if (response.ok) {
        const threads = Array.isArray(data) ? data : data.threads || [];
        setForumThreads(threads.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching forum threads:', error);
    } finally {
      setIsLoadingForum(false);
    }
  };

  if (userLoading || !user) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Parse equipped banner
  const parseEquippedBanner = () => {
    if (!user.equippedBanner) return null;
    try {
      return JSON.parse(user.equippedBanner);
    } catch {
      return null;
    }
  };

  const equippedBanner = parseEquippedBanner();
  const bannerBackground = equippedBanner?.metadata?.gradient || 'rgb(34, 197, 94)';

  const stats = [
    { name: "Matches Played", value: matches.length.toString(), icon: Gamepad2 },
    { name: "K/D", value: "1.23", icon: Crosshair },
    { name: "Win Rate", value: "68%", icon: TrendingUp, color: "text-green-300" },
    { name: "Coins", value: user.coins?.toFixed(2) || "0.00", icon: CircleDollarSign, color: "text-yellow-400" },
  ];

  const lastMatch = matches[0];
  const lastMatchPlayerStats = lastMatch?.players?.find((p: any) => p.id === user.id) || lastMatch?.players?.[0];

  const lastMatchStats = lastMatchPlayerStats ? [
    { name: "K-D-A", value: `${lastMatchPlayerStats.kills || 0}-${lastMatchPlayerStats.deaths || 0}-${lastMatchPlayerStats.assists || 0}`, icon: Crosshair },
    { name: "ADR", value: (lastMatchPlayerStats.adr || 0).toFixed(1), icon: Bomb },
    { name: "HS%", value: `${lastMatchPlayerStats.hsPercentage || 0}%`, icon: HeadshotsIcon },
    { name: "MVPs", value: (lastMatchPlayerStats.mvps || 0).toString(), icon: Star, color: "text-yellow-400" },
  ] : [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DAILY': return <Zap className="w-4 h-4" />;
      case 'PLATFORM': return <Target className="w-4 h-4" />;
      case 'INGAME': return <Trophy className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="relative mb-8 pt-20">
        {/* Banner background */}
        <div 
          className="absolute top-0 left-0 right-0 rounded-xl overflow-hidden p-8 h-56 flex items-start justify-between"
          style={{
            background: bannerBackground,
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/30" />
          
          <div className="flex-1 relative z-10">
            <h1 className="font-headline text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
              Welcome back, {user.username}
            </h1>
            <p className="text-white/90 mt-2 text-base md:text-lg drop-shadow">
              Ready to dominate? Your next match awaits.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 relative z-10">
            <Button size="lg" variant="secondary" className="font-bold" asChild>
              <Link href="/play">
                Find Match
                <Swords className="ml-2 h-5 w-5"/>
              </Link>
            </Button>
          </div>
        </div>
        
        <Card className="relative p-4 bg-card/80 backdrop-blur-lg border border-white/10 mt-32">
          <div className="grid md:grid-cols-[auto_1fr] items-start gap-6">
            <div className="relative w-32 h-16">
              <UserAvatar 
                avatarUrl={user.avatarUrl || ''}
                username={user.username}
                className="w-32 h-32 rounded-full border-4 border-background absolute -top-16"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-secondary/60 border border-border rounded-lg p-4 text-center flex flex-col justify-center items-center">
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <stat.icon className={`h-5 w-5 ${stat.color ? stat.color : 'text-primary'}`} />
                    <p className={`text-xl font-bold ${stat.color ? stat.color : ''}`}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Daily Missions */}
          {!isLoadingMissions && dailyMissions.length > 0 && (
            <div>
              <h2 className="font-headline text-2xl font-semibold mb-4 flex items-center gap-2"><Zap /> Daily Missions</h2>
              <Card className="bg-card/60 backdrop-blur-lg border border-white/10 p-4 space-y-3">
                {dailyMissions.slice(0, 5).map((mission) => {
                  const current = mission.userProgress?.progress || 0;
                  const objective = mission.objectiveValue || 1;
                  const progressPercent = Math.min((current / objective) * 100, 100);
                  return (
                    <div key={mission.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{mission.title}</p>
                          <p className="text-xs text-muted-foreground">{mission.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-bold text-primary">{current}/{objective}</p>
                          <p className="text-xs text-yellow-400">+{mission.rewardXp} XP</p>
                        </div>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  );
                })}
              </Card>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/missions">View All Missions</Link>
              </Button>
            </div>
          )}

          {/* Main Missions Progress */}
          {!isLoadingMissions && missions.length > 0 && (
            <div>
              <h2 className="font-headline text-2xl font-semibold mb-4 flex items-center gap-2"><Trophy /> Main Missions Progress</h2>
              <Card className="bg-card/60 backdrop-blur-lg border border-white/10 p-4">
                {missions.filter(m => !m.isDaily).slice(0, 1).map((mission) => {
                  const current = mission.userProgress?.progress || 0;
                  const objective = mission.objectiveValue || 1;
                  const progressPercent = Math.min((current / objective) * 100, 100);
                  const totalMainMissions = missions.filter(m => !m.isDaily).length;
                  const completedMainMissions = missions.filter(m => !m.isDaily && m.userProgress?.completed).length;
                  
                  return (
                    <div key={mission.id} className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{mission.title}</p>
                          <p className="text-sm text-muted-foreground">{mission.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{completedMainMissions}/{totalMainMissions}</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Current Mission Progress</span>
                          <span className="font-bold">{current}/{objective}</span>
                        </div>
                        <Progress value={progressPercent} className="h-3" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-secondary/60 border border-border rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Reward XP</p>
                          <p className="text-lg font-bold text-yellow-400">+{mission.rewardXp}</p>
                        </div>
                        <div className="bg-secondary/60 border border-border rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Reward Coins</p>
                          <p className="text-lg font-bold text-green-400">+{mission.rewardCoins}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>
          )}

          {/* Recent Matches */}
          <div>
            <h2 className="font-headline text-2xl font-semibold mb-4">Recent Matches</h2>
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
              {isLoadingMatches ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Map</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>K/D/A</TableHead>
                      <TableHead>MVPs</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No matches yet. Start playing to see your match history!
                        </TableCell>
                      </TableRow>
                    ) : (
                      matches.map((match) => {
                        const playerStats = match.players?.find((p: any) => p.id === user.id) || match.players?.[0];
                        return (
                          <TableRow key={match.id}>
                            <TableCell className="font-medium">{match.map || 'Unknown'}</TableCell>
                            <TableCell>{match.score || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={match.result === 'Win' ? 'default' : 'destructive'} className={match.result === 'Win' ? `bg-primary/80 text-primary-foreground` : `bg-red-500/80`}>
                                {match.result}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {playerStats ? `${playerStats.kills || 0}/${playerStats.deaths || 0}/${playerStats.assists || 0}` : 'N/A'}
                            </TableCell>
                            <TableCell className="flex items-center">
                              {playerStats?.mvps || 0} <Star className="ml-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {match.date ? new Date(match.date).toLocaleDateString() : 'N/A'}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>

          {/* Last Match Breakdown */}
          {lastMatch && lastMatchStats.length > 0 && (
            <div>
              <h2 className="font-headline text-2xl font-semibold mb-4 flex items-center gap-2"><ShieldCheck /> Last Match Breakdown</h2>
              <Card className="bg-card/60 backdrop-blur-lg border border-white/10 overflow-hidden">
                {lastMatch.mapImageUrl && (
                  <div className="relative h-24">
                    <Image src={lastMatch.mapImageUrl} alt={lastMatch.map} fill style={{objectFit: "cover"}} className="opacity-40" sizes="100vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                      <h3 className="text-xl font-bold">{lastMatch.map}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{lastMatch.score}</span>
                        <Badge variant={lastMatch.result === 'Win' ? 'default' : 'destructive'} className={lastMatch.result === 'Win' ? `bg-primary/80 text-primary-foreground` : `bg-red-500/80`}>
                          {lastMatch.result}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
                <CardContent className="p-4 grid grid-cols-2 gap-4">
                  {lastMatchStats.map((stat) => (
                    <div key={stat.name} className="bg-secondary/60 border border-border rounded-lg p-3 text-center flex flex-col justify-center items-center">
                      <h3 className="text-xs font-medium text-muted-foreground">{stat.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <stat.icon className={`h-4 w-4 ${stat.color ? stat.color : 'text-primary'}`} />
                        <p className={`text-lg font-bold ${stat.color ? stat.color : ''}`}>{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-8">
          {/* Live Forum */}
          <div>
            <h2 className="font-headline text-2xl font-semibold mb-4 flex items-center gap-2"><MessageSquare /> Live Forum</h2>
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
              {isLoadingForum ? (
                <CardContent className="p-6 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
              ) : forumThreads.length === 0 ? (
                <CardContent className="p-6 text-center text-muted-foreground">
                  No forum threads yet
                </CardContent>
              ) : (
                <div className="divide-y divide-border/50">
                  {forumThreads.map((thread, idx) => (
                    <Link 
                      key={thread.id || idx}
                      href={`/forum/threads/${thread.id}`}
                      className="block p-4 hover:bg-white/5 transition-colors group"
                    >
                      <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                        {thread.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <span>by {thread.author?.username || 'Unknown'}</span>
                        {thread.replyCount && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {thread.replyCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <CardContent className="p-3 pt-0 border-t border-border/50">
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/forum">View All Threads</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Live Chat */}
          <div>
            <h2 className="font-headline text-2xl font-semibold mb-4">Live Chat</h2>
            <div className="bg-card/60 backdrop-blur-lg border border-white/10 rounded-lg overflow-hidden">
              <LiveChat />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeadshotsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
    </svg>
  );
}
