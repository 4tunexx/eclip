'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/user-avatar';
import { Loader2, X } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import Link from 'next/link';

export default function FriendsPage() {
  const { user } = useUser();
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchFriends();
    }
  }, [user?.id]);

  const fetchFriends = async () => {
    try {
      const response = await fetch(`/api/friends/list?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    setIsRemoving(friendId);
    try {
      const response = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      });

      if (response.ok) {
        setFriends(friends.filter(f => f.id !== friendId));
      } else {
        alert('Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend');
    } finally {
      setIsRemoving(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Friends</h1>
        <p className="text-muted-foreground">Manage your friends list</p>
      </div>

      {friends.length === 0 ? (
        <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">You don't have any friends yet</p>
            <Button asChild>
              <Link href="/leaderboards">Find Players</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
          <CardHeader>
            <CardTitle>Friends ({friends.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {friends.map((friend) => (
              <div 
                key={friend.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <Link href={`/profile/${friend.id}`} className="flex items-center gap-4 flex-1 hover:opacity-80 transition-opacity">
                  <UserAvatar 
                    avatarUrl={friend.avatar || ''} 
                    username={friend.username}
                    className="h-10 w-10"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{friend.username}</p>
                    <div className="flex gap-2 mt-1">
                      {friend.rank && <Badge variant="outline" className="text-xs">{friend.rank}</Badge>}
                      <Badge variant="outline" className="text-xs">ESR: {friend.esr || 1000}</Badge>
                      <Badge variant="outline" className="text-xs">Lvl {friend.level || 1}</Badge>
                    </div>
                  </div>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveFriend(friend.id)}
                  disabled={isRemoving === friend.id}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
