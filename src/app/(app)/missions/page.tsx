'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Trophy, Gift, Star, Loader2, Zap, Users, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MissionProgress {
  missionId: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  isDaily: boolean;
  objectiveValue: number;
  rewardXp: number;
  rewardCoins: string;
  userProgress?: MissionProgress;
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [dailyMissions, setDailyMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMissions();
  }, []);

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
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DAILY': return <Zap className="w-4 h-4" />;
      case 'PLATFORM': return <Target className="w-4 h-4" />;
      case 'INGAME': return <Trophy className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const MissionCard = ({ mission }: { mission: Mission }) => {
    const current = mission.userProgress?.progress || 0;
    const objective = mission.objectiveValue || 1;
    const progressPercent = Math.min((current / objective) * 100, 100);
    const isCompleted = mission.userProgress?.completed || false;
    const hasStarted = mission.userProgress !== null && mission.userProgress !== undefined;

    return (
      <Card className={`bg-card/60 backdrop-blur-lg border border-white/10 hover:border-primary/50 hover:bg-card/80 transition-all cursor-pointer ${!hasStarted ? 'opacity-60' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(mission.category)}
                {mission.title}
              </CardTitle>
              <CardDescription className="mt-2">{mission.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-semibold">
                {current} / {objective}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded bg-secondary/60 border border-border hover:border-primary/50 transition-colors">
              <Gift className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{mission.rewardXp} XP</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-secondary/60 border border-border hover:border-primary/50 transition-colors">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{mission.rewardCoins} coins</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-3xl font-bold">Missions</h1>
          <p className="text-muted-foreground">Complete challenges to earn XP, coins, and exclusive rewards.</p>
        </div>
      </div>
      
      <Tabs defaultValue="daily">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="daily">Daily ({dailyMissions.length})</TabsTrigger>
          <TabsTrigger value="all">All ({missions.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="mt-6">
          {dailyMissions.length === 0 ? (
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
              <CardContent className="pt-6 text-center text-muted-foreground">
                No daily missions available today.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dailyMissions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {missions.length === 0 ? (
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
              <CardContent className="pt-6 text-center text-muted-foreground">
                No missions available.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {missions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

