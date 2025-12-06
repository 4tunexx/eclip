'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
    Star, 
    TrendingUp, 
    Crosshair, 
    Gamepad2, 
    Trophy,
    CheckCircle,
    Brush,
    Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useUser } from '@/hooks/use-user';
import { getRoleColor, getRoleBgColor } from '@/lib/role-colors';
import { getDefaultBannerDataUrl } from '@/lib/cosmetic-generator';
import { getRankFromESR, formatRank, getProgressToNextDivision } from '@/lib/rank-calculator';

export default function ProfilePage() {
  const { user, isLoading: userLoading } = useUser();
  const [matches, setMatches] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [badgesLoading, setBadgesLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMatches();
      fetchAchievements();
      fetchBadges();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches?limit=20');
      const data = await response.json();
      if (response.ok) {
        setMatches(data.matches || []);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      setAchievementsLoading(true);
      const response = await fetch('/api/user/achievements');
      const data = await response.json();
      if (response.ok) {
        setAchievements(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setAchievementsLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      setBadgesLoading(true);
      const response = await fetch('/api/user/badges');
      const data = await response.json();
      if (response.ok) {
        setBadges(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setBadgesLoading(false);
    }
  };

  if (userLoading || !user) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalKills = matches.reduce((sum, m) => {
    const player = m.players?.find((p: any) => p.id === user.id);
    return sum + (player?.kills || 0);
  }, 0);
  
  const totalDeaths = matches.reduce((sum, m) => {
    const player = m.players?.find((p: any) => p.id === user.id);
    return sum + (player?.deaths || 0);
  }, 0);

  const kd = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : '0.00';
  const wins = matches.filter(m => m.result === 'Win').length;
  const winRate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0;

  const totalXP = user.level ? (user.level - 1) * 200 + user.xp : user.xp;
  const nextLevelXP = user.level ? user.level * 200 : 200;
  const levelProgress = Math.min(100, ((user.xp || 0) / nextLevelXP) * 100);
  const rankProgress = getProgressToNextDivision((user as any)?.esr || 0);

  const activityFeed = [
    ...matches.slice(0, 8).map((match) => ({
      id: `match-${match.id}`,
      title: `Played on ${match.map || 'unknown map'}`,
      subtitle: `${match.result || 'Result'} · ${match.score || 'N/A'}`,
      date: match.date ? new Date(match.date) : null,
      icon: <Gamepad2 className="h-4 w-4" />, 
      color: match.result === 'Win' ? 'text-emerald-400 bg-emerald-500/10' : 'text-yellow-400 bg-yellow-500/10',
    })),
    ...achievements
      .filter((a) => a.userProgress?.unlockedAt)
      .map((a) => ({
        id: `ach-${a.id}`,
        title: `Unlocked achievement: ${a.name}`,
        subtitle: a.description || 'Achievement unlocked',
        date: new Date(a.userProgress.unlockedAt),
        icon: <Trophy className="h-4 w-4" />, 
        color: 'text-yellow-400 bg-yellow-500/10',
      })),
    ...badges
      .filter((b) => b.earnedAt)
      .map((b) => ({
        id: `badge-${b.id}`,
        title: `Earned badge: ${b.name}`,
        subtitle: b.category || 'Badge earned',
        date: new Date(b.earnedAt),
        icon: <Star className="h-4 w-4" />, 
        color: 'text-primary bg-primary/10',
      })),
  ]
    .filter((item) => item.date)
    .sort((a, b) => (b.date as any) - (a.date as any));

  return (
    <div className="p-4 md:p-8">
        <Card className="bg-card/60 backdrop-blur-lg border border-white/10 overflow-hidden">
            {/* Banner - use equipped or code-generated default */}
            <div className="relative h-48 bg-gradient-to-r from-primary/60 to-primary/40">
                {user.equippedBanner ? (
                  <Image 
                    src={user.equippedBanner} 
                    alt="Profile Banner" 
                    fill 
                    style={{objectFit:"cover"}} 
                    sizes="100vw" 
                    className="opacity-80" 
                  />
                ) : (
                  <Image 
                    src={getDefaultBannerDataUrl()} 
                    alt="Default Banner" 
                    fill 
                    style={{objectFit:"cover"}} 
                    sizes="100vw" 
                    className="opacity-60" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
            </div>
            <div className="relative p-6 -mt-24">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                    <div 
                      className="relative w-44 h-44 flex items-center justify-center"
                      style={{
                        background: `conic-gradient(white ${levelProgress}%, rgba(255,255,255,0.1) ${levelProgress}% 100%)`,
                        borderRadius: '9999px',
                        padding: '6px'
                      }}
                    >
                      <div className="bg-card rounded-full p-1 w-full h-full flex items-center justify-center">
                        <UserAvatar 
                            avatarUrl={user.avatarUrl}
                            username={user.username}
                            frameUrl={user.equippedFrame}
                            className="w-40 h-40 rounded-full border-4 border-background"
                        />
                      </div>
                      <div className="absolute bottom-2 text-xs font-semibold text-white drop-shadow-sm">
                        Level {user.level || 1}
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="font-headline text-4xl font-bold">{user.username}</h1>
                        <p className="text-primary font-semibold">{user.title || 'Eclip.pro Player'}</p>
                        {user.role && (
                          <div
                            style={{
                              backgroundColor: getRoleBgColor(user.role),
                              color: getRoleColor(user.role),
                            }}
                            className="inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2"
                          >
                            {user.role}
                          </div>
                        )}
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                             <Badge variant="outline" style={{ borderColor: getRankFromESR((user as any)?.esr || 1000).color }} className="text-lg">
                               {formatRank((user as any)?.esr || 1000)}
                             </Badge>
                                  <Badge variant="secondary" className="text-lg">{(user as any).esr} ESR</Badge>
                        </div>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/settings?tab=account">
                          <Brush className="mr-2 h-4 w-4" />
                          Customize Profile
                        </Link>
                    </Button>
                </div>
                <div className="mt-6 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-semibold">Level {user.level || 1}</span>
                          <span className="text-muted-foreground">{user.xp || 0} / {nextLevelXP} XP</span>
                      </div>
                      <Progress value={levelProgress} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-semibold text-emerald-400">Rank Progress</span>
                        <span className="text-muted-foreground">{rankProgress.current} / {rankProgress.next} ESR</span>
                      </div>
                      <Progress value={rankProgress.percentage} className="h-2" indicatorClassName="bg-emerald-500" />
                    </div>
                </div>
            </div>
        </Card>

        <Tabs defaultValue="overview" className="mt-8">
            <TabsList className="grid w-full grid-cols-5 max-w-2xl">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="matches">Matches</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="badges">Badges</TabsTrigger>
                <TabsTrigger value="ranks">Ranks</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
                <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                    <CardHeader>
                        <CardTitle>Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                         <div className="bg-secondary/60 border border-border rounded-lg p-4 text-center flex flex-col justify-center items-center">
                            <h3 className="text-sm font-medium text-muted-foreground">Matches Played</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Gamepad2 className="h-5 w-5 text-primary" />
                                <p className="text-2xl font-bold">{matches.length}</p>
                            </div>
                        </div>
                         <div className="bg-secondary/60 border border-border rounded-lg p-4 text-center flex flex-col justify-center items-center">
                            <h3 className="text-sm font-medium text-muted-foreground">Win Rate</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <TrendingUp className="h-5 w-5 text-green-400" />
                                <p className="text-2xl font-bold">{winRate}%</p>
                            </div>
                        </div>
                        <div className="bg-secondary/60 border border-border rounded-lg p-4 text-center flex flex-col justify-center items-center">
                            <h3 className="text-sm font-medium text-muted-foreground">K/D Ratio</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Crosshair className="h-5 w-5 text-primary" />
                                <p className="text-2xl font-bold">{kd}</p>
                            </div>
                        </div>
                        <div className="bg-secondary/60 border border-border rounded-lg p-4 text-center flex flex-col justify-center items-center">
                            <h3 className="text-sm font-medium text-muted-foreground">Total MVPs</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Star className="h-5 w-5 text-yellow-400" />
                                <p className="text-2xl font-bold">
                                  {matches.reduce((sum, m) => {
                                    const player = m.players?.find((p: any) => p.id === user.id);
                                    return sum + (player?.mvps || 0);
                                  }, 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="mt-6 bg-card/60 backdrop-blur-lg border border-white/10">
                  <CardHeader>
                    <CardTitle>Activity Feed</CardTitle>
                    <CardDescription>Latest matches, achievements, and badges.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activityFeed.length === 0 ? (
                      <p className="text-muted-foreground">No recent activity yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {activityFeed.slice(0, 12).map((item) => (
                          <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/40 border border-border/40">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center ${item.color}`}>
                              {item.icon}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold leading-tight">{item.title}</p>
                              <p className="text-xs text-muted-foreground leading-tight">{item.subtitle}</p>
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {item.date?.toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="matches" className="mt-6">
                <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                    <CardHeader>
                        <CardTitle>Recent Matches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
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
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="achievements" className="mt-6">
                <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                    <CardHeader>
                        <CardTitle>Achievements</CardTitle>
                        <CardDescription>Trophies earned from completing milestones.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {achievementsLoading ? (
                        <div className="p-8 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : achievements.length === 0 ? (
                        <p className="text-muted-foreground text-center p-8">No achievements yet. Start playing to unlock achievements!</p>
                      ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {achievements.map((achievement) => (
                            <div key={achievement.id} className="bg-secondary/60 border border-border rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <Trophy className={`h-8 w-8 flex-shrink-0 mt-1 ${achievement.unlocked ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground opacity-50'}`} />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm">{achievement.name}</h3>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{achievement.description}</p>
                                  {achievement.userProgress && (
                                    <div className="mt-2">
                                      <div className="flex justify-between items-center text-xs mb-1">
                                        <span className="font-medium">{achievement.userProgress.progress}/{achievement.target}</span>
                                        <span className="text-primary">+{achievement.rewardXp} XP</span>
                                      </div>
                                      {achievement.target > 0 && (
                                        <Progress 
                                          value={Math.min((achievement.userProgress.progress / achievement.target) * 100, 100)} 
                                          className="h-1" 
                                        />
                                      )}
                                    </div>
                                  )}
                                  {achievement.unlocked && achievement.userProgress?.unlockedAt && (
                                    <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      Unlocked {new Date(achievement.userProgress.unlockedAt).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="badges" className="mt-6">
                <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                    <CardHeader>
                        <CardTitle>Badges</CardTitle>
                        <CardDescription>Special badges earned from achievements and milestones.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {badgesLoading ? (
                        <div className="p-8 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : badges.length === 0 ? (
                        <p className="text-muted-foreground text-center p-8">No badges earned yet. Complete achievements to earn badges!</p>
                      ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {badges.map((badge) => (
                            <div key={badge.id} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/40 border border-border/50 hover:border-primary/50 transition-colors">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary border border-border flex items-center justify-center">
                                {badge.imageUrl ? (
                                  <Image 
                                    src={badge.imageUrl} 
                                    alt={badge.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <Star className="h-8 w-8 text-primary" />
                                )}
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-semibold line-clamp-1">{badge.name}</p>
                                <Badge variant="outline" className="mt-1 text-xs">{badge.category || 'Badge'}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="ranks" className="mt-6">
                <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                    <CardHeader>
                        <CardTitle>Rank & Progression</CardTitle>
                        <CardDescription>Your competitive rank and ESR rating progression.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-secondary/60 border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-sm">Current Rank</h3>
                              <Trophy className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            </div>
                            <p className="text-3xl font-bold" style={{ color: getRankFromESR((user as any)?.esr || 1000).color }}>
                              {formatRank((user as any)?.esr || 1000)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Your competitive rank</p>
                          </div>
                          <div className="bg-secondary/60 border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-sm">ESR Rating</h3>
                              <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                            <p className="text-3xl font-bold">{(user as any).esr || 0}</p>
                            <p className="text-xs text-muted-foreground mt-1">Elo-based rating system</p>
                          </div>
                        </div>
                        <div className="bg-secondary/60 border border-border rounded-lg p-4">
                          <h3 className="font-semibold text-sm mb-3">Rank Information</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Level</span>
                              <span className="font-semibold">{user.level || 1}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total XP</span>
                              <span className="font-semibold">{totalXP.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Next Level XP</span>
                              <span className="font-semibold">{nextLevelXP.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Matches Played</span>
                              <span className="font-semibold">{matches.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Win Rate</span>
                              <span className="font-semibold text-green-400">{winRate}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
