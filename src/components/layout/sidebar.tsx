'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
  LifeBuoy,
  AlertTriangle,
  Coins,
  ChevronDown,
  Plus,
  Minus,
  DollarSign
} from 'lucide-react';
import { Logo } from '../icons/logo';
import { UserAvatar } from '../user-avatar';
import { useUser } from '@/hooks/use-user';
import { UserName } from '@/components/user-name';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { useClient } from '@/components/client/ClientContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getRoleColor, getRoleBgColor, getRoleLabel } from '@/lib/role-colors';

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
  const { user, refetch } = useUser();
  const { isClientConnected, setClientOpen } = useClient();
  const isAdmin = (((user as any)?.isAdmin as boolean) || (((user as any)?.role || '').toUpperCase() === 'ADMIN')) ?? false;
  const [coinsOpen, setCoinsOpen] = useState(false);
  const [coinAmount, setCoinAmount] = useState('1000');
  const [isLoading, setIsLoading] = useState(false);

  const isActive = (href: string) => pathname === href;

  const handleCoinsAction = async (action: 'add' | 'remove' | 'set') => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const amount = parseInt(coinAmount);
      if (isNaN(amount) || amount < 0) {
        alert('Please enter a valid amount');
        return;
      }

      const response = await fetch('/api/admin/coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount,
          action
        }),
        credentials: 'include',
      });

      if (response.ok) {
        await refetch();
        alert(`Successfully ${action === 'set' ? 'set' : action === 'add' ? 'added' : 'removed'} ${amount} coins`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update coins');
      }
    } catch (error) {
      console.error('Error updating coins:', error);
      alert('Failed to update coins');
    } finally {
      setIsLoading(false);
    }
  };

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
                
                {/* Role Color Badge */}
                {user && (
                  <div
                    style={{
                      backgroundColor: getRoleBgColor(isAdmin ? 'ADMIN' : (user as any).role),
                      color: getRoleColor(isAdmin ? 'ADMIN' : (user as any).role),
                    }}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                  >
                    {getRoleLabel(isAdmin ? 'ADMIN' : (user as any).role)}
                  </div>
                )}
                
                <Progress value={((Number((user as any)?.xp ?? 0)) / (Number((user as any)?.level ?? 1) * 100)) * 100} className="h-1 w-full" />
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary text-primary">{(user as any)?.rank ?? 'Bronze'}</Badge>
                    <Badge variant="secondary">{(user as any)?.esr ?? 1000} ESR</Badge>
                </div>
            </div>
        </SidebarGroup>

        {/* Admin Coins Management */}
        {isAdmin && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <Collapsible open={coinsOpen} onOpenChange={setCoinsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {Number((user as any)?.coins ?? 0).toLocaleString()} Coins
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${coinsOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-2 space-y-2">
                <Input 
                  type="number" 
                  placeholder="Amount" 
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  className="h-8 text-sm"
                  disabled={isLoading}
                />
                <div className="grid grid-cols-3 gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 text-xs"
                    onClick={() => handleCoinsAction('add')}
                    disabled={isLoading}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 text-xs"
                    onClick={() => handleCoinsAction('remove')}
                    disabled={isLoading}
                  >
                    <Minus className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 text-xs"
                    onClick={() => handleCoinsAction('set')}
                    disabled={isLoading}
                  >
                    <DollarSign className="w-3 h-3 mr-1" />
                    Set
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  Quick admin coin management
                </p>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}
        
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
        
        {/* AC Client Status */}
        <div className="px-2 pb-2">
          <button
            onClick={() => setClientOpen(true)}
            className={`w-full p-3 rounded-lg border transition-all duration-300 hover:scale-105 ${
              isClientConnected 
                ? 'border-primary/50 bg-primary/10 hover:bg-primary/20' 
                : 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className={`w-5 h-5 ${isClientConnected ? 'text-primary' : 'text-red-500'}`} />
                <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background ${
                  isClientConnected ? 'bg-primary animate-pulse' : 'bg-red-500'
                }`}></div>
              </div>
              <div className="flex-1 text-left group-data-[collapsible=icon]:hidden">
                <div className={`text-xs font-bold ${isClientConnected ? 'text-primary' : 'text-red-500'}`}>
                  {isClientConnected ? 'PROTECTED' : 'UNSECURED'}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {isClientConnected ? 'AC Client Active' : 'Click to launch'}
                </div>
              </div>
              {!isClientConnected && (
                <AlertTriangle className="w-4 h-4 text-red-500 group-data-[collapsible=icon]:hidden" />
              )}
            </div>
          </button>
        </div>
        
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
