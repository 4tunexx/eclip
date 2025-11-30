'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Trophy, Gift, Star, Loader2 } from "lucide-react";

export default function MissionsPage() {
  const [dailyMissions, setDailyMissions] = useState<any[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await fetch('/api/missions');
      const data = await response.json();
      if (response.ok) {
        setDailyMissions(data.daily || []);
        setWeeklyMissions(data.weekly || []);
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
                {dailyMissions.length === 0 ? (
                  <p className="text-muted-foreground">No daily missions available.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {dailyMissions.map((mission) => (
                      <MissionCard key={mission.id} mission={mission} />
                    ))}
                  </div>
                )}
            </div>

            <div>
                <h2 className="font-headline text-2xl font-semibold mb-4">Weekly Missions</h2>
                {weeklyMissions.length === 0 ? (
                  <p className="text-muted-foreground">No weekly missions available.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {weeklyMissions.map((mission) => (
                      <MissionCard key={mission.id} mission={mission} />
                    ))}
                  </div>
                )}
            </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Unlock trophies for your profile by completing milestones.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Achievements system coming soon!</p>
            </CardContent>
          </Card>
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
