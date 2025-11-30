'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarSeparator,
  useSidebar
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Gamepad2,
  Trophy,
  Store,
  CheckCircle,
  User,
  BookUser,
  Settings,
  Shield,
  LifeBuoy
} from 'lucide-react';
import { Logo } from '../icons/logo';
import { UserAvatar } from '../user-avatar';
import { currentUser } from '@/lib/placeholder-data';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, disabled: false },
  { href: '/play', label: 'Play', icon: Gamepad2, disabled: false },
  { href: '/leaderboards', label: 'Leaderboards', icon: Trophy, disabled: false },
  { href: '/shop', label: 'Shop', icon: Store, disabled: false },
  { href: '/missions', label: 'Missions', icon: CheckCircle, disabled: false },
  { href: '/profile', label: 'Profile', icon: User, disabled: false },
  { href: '/forum', label: 'Forum', icon: BookUser, disabled: false },
];

const bottomNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings, disabled: false },
  { href: '/support', label: 'Support', icon: LifeBuoy, disabled: false },
];

function SidebarLogo() {
    const { state } = useSidebar();
    return (
        <Link href="/dashboard" className="flex items-center justify-center gap-2 transition-transform duration-200 ease-in-out hover:scale-105">
            <Logo variant={state === 'collapsed' ? 'minimal' : 'full'} />
        </Link>
    );
}

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="p-2">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <div className="p-2 flex flex-col items-center text-center gap-2">
                <UserAvatar 
                    avatarUrl={currentUser.avatarUrl} 
                    username={currentUser.username} 
                    frameUrl={currentUser.equippedFrame}
                    className="w-16 h-16"
                />
                <div>
                    <p className="font-semibold">{currentUser.username}</p>
                    <p className="text-xs text-muted-foreground">Level {currentUser.level}</p>
                </div>
                <Progress value={(currentUser.xp / (currentUser.level * 100)) * 100} className="h-1 w-full" />
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary text-primary">{currentUser.rank}</Badge>
                    <Badge variant="secondary">{currentUser.mmr} MMR</Badge>
                </div>
            </div>
        </SidebarGroup>
        
        <SidebarSeparator />

        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                disabled={item.disabled}
                aria-disabled={item.disabled}
                tooltip={item.label}
                className="justify-start transition-transform duration-200 hover:scale-105"
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {currentUser.isAdmin && (
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin')} tooltip="Admin" className="justify-start transition-transform duration-200 hover:scale-105">
                    <Link href="/admin">
                        <Shield />
                        <span>Admin</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarSeparator />
        <SidebarMenu>
            {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                disabled={item.disabled}
                aria-disabled={item.disabled}
                tooltip={item.label}
                className="justify-start transition-transform duration-200 hover:scale-105"
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
