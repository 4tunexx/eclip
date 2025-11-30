'use client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currentUser, recentMatches, newsArticles, forumActivity } from "@/lib/placeholder-data";
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
  LifeBuoy
} from 'lucide-react';
import Image from "next/image";
import { UserAvatar } from "@/components/user-avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { LiveChat } from "@/components/chat/live-chat";
import { useState } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

export default function DashboardPage() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  
  const stats = [
    { name: "Matches Played", value: "42", icon: Gamepad2 },
    { name: "K/D", value: "1.23", icon: Crosshair },
    { name: "Win Rate", value: "68%", icon: TrendingUp, color: "text-green-300" },
    { name: "Total Winnings", value: "$5,373", icon: CircleDollarSign, color: "text-yellow-400" },
  ];
  
  const lastMatch = recentMatches[0];
  const lastMatchPlayerStats = lastMatch.players[0];

  const lastMatchStats = [
    { name: "K-D-A", value: `${lastMatchPlayerStats.kills}-${lastMatchPlayerStats.deaths}-${lastMatchPlayerStats.assists}`, icon: Crosshair },
    { name: "ADR", value: lastMatchPlayerStats.adr, icon: Bomb },
    { name: "HS%", value: `${lastMatchPlayerStats.hsPercentage}%`, icon: HeadshotsIcon },
    { name: "MVPs", value: lastMatchPlayerStats.mvps, icon: Star, color: "text-yellow-400" },
  ];
    
  return (
    <div className="p-4 md:p-8">
      
      <div className="relative mb-8 pt-20">
        <div className="absolute top-0 left-0 right-0 rounded-xl overflow-hidden p-8 bg-primary/80 h-56 flex items-start justify-between">
            <div className="flex-1">
                <h1 className="font-headline text-2xl md:text-4xl font-bold text-primary-foreground">Welcome back, {currentUser.username}</h1>
                <p className="text-primary-foreground/80 mt-2 text-base md:text-lg">Ready to dominate? Your next match awaits.</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button size="lg" variant="secondary" className="font-bold bg-background/20 hover:bg-background/40 text-primary-foreground border-2 border-transparent hover:border-white/20">
                  Find Match
                  <Swords className="ml-2 h-5 w-5"/>
              </Button>
               <Button size="lg" variant="outline" className="font-bold bg-background/20 hover:bg-background/40 text-primary-foreground border-2 border-transparent hover:border-white/20">
                  Rank System
                  <Trophy className="ml-2 h-5 w-5"/>
              </Button>
               <Button size="lg" variant="outline" className="font-bold bg-background/20 hover:bg-background/40 text-primary-foreground border-2 border-transparent hover:border-white/20">
                  Live Support
                  <LifeBuoy className="ml-2 h-5 w-5"/>
              </Button>
            </div>
        </div>
        
        <Card className="relative p-4 bg-card/80 backdrop-blur-lg border border-white/10 mt-32">
          <div className="grid md:grid-cols-[auto_1fr] items-start gap-6">
            <div className="relative w-32 h-16">
               <UserAvatar 
                avatarUrl={currentUser.avatarUrl}
                username={currentUser.username}
                frameUrl={currentUser.equippedFrame}
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
                  {recentMatches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell className="font-medium">{match.map}</TableCell>
                      <TableCell>{match.score}</TableCell>
                      <TableCell>
                        <Badge variant={match.result === 'Win' ? 'default' : 'destructive'} className={match.result === 'Win' ? `bg-primary/80 text-primary-foreground` : `bg-red-500/80`}>
                          {match.result}
                        </Badge>
                      </TableCell>
                      <TableCell>
                          {match.players[0].kills}/{match.players[0].deaths}/{match.players[0].assists}
                      </TableCell>
                      <TableCell className="flex items-center">
                          {match.players[0].mvps} <Star className="ml-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{match.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
          <div>
            <h2 className="font-headline text-2xl font-semibold mb-4 flex items-center gap-2"><Newspaper /> Latest News</h2>
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
              <CardContent className="p-6 space-y-4">
                {newsArticles.map((article) => (
                  <div key={article.id} className="group flex items-start gap-4">
                      <div className="bg-secondary p-3 rounded-md">
                        <article.icon className="w-6 h-6 text-primary"/>
                      </div>
                      <div className="flex-1">
                          <Link href="#" className="font-semibold hover:text-primary transition-colors">{article.title}</Link>
                          <p className="text-sm text-muted-foreground mt-1">{article.excerpt}</p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{article.date}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                      <BookOpen className="mr-2"/>
                      Read all news
                  </Button>
              </CardContent>
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
          <div>
            <h2 className="font-headline text-2xl font-semibold mb-4 flex items-center gap-2"><ShieldCheck /> Last Match Breakdown</h2>
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10 overflow-hidden">
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
          <div>
            <h2 className="font-headline text-2xl font-semibold mb-4 flex items-center gap-2"><Users /> Latest Activity</h2>
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
              <CardContent className="p-6 space-y-4">
                {forumActivity.map((activity) => (
                  <div key={activity.id} className="group flex items-start gap-4">
                      <div className="bg-secondary p-3 rounded-md">
                        <activity.icon className="w-6 h-6 text-primary"/>
                      </div>
                      <div className="flex-1">
                          <Link href="#" className="font-semibold hover:text-primary transition-colors">{activity.title}</Link>
                          <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{activity.date}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                      <BookOpen className="mr-2"/>
                      View all activity
                  </Button>
              </CardContent>
            </Card>
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
