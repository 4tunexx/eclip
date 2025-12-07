'use client';

import { useState, useEffect } from 'react';
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
  Newspaper,
  BookOpen,
  Users,
  Radio,
  ChevronUp,
  ChevronDown,
  LifeBuoy,
  Loader2
} from 'lucide-react';
import Image from "next/image";
import { UserAvatar } from "@/components/user-avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { LiveChat } from "@/components/chat/live-chat";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useUser } from '@/hooks/use-user';

export default function DashboardPage() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: userLoading } = useUser();

  useEffect(() => {
    if (user) {
      fetchMatches();
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
    
  return (
    <div className="p-4 md:p-8">
      <div className="relative mb-8 pt-20">
        {/* Banner background - use equipped banner or default green gradient */}
        <div 
          className="absolute top-0 left-0 right-0 rounded-xl overflow-hidden p-8 h-56 flex items-start justify-between"
          style={{
            backgroundImage: user.equippedBanner ? `url(${user.equippedBanner})` : undefined,
            background: !user.equippedBanner ? 'linear-gradient(135deg, rgb(34 197 94 / 0.3) 0%, rgb(16 185 129 / 0.3) 50%, rgb(20 184 166 / 0.3) 100%)' : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
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
                avatarUrl={user.avatarUrl}
                username={user.username}
                frameUrl={user.equippedFrame}
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
          <div>
            <h2 className="font-headline text-2xl font-semibold mb-4">Recent Matches</h2>
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
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
            </Card>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <Collapsible open={isChatOpen} onOpenChange={setIsChatOpen}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-headline text-2xl font-semibold flex items-center gap-2"><Radio className="text-primary"/> Live Chat</h2>
              <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    {isChatOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                    <span className="sr-only">Toggle Chat</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <LiveChat />
            </CollapsibleContent>
          </Collapsible>
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
                <CardFooter>
                  <Button variant="outline" className="w-full">View Full Details</Button>
                </CardFooter>
              </Card>
            </div>
          )}
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
