import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, Users, Gamepad2, Gem, Settings, Award, Target, Trophy, BarChart3 } from "lucide-react";

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
  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage the Eclip.pro platform.</p>
        </div>
      </div>
      
      <Tabs defaultValue="/admin/anti-cheat" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 h-auto overflow-x-auto">
            {adminNav.map((item) => (
                <TabsTrigger value={item.href} key={item.href} asChild disabled={item.disabled}>
                    <Link href={item.href}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                    </Link>
                </TabsTrigger>
            ))}
        </TabsList>
        {children}
      </Tabs>

    </div>
  );
}
