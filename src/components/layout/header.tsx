'use client';

import Link from 'next/link';
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
import { useUser } from '@/hooks/use-user';
import { Logo } from '../icons/logo';

export function Header() {
  const { user } = useUser();
  const coins = Number(user?.coins ?? 0);
  const isAdmin = ((user as any)?.isAdmin as boolean) || (((user as any)?.role || '').toUpperCase() === 'ADMIN');
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
            <span className="font-bold text-primary">{coins.toFixed(2)}</span>
            <span className="text-muted-foreground">Coins</span>
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-1 text-[10px]">
              3
            </Badge>
            <span className="sr-only">Notifications</span>
          </Button>

          <Button variant="ghost" size="icon" className="relative">
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
              <Link href="#"><User className="mr-2" />Profile</Link>
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
            <DropdownMenuItem asChild>
                <Link href="/"><LogOut className="mr-2" />Log out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
