import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { dailyMissions, weeklyMissions, achievements } from "@/lib/placeholder-data";
import { CheckCircle, Trophy, Gift, Star } from "lucide-react";

export default function MissionsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-3xl font-bold">Missions & Achievements</h1>
          <p className="text-muted-foreground">Complete challenges to earn XP, coins, and exclusive rewards.</p>
        </div>
      </div>
      
      <Tabs defaultValue="missions">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="missions">Missions</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="missions" className="mt-6 space-y-8">
            <div>
                <h2 className="font-headline text-2xl font-semibold mb-4">Daily Missions</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {dailyMissions.map((mission) => (
                        <Card key={mission.id} className="bg-card/60 backdrop-blur-lg border border-white/10">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{mission.title}</CardTitle>
                                    <div className="flex items-center gap-2 text-primary font-bold">
                                        <Gift className="w-5 h-5"/>
                                        <span>{mission.reward}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Progress value={(mission.progress / mission.total) * 100} className="h-2" />
                                <p className="text-right text-sm text-muted-foreground mt-2">{mission.progress} / {mission.total}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="font-headline text-2xl font-semibold mb-4">Weekly Missions</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {weeklyMissions.map((mission) => (
                        <Card key={mission.id} className="bg-card/60 backdrop-blur-lg border border-white/10">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{mission.title}</CardTitle>
                                    <div className="flex items-center gap-2 text-primary font-bold">
                                        <Gift className="w-5 h-5"/>
                                        <span>{mission.reward}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Progress value={(mission.progress / mission.total) * 100} className="h-2" />
                                <p className="text-right text-sm text-muted-foreground mt-2">{mission.progress} / {mission.total}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
             <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>Unlock trophies for your profile by completing milestones.</CardDescription>
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
