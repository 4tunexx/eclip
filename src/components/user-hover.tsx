'use client';

import { useEffect, useState, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserAvatar } from '@/components/user-avatar';
import { UserName } from '@/components/user-name';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, UserPlus, Trophy, Zap, Target, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { cn } from '@/lib/utils';

interface UserData {
  id: string;
  username: string;
  avatar?: string;
  rank?: string;
  level?: number;
  coins?: number | string;
  esr?: number;
  rankTier?: string;
  rankDivision?: number;
  title?: string;
  equippedFrame?: {
    id: string;
    name: string;
    imageUrl?: string;
    metadata?: any;
  };
  equippedBanner?: {
    id: string;
    name: string;
    imageUrl?: string;
    metadata?: any;
  };
}

interface UserHoverProps {
  userId: string;
  username: string;
  children?: React.ReactNode;
}

function getRankImage(rank: string): string {
  const rankMap: Record<string, string> = {
    'Ace': 'ace-b.png',
    'Legend': 'legend-b.png',
    'Pro': 'pro-b.png',
    'Rookie': 'rookie-b.png',
    'Beginner': 'beginner-b.png',
  };
  return rankMap[rank] || 'rookie-b.png';
}

export function UserHover({ userId, username, children }: UserHoverProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useUser();

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && !userData && !isLoading) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/user/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          setError('Failed to load user');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error loading user');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = async () => {
    setIsOpen(true);
    // Fetch data if not already loaded
    if (!userData && !isLoading) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/user/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          setError('Failed to load user');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error loading user');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    // Check if mouse is moving to content
    const content = contentRef.current;
    if (content && content.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsOpen(false);
  };

  const handleContentMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button 
          ref={triggerRef}
          type="button"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="cursor-pointer bg-transparent border-none p-0 h-auto hover:opacity-80 transition-opacity"
        >
          {children || <span className="text-primary hover:underline">{username}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        ref={contentRef}
        onMouseLeave={handleContentMouseLeave}
        className="w-96 bg-card/95 backdrop-blur-lg border border-white/10 p-0 shadow-2xl z-50" 
        align="start" 
        side="bottom" 
        sideOffset={8}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : userData ? (
          <div className="space-y-4">
            {/* Profile Header with Banner */}
            <div className="relative">
              {/* Banner Background */}
              {userData.equippedBanner?.imageUrl ? (
                <div 
                  className="h-24 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url(${userData.equippedBanner.imageUrl})`,
                  }}
                />
              ) : (
                <div className="h-24 bg-gradient-to-r from-primary/20 to-blue-500/20" />
              )}
              
              {/* User Info Overlay */}
              <div className="px-4 pb-4 pt-3 bg-gradient-to-b from-transparent to-card/80">
                <div className="flex items-end gap-3">
                  {/* Avatar with Frame */}
                  <div className="relative -mt-12">
                    <UserAvatar
                      avatarUrl={userData.avatar || ''}
                      username={userData.username}
                      frameData={userData.equippedFrame?.metadata}
                      className="w-20 h-20 border-4 border-card"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-base">{userData.username}</h3>
                    {userData.title && (
                      <p className="text-xs text-muted-foreground">{userData.title}</p>
                    )}
                    {userData.rank && (
                      <Badge className="mt-1 bg-yellow-500/80">{userData.rank}</Badge>
                    )}
                  </div>
                  
                  {currentUser?.id !== userId && (
                    <Link href={`/profile/${userId}`} className="mt-auto">
                      <Button size="sm" variant="outline" className="text-xs">Profile</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="px-4 space-y-3">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary/60 border border-border rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    <p className="text-xs text-muted-foreground">Level</p>
                  </div>
                  <p className="text-lg font-bold">{userData.level || 1}</p>
                </div>
                <div className="bg-secondary/60 border border-border rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Zap className="h-4 w-4 text-green-400" />
                    <p className="text-xs text-muted-foreground">ESR</p>
                  </div>
                  <p className="text-lg font-bold">{userData.esr || 1000}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary/60 border border-border rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Target className="h-4 w-4 text-blue-400" />
                    <p className="text-xs text-muted-foreground">Tier</p>
                  </div>
                  <p className="text-lg font-bold">{userData.rankTier || 'Bronze'}</p>
                </div>
                <div className="bg-secondary/60 border border-border rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Zap className="h-4 w-4 text-purple-400" />
                    <p className="text-xs text-muted-foreground">Coins</p>
                  </div>
                  <p className="text-lg font-bold">{typeof userData.coins === 'string' ? parseFloat(userData.coins).toLocaleString() : (userData.coins || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {currentUser?.id !== userId && (
              <div className="px-4 space-y-2 border-t border-border/50 pt-4 pb-4">
                <Link href={`/profile/${userId}`} className="block">
                  <Button size="sm" className="w-full bg-primary/80 hover:bg-primary">
                    View Full Profile
                  </Button>
                </Link>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-500/80 hover:bg-green-600"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    +Rep
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    -Rep
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add Friend
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
