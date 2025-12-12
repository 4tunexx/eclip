'use client';

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, Users, Gamepad2, Gem, Settings, Award, Target, Trophy, BarChart3 } from "lucide-react";
import { useUser } from "@/hooks/use-user";

const adminNav = [
    { name: "Anti-Cheat", href: "/admin/anti-cheat", icon: ShieldAlert, disabled: false },
    { name: "Users", href: "/admin/users", icon: Users, disabled: false },
    { name: "Matches", href: "/admin/matches", icon: Gamepad2, disabled: false },
    { name: "Cosmetics", href: "/admin/cosmetics", icon: Gem, disabled: false },
    { name: "Badges", href: "/admin/badges", icon: Award, disabled: false },
    { name: "Missions", href: "/admin/missions", icon: Target, disabled: false },
    { name: "Achievements", href: "/admin/achievements", icon: Trophy, disabled: false },
    { name: "ESR Tiers", href: "/admin/esr-tiers", icon: BarChart3, disabled: false },
    { name: "Site Config", href: "/admin/config", icon: Settings, disabled: false },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useUser();

  // Check admin role and redirect if not authorized
  useEffect(() => {
    if (!isLoading && user) {
      const isAdmin = (((user as any)?.role || '').toUpperCase() === 'ADMIN');
      console.log('[AdminLayout] Checking access:', { userId: user.id, role: user.role, isAdmin });
      if (!isAdmin) {
        console.warn('[AdminLayout] User attempted unauthorized access to admin panel', { userId: user.id, role: user.role });
        router.replace('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdmin = ((user as any)?.isAdmin as boolean) || (((user as any)?.role || '').toUpperCase() === 'ADMIN');
  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage the Eclip.pro platform.</p>
        </div>
      </div>
      
      <Tabs defaultValue="/admin/anti-cheat" className="w-full">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex sm:grid w-max sm:w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-1 sm:gap-2 h-auto p-1">
            {adminNav.map((item) => (
                <TabsTrigger 
                  value={item.href} 
                  key={item.href} 
                  asChild 
                  disabled={item.disabled}
                  className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-2"
                >
                    <Link href={item.href} className="flex items-center gap-1 sm:gap-2">
                        <item.icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="hidden xs:inline sm:inline">{item.name}</span>
                    </Link>
                </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {children}
      </Tabs>

    </div>
  );
}
