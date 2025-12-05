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
    const progressPercent = mission.userProgress 
      ? (mission.userProgress.progress / mission.objectiveValue) * 100 
      : 0;
    const isCompleted = mission.userProgress?.completed || false;

    return (
      <Card className="bg-card/60 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(mission.category)}
                {mission.title}
              </CardTitle>
              <CardDescription className="mt-2">{mission.description}</CardDescription>
            </div>
            {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-semibold">
                {mission.userProgress?.progress || 0} / {mission.objectiveValue}
              </span>
            </div>
            <Progress value={Math.min(progressPercent, 100)} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded bg-blue-500/10 border border-blue-500/20">
              <Gift className="w-4 h-4 text-blue-500" />
              <span className="text-sm">{mission.rewardXp} XP</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">{mission.rewardCoins} coins</span>
            </div>
          </div>

          {isCompleted && (
            <div className="bg-green-500/10 border border-green-500/20 rounded p-3 text-center">
              <p className="text-sm font-semibold text-green-500">Completed! ✅</p>
            </div>
          )}
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

function MissionCard({ mission }: { mission: any }) {
  const progressPercent = (mission.progress / mission.total) * 100;

  return (
    <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
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
        {mission.description && (
          <p className="text-sm text-muted-foreground mb-4">{mission.description}</p>
        )}
        <Progress value={progressPercent} className="h-2" />
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-muted-foreground">{mission.progress} / {mission.total}</p>
          {mission.completed && (
            <CheckCircle className="w-5 h-5 text-primary" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
