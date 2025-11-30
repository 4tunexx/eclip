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

export default function ProfilePage() {
  const { user, isLoading: userLoading } = useUser();
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMatches();
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

  return (
    <div className="p-4 md:p-8">
        <Card className="bg-card/60 backdrop-blur-lg border border-white/10 overflow-hidden">
            <div className="relative h-48">
                <Image 
                  src={user.equippedBanner || 'https://picsum.photos/seed/banner1/1200/300'} 
                  alt="Profile Banner" 
                  fill 
                  style={{objectFit:"cover"}} 
                  sizes="100vw" 
                  className="opacity-50" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
            </div>
            <div className="relative p-6 -mt-24">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                    <UserAvatar 
                        avatarUrl={user.avatarUrl}
                        username={user.username}
                        frameUrl={user.equippedFrame}
                        className="w-40 h-40 rounded-full border-4 border-background"
                    />
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="font-headline text-4xl font-bold">{user.username}</h1>
                        <p className="text-primary font-semibold">{user.title || 'Eclip.pro Player'}</p>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                             <Badge variant="outline" className="border-primary text-primary text-lg">{user.rank}</Badge>
                             <Badge variant="secondary" className="text-lg">{user.mmr} MMR</Badge>
                        </div>
                    </div>
                    <Button variant="outline">
                        <Brush className="mr-2 h-4 w-4" />
                        Customize Profile
                    </Button>
                </div>
                <div className="mt-6">
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-semibold">Level {user.level || 1}</span>
                        <span className="text-muted-foreground">{user.xp || 0} / {nextLevelXP} XP</span>
                    </div>
                    <Progress value={((user.xp || 0) / nextLevelXP) * 100} className="h-2" />
                </div>
            </div>
        </Card>

        <Tabs defaultValue="overview" className="mt-8">
            <TabsList className="grid w-full grid-cols-3 max-w-lg">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="matches">Match History</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
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
                      <p className="text-muted-foreground text-center p-8">Achievements system coming soon!</p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
