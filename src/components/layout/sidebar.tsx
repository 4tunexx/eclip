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
import { useUser } from '@/hooks/use-user';
import { UserName } from '@/components/user-name';
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
  const { user } = useUser();
  const isAdmin = (((user as any)?.isAdmin as boolean) || (((user as any)?.role || '').toUpperCase() === 'ADMIN')) ?? false;

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
                    avatarUrl={user?.avatarUrl || ''}
                    username={user?.username || ''}
                    frameUrl={undefined}
                    className="w-16 h-16"
                />
                <div>
                    {user ? (
                      <UserName username={user.username} role={isAdmin ? 'ADMIN' : (user as any).role} className="font-semibold" />
                    ) : (
                      <p className="font-semibold">Guest</p>
                    )}
                    <p className="text-xs text-muted-foreground">Level {Number((user as any)?.level ?? 1)}</p>
                </div>
                <Progress value={((Number((user as any)?.xp ?? 0)) / (Number((user as any)?.level ?? 1) * 100)) * 100} className="h-1 w-full" />
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary text-primary">{(user as any)?.rank ?? 'Bronze'}</Badge>
                    <Badge variant="secondary">{(user as any)?.mmr ?? 1000} MMR</Badge>
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
          {isAdmin && (
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
