'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Bell,
  MessageSquare,
  Search,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Shield,
  LayoutDashboard,
  Check,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/user-avatar';
import { UserName } from '@/components/user-name';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/hooks/use-user';
import { Logo } from '../icons/logo';

export function Header() {
  const router = useRouter();
  const { user, refetch } = useUser();
  const coins = Number(user?.coins ?? 0);
  const isAdmin = ((user as any)?.isAdmin as boolean) || (((user as any)?.role || '').toUpperCase() === 'ADMIN');
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  // Removed automatic refetch interval - use manual refetch when needed
  // If you need to update coins, call refetch() after coin-changing actions

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=5');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, read: true }),
      });
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>

      {/* Center Section (Empty) */}
      <div className="flex-1"></div>

      {/* Right Section */}
      <div className="flex w-auto items-center justify-end gap-4 md:gap-2 lg:gap-4">
        <form className="hidden sm:flex flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search players, matches..."
              className="pl-8 sm:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm">
            <span className="font-bold text-yellow-400">{coins.toFixed(2)}</span>
            <span className="text-yellow-400">Coins</span>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px] bg-destructive">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={handleClearAll}
                  >
                    Mark all as read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notificationsLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
              ) : (
                <ScrollArea className="h-72">
                  <div className="space-y-2 p-2">
                    {notifications.map((notif) => {
                      const notifData = notif.data ? (typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data) : {};
                      const redirectUrl = notifData.redirectTo || '/profile';
                      
                      return (
                        <div
                          key={notif.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
                          onClick={() => {
                            handleMarkAsRead(notif.id);
                            window.location.href = redirectUrl;
                          }}
                        >
                          <div className="flex-1 pt-0.5">
                            <p className="font-medium text-sm">{notif.title}</p>
                            {notif.message && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!notif.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notif.id);
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Messages - placeholder for future */}
          <Button variant="ghost" size="icon" className="relative disabled opacity-50" disabled title="Messages coming soon">
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Messages</span>
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <UserAvatar
                avatarUrl={user?.avatarUrl || ''}
                username={user?.username || ''}
                className="h-8 w-8"
              />
              {user && (
                <UserName
                  username={user.username}
                  role={isAdmin ? 'ADMIN' : (user as any)?.role}
                  className="hidden md:inline"
                />
              )}
              <ChevronDown className="h-4 w-4 hidden md:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard"><LayoutDashboard className="mr-2" />Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile"><User className="mr-2" />Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="#"><Settings className="mr-2" />Settings</Link>
            </DropdownMenuItem>
            {isAdmin && (
               <DropdownMenuItem asChild>
                 <Link href="/admin"><Shield className="mr-2" />Admin Panel</Link>
               </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2" />Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
