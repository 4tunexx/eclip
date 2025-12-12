'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/user-avatar';
import { RankDisplay } from '@/components/rank-display';
import { Loader2, Trophy, Zap, Target, Users, MessageSquare, Shield } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { user: currentUser } = useUser();

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        
        // Check if friend
        if (currentUser?.id) {
          setIsFriend(data.friendIds?.includes(currentUser.id) || false);
        }
        
        // Check if blocked
        const blockedRes = await fetch('/api/users/blocked');
        if (blockedRes.ok) {
          const blockedData = await blockedRes.json();
          const isUserBlocked = blockedData.blockedUsers?.some((u: any) => u.id === userId);
          setIsBlocked(isUserBlocked || false);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: userId }),
      });
      
      if (response.ok) {
        setIsFriend(true);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add friend');
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      alert('Failed to add friend');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: userId }),
      });
      
      if (response.ok) {
        setIsFriend(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockUser = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'User blocked from profile' }),
      });
      
      if (response.ok) {
        setIsBlocked(true);
        alert('User blocked successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to block user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockUser = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setIsBlocked(false);
        alert('User unblocked successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = () => {
    router.push(`/messages?with=${userId}`);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-4 md:p-8">
        <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
          <CardContent className="p-6 text-center text-muted-foreground">
            User not found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Profile Header */}
      <div className="relative">
        <Card className="bg-card/60 backdrop-blur-lg border border-white/10 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-blue-500/20" />
          <CardContent className="relative pt-0 px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
              <div className="relative">
                <UserAvatar
                  avatarUrl={userData.avatar || ''}
                  username={userData.username}
                  frameData={userData.equippedFrame?.metadata}
                  className="w-32 h-32 rounded-full border-4 border-background"
                />
              </div>
              <div className="flex-1">
                <h1 className="font-headline text-3xl font-bold">{userData.username}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userData.rank && (
                    <Badge className="bg-yellow-500/80 text-white">{userData.rank}</Badge>
                  )}
                  {isFriend && (
                    <Badge variant="outline">Friend</Badge>
                  )}
                  <Badge variant="outline">Level {userData.xpLevel || 1}</Badge>
                </div>
              </div>
              {currentUser?.id !== userId && (
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    className="bg-blue-500/80 hover:bg-blue-600"
                    onClick={handleSendMessage}
                    disabled={actionLoading}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={isFriend ? handleRemoveFriend : handleAddFriend}
                    disabled={actionLoading}
                  >
                    {isFriend ? 'Remove Friend' : 'Add Friend'}
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={isBlocked ? handleUnblockUser : handleBlockUser}
                    disabled={actionLoading}
                  >
                    <Block className="h-4 w-4 mr-2" />
                    {isBlocked ? 'Unblock' : 'Block'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/60 border border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ranks">Ranks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Matches Played</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <Trophy className="h-5 w-5 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Win Rate</p>
                    <p className="text-2xl font-bold">0%</p>
                  </div>
                  <Zap className="h-5 w-5 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">K/D Ratio</p>
                    <p className="text-2xl font-bold">0.00</p>
                  </div>
                  <Target className="h-5 w-5 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Friends</p>
                    <p className="text-2xl font-bold">{userData.friendIds?.length || 0}</p>
                  </div>
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* About Section */}
          <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No bio yet. Check back soon for more information about {userData.username}!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ranks Tab */}
        <TabsContent value="ranks" className="space-y-4">
          <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
            <CardContent className="p-8">
              <RankDisplay 
                rank={userData.rank || 'Rookie'} 
                division={userData.rankDivision || 1}
                esr={userData.esr || 1000}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
