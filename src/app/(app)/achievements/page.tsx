'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Trophy, Loader2, Zap, Award, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AchievementProgress {
  achievementId: string;
  progress: number;
  unlockedAt?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  metricType?: string;
  progressRequired?: number;
  userProgress?: AchievementProgress;
  unlocked?: boolean;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      if (response.ok) {
        const data = await response.json();
        setAchievements(data || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
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
      case 'LEVEL': return <Zap className="w-4 h-4" />;
      case 'ESR': return <Award className="w-4 h-4" />;
      case 'COMBAT': return <Trophy className="w-4 h-4" />;
      case 'SOCIAL': return <Target className="w-4 h-4" />;
      case 'PLATFORM': return <Zap className="w-4 h-4" />;
      case 'COMMUNITY': return <Award className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'LEVEL': return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
      case 'ESR': return 'bg-purple-500/10 border-purple-500/20 text-purple-500';
      case 'COMBAT': return 'bg-red-500/10 border-red-500/20 text-red-500';
      case 'SOCIAL': return 'bg-green-500/10 border-green-500/20 text-green-500';
      case 'PLATFORM': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
      case 'COMMUNITY': return 'bg-pink-500/10 border-pink-500/20 text-pink-500';
      default: return 'bg-white/10 border-white/20';
    }
  };

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const isUnlocked = achievement.unlocked || achievement.userProgress?.unlockedAt;
    const progressPercent = achievement.userProgress && achievement.progressRequired
      ? (achievement.userProgress.progress / achievement.progressRequired) * 100
      : 0;

    return (
      <Card className={`backdrop-blur-lg border transition-all ${
        isUnlocked 
          ? 'bg-card/60 border-white/10' 
          : 'bg-card/30 border-white/5 opacity-75'
      }`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(achievement.category)}
                {achievement.name}
              </CardTitle>
              <CardDescription className="mt-2">{achievement.description}</CardDescription>
            </div>
            {isUnlocked && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={`${getCategoryColor(achievement.category)} border`}>
              {achievement.category}
            </Badge>
            <div className="text-sm font-semibold text-yellow-500 flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              {achievement.points} pts
            </div>
          </div>

          {achievement.progressRequired && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-semibold">
                  {achievement.userProgress?.progress || 0} / {achievement.progressRequired}
                </span>
              </div>
              <Progress value={Math.min(progressPercent, 100)} className="h-2" />
            </div>
          )}

          {isUnlocked && (
            <div className="bg-green-500/10 border border-green-500/20 rounded p-3 text-center">
              <p className="text-sm font-semibold text-green-500">Unlocked ✅</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const categories = ['LEVEL', 'ESR', 'COMBAT', 'SOCIAL', 'PLATFORM', 'COMMUNITY'];
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.reduce((sum, a) => sum + (a.unlocked ? a.points : 0), 0);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-muted-foreground">Unlock trophies for your profile by completing challenges.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{unlockedCount}</div>
              <p className="text-sm text-muted-foreground mt-2">Unlocked</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">{totalPoints}</div>
              <p className="text-sm text-muted-foreground mt-2">Total Points</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{Math.round((unlockedCount / achievements.length) * 100)}%</div>
              <p className="text-sm text-muted-foreground mt-2">Completion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-7 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements
                .filter(a => a.category === category)
                .map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
