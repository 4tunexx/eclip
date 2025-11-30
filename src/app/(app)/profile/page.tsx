import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { currentUser, recentMatches, achievements } from "@/lib/placeholder-data";
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
    Brush
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-8">
        <Card className="bg-card/60 backdrop-blur-lg border border-white/10 overflow-hidden">
            <div className="relative h-48">
                <Image src={currentUser.equippedBanner ?? 'https://picsum.photos/seed/banner1/1200/300'} alt="Profile Banner" fill style={{objectFit:"cover"}} sizes="100vw" className="opacity-50" />
                 <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
            </div>
            <div className="relative p-6 -mt-24">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                    <UserAvatar 
                        avatarUrl={currentUser.avatarUrl}
                        username={currentUser.username}
                        frameUrl={currentUser.equippedFrame}
                        className="w-40 h-40 rounded-full border-4 border-background"
                    />
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="font-headline text-4xl font-bold">{currentUser.username}</h1>
                        <p className="text-primary font-semibold">{currentUser.title ?? 'Eclip.pro Veteran'}</p>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                             <Badge variant="outline" className="border-primary text-primary text-lg">{currentUser.rank}</Badge>
                             <Badge variant="secondary" className="text-lg">{currentUser.mmr} MMR</Badge>
                        </div>
                    </div>
                    <Button variant="outline">
                        <Brush className="mr-2 h-4 w-4" />
                        Customize Profile
                    </Button>
                </div>
                <div className="mt-6">
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-semibold">Level {currentUser.level}</span>
                        <span className="text-muted-foreground">{currentUser.xp} / {currentUser.level * 100} XP</span>
                    </div>
                    <Progress value={(currentUser.xp / (currentUser.level * 100)) * 100} className="h-2" />
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
                                <p className="text-2xl font-bold">42</p>
                            </div>
                        </div>
                         <div className="bg-secondary/60 border border-border rounded-lg p-4 text-center flex flex-col justify-center items-center">
                            <h3 className="text-sm font-medium text-muted-foreground">Win Rate</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <TrendingUp className="h-5 w-5 text-green-400" />
                                <p className="text-2xl font-bold">68%</p>
                            </div>
                        </div>
                        <div className="bg-secondary/60 border border-border rounded-lg p-4 text-center flex flex-col justify-center items-center">
                            <h3 className="text-sm font-medium text-muted-foreground">K/D Ratio</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Crosshair className="h-5 w-5 text-primary" />
                                <p className="text-2xl font-bold">1.23</p>
                            </div>
                        </div>
                        <div className="bg-secondary/60 border border-border rounded-lg p-4 text-center flex flex-col justify-center items-center">
                            <h3 className="text-sm font-medium text-muted-foreground">MVPs</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Star className="h-5 w-5 text-yellow-400" />
                                <p className="text-2xl font-bold">12</p>
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
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="achievements" className="mt-6">
                <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                    <CardHeader>
                        <CardTitle>Achievements</CardTitle>
                        <CardDescription>Trophies earned from completing milestones.</CardDescription>
                    </CardHeader>
                     <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {achievements.map((ach) => (
                            <div key={ach.id} className={`flex items-center gap-4 rounded-lg p-4 ${ach.unlocked ? 'bg-secondary/60 border border-primary/30' : 'bg-secondary/30'}`}>
                                <div className={`p-3 rounded-md ${ach.unlocked ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'}`}>
                                    <Trophy className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className={`font-semibold ${ach.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{ach.title}</p>
                                    <p className="text-sm text-muted-foreground">{ach.description}</p>
                                    {ach.unlocked && <p className="text-xs text-primary font-bold mt-1">Unlocked!</p>}
                                </div>
                                {ach.unlocked && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 ml-auto" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
