'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export default function PlayPage() {
  const [inQueue, setInQueue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkQueueStatus();
    const interval = setInterval(checkQueueStatus, 5000); // Check every 5 seconds
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
    if (!queueStatus?.joinedAt) return '0s';
    const seconds = Math.floor((Date.now() - new Date(queueStatus.joinedAt).getTime()) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="bg-card/60 backdrop-blur-lg border border-white/10 text-center w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">
            {inQueue ? 'Searching for Match...' : 'Find a Match'}
          </CardTitle>
          <CardDescription>
            {inQueue
              ? 'Waiting for opponents. Cancel anytime.'
              : 'Select your game mode and start competing.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {inQueue && (
            <div className="space-y-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">Queue Status</h3>
                <p className="text-2xl font-bold">{getQueueTime()}</p>
                <p className="text-sm text-muted-foreground">Time in queue</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm">Searching...</span>
              </div>
            </div>
          )}

          {!inQueue && (
            <>
              <div className="space-y-2">
                <h3 className="font-semibold">Game Mode</h3>
                <p className="text-muted-foreground">Competitive 5v5</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Region</h3>
                <p className="text-muted-foreground">Automatic (EU West - 25ms)</p>
              </div>
            </>
          )}

          <Button
            size="lg"
            className="w-full font-bold text-lg"
            onClick={inQueue ? handleLeaveQueue : handleJoinQueue}
            disabled={isLoading}
            variant={inQueue ? 'destructive' : 'default'}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                {inQueue ? 'Leaving...' : 'Joining...'}
              </>
            ) : inQueue ? (
              'Cancel Search'
            ) : (
              <>
                <Swords className="mr-2 h-6 w-6" />
                Start Search
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
