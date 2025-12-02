'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Loader2, Shield, Globe, Map, Clock, AlertTriangle, Power } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useClient } from '@/components/client/ClientContext';

const MAP_POOL = [
  { name: 'Mirage', image: '/images/maps/mirage.jpg' },
  { name: 'Inferno', image: '/images/maps/inferno.jpg' },
  { name: 'Nuke', image: '/images/maps/nuke.jpg' },
  { name: 'Overpass', image: '/images/maps/overpass.jpg' },
  { name: 'Vertigo', image: '/images/maps/vertigo.jpg' },
  { name: 'Ancient', image: '/images/maps/ancient.jpg' },
  { name: 'Anubis', image: '/images/maps/anubis.jpg' },
];

export default function PlayPage() {
  const [inQueue, setInQueue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const { toast } = useToast();
  const { isClientConnected, setClientOpen } = useClient();

  useEffect(() => {
    checkQueueStatus();
    const interval = setInterval(checkQueueStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkQueueStatus = async () => {
    try {
      const response = await fetch('/api/queue/status');
      const data = await response.json();
      setInQueue(data.inQueue || false);
      setQueueStatus(data);
    } catch (error) {
      console.error('Error checking queue status:', error);
    }
  };

  const handleJoinQueue = async () => {
    if (!isClientConnected) {
      toast({
        title: 'Anti-Cheat Required',
        description: 'Please connect the Eclip Client to queue for matches',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/queue/join', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join queue');
      }

      toast({
        title: 'Joined Queue',
        description: 'Searching for a match...',
      });

      setInQueue(true);
      checkQueueStatus();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to join queue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/queue/leave', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to leave queue');
      }

      toast({
        title: 'Left Queue',
        description: 'You have left the matchmaking queue.',
      });

      setInQueue(false);
      setQueueStatus(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to leave queue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getQueueTime = () => {
    if (!queueStatus?.joinedAt) return '0:00';
    const seconds = Math.floor((Date.now() - new Date(queueStatus.joinedAt).getTime()) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If client not connected, show warning
  if (!isClientConnected) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="bg-card/60 backdrop-blur-lg border border-red-500/20 text-center w-full max-w-2xl">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border-4 border-red-500/20">
                <Shield className="w-12 h-12 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-3xl">Anti-Cheat Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-lg">
              You must have the Eclip Client running and connected to queue for ranked matches. 
              This ensures a fair environment for everyone.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-muted/40 rounded-lg border border-muted">
                <div className="font-bold mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">
                    1
                  </div>
                  Download Client
                </div>
                <p className="text-sm text-muted-foreground">
                  Get the latest Eclip Anti-Cheat client for Windows
                </p>
              </div>
              <div className="p-4 bg-muted/40 rounded-lg border border-muted">
                <div className="font-bold mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">
                    2
                  </div>
                  Launch & Connect
                </div>
                <p className="text-sm text-muted-foreground">
                  Open the app and click the power button to connect
                </p>
              </div>
            </div>

            <Button 
              onClick={() => setClientOpen(true)}
              size="lg"
              className="w-full font-bold text-lg"
            >
              <Power className="mr-2 h-5 w-5" />
              Open Client
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Play</h1>
          <p className="text-muted-foreground">Select game mode and region</p>
        </div>
        <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-500 px-4 py-2">
          <Shield className="w-4 h-4 mr-2" />
          SECURE CONNECTION ACTIVE
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Queue Card */}
        <div className="lg:col-span-2">
          <Card className="bg-card/60 backdrop-blur-lg border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <CardContent className="p-8 relative z-10">
              {/* Game Mode Tabs */}
              <div className="flex gap-4 mb-8">
                <Button variant="default" className="font-bold">
                  5v5 Ranked
                </Button>
                <Button variant="ghost" disabled className="font-bold text-muted-foreground">
                  Wingman (Soon)
                </Button>
                <Button variant="ghost" disabled className="font-bold text-muted-foreground">
                  1v1 Aim (Soon)
                </Button>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-muted/40 rounded-xl border border-muted hover:border-primary/50 cursor-pointer transition-colors">
                  <div className="text-muted-foreground text-xs font-bold uppercase mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Region
                  </div>
                  <div className="text-lg font-bold">Europe (West)</div>
                  <div className="text-xs text-muted-foreground mt-1">~25ms ping</div>
                </div>
                <div className="p-4 bg-muted/40 rounded-xl border border-muted hover:border-primary/50 cursor-pointer transition-colors">
                  <div className="text-muted-foreground text-xs font-bold uppercase mb-2 flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Map Pool
                  </div>
                  <div className="text-lg font-bold">Active Duty</div>
                  <div className="text-xs text-muted-foreground mt-1">7 maps available</div>
                </div>
              </div>

              {/* Queue Status or Button */}
              {inQueue ? (
                <div className="w-full p-8 bg-primary/10 rounded-xl border border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-muted">
                    <div className="h-full bg-primary animate-pulse"></div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <div>
                      <div className="text-muted-foreground font-mono text-sm text-center mb-2">
                        SEARCHING FOR MATCH...
                      </div>
                      <div className="text-4xl font-black text-center font-mono">
                        {getQueueTime()}
                      </div>
                    </div>
                    <Button 
                      onClick={handleLeaveQueue}
                      disabled={isLoading}
                      variant="destructive"
                      className="mt-4"
                    >
                      CANCEL SEARCH
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleJoinQueue}
                  disabled={isLoading}
                  size="lg"
                  className="w-full font-black text-2xl h-16 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Swords className="mr-2 h-6 w-6" />
                      FIND MATCH
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Info Panel */}
        <div className="space-y-6">
          {/* Current Lobby */}
          <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Lobby</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-muted">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">You</div>
                  <div className="text-xs text-muted-foreground">Ready</div>
                </div>
              </div>
              <Button variant="outline" className="w-full" disabled>
                + Invite Friend (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          {/* Map Pool Preview */}
          <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Active Duty Maps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {MAP_POOL.slice(0, 4).map((map) => (
                  <div key={map.name} className="relative group overflow-hidden rounded-lg border border-muted hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="aspect-video bg-muted/40 flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">{map.name}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                +{MAP_POOL.length - 4} more maps
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
