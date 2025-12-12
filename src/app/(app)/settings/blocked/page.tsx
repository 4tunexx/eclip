'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/user-avatar';
import { Loader2, X } from 'lucide-react';
import { useUser } from '@/hooks/use-user';

export default function BlockedPage() {
  const { user } = useUser();
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnblocking, setIsUnblocking] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchBlockedUsers();
    }
  }, [user?.id]);

  const fetchBlockedUsers = async () => {
    try {
      const response = await fetch('/api/users/blocked');
      if (response.ok) {
        const data = await response.json();
        setBlockedUsers(data.blockedUsers || []);
      }
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    setIsUnblocking(userId);
    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setBlockedUsers(blockedUsers.filter(u => u.id !== userId));
      } else {
        alert('Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user');
    } finally {
      setIsUnblocking(null);
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
        <h1 className="text-3xl font-bold mb-2">Blocked Users</h1>
        <p className="text-muted-foreground">Manage users you've blocked</p>
      </div>

      {blockedUsers.length === 0 ? (
        <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">You haven't blocked any users</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
          <CardHeader>
            <CardTitle>Blocked Users ({blockedUsers.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {blockedUsers.map((blocked) => (
              <div 
                key={blocked.id}
                className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors border border-destructive/20"
              >
                <div className="flex items-center gap-4 flex-1">
                  <UserAvatar 
                    avatarUrl={blocked.avatar || ''} 
                    username={blocked.username}
                    className="h-10 w-10"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{blocked.username}</p>
                    <div className="flex gap-2 mt-1">
                      {blocked.reason && (
                        <Badge variant="outline" className="text-xs text-destructive">
                          {blocked.reason}
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Blocked {new Date(blocked.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnblockUser(blocked.id)}
                  disabled={isUnblocking === blocked.id}
                >
                  <X className="h-4 w-4 mr-1" />
                  Unblock
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
