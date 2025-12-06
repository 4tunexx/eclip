'use client';

import Link from 'next/link';
import {
  AlertCircle,
  BarChart,
  Gamepad2,
  Gem,
  LayoutGrid,
  Settings,
  Shield,
  Trophy,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminIndexPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage all platform content and systems</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{
          title: 'Total Users', value: '1,234', hint: 'Active accounts'
        }, {
          title: 'Matches Played', value: '5,678', hint: 'Total matches'
        }, {
          title: 'Cosmetics', value: '48', hint: 'Items available'
        }, {
          title: 'System Health', value: '100%', hint: 'All services online', positive: true
        }].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.positive ? 'text-green-500' : ''}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Requirement-Based Systems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminCard
            href="/admin/missions"
            icon={<Gamepad2 className="w-5 h-5" />}
            title="Missions"
            description="Create and manage daily/platform missions"
            hint="16 requirement types · Track user progress"
          />
          <AdminCard
            href="/admin/achievements"
            icon={<Trophy className="w-5 h-5" />}
            title="Achievements"
            description="Define achievement unlock conditions"
            hint="16 requirement types · Unlock rewards"
          />
          <AdminCard
            href="/admin/badges"
            icon={<BarChart className="w-5 h-5" />}
            title="Badges"
            description="Manage cosmetic badges and rewards"
            hint="6 requirement types · 4 rarities"
          />
          <AdminCard
            href="/admin/esr-tiers"
            icon={<LayoutGrid className="w-5 h-5" />}
            title="ESR Tiers"
            description="Configure ESR tier thresholds"
            hint="5 ranks × 3 divisions"
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Core Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminCard
            href="/admin/users"
            icon={<Users className="w-5 h-5" />}
            title="Users"
            description="Manage user accounts and permissions"
            hint="View users · Edit roles · Ban/unban"
          />
          <AdminCard
            href="/admin/matches"
            icon={<Gamepad2 className="w-5 h-5" />}
            title="Matches"
            description="Track and manage match records"
            hint="View matches · Manage results"
          />
          <AdminCard
            href="/admin/cosmetics"
            icon={<Gem className="w-5 h-5" />}
            title="Cosmetics"
            description="Create and manage cosmetic items"
            hint="Frames · Banners · Badges · Titles"
          />
          <AdminCard
            href="/admin/anti-cheat"
            icon={<Shield className="w-5 h-5" />}
            title="Anti-Cheat"
            description="Monitor and manage AC system"
            hint="Review logs · Manage suspicions"
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Configuration</h2>
        <AdminCard
          href="/admin/config"
          icon={<Settings className="w-5 h-5" />}
          title="Site Configuration"
          description="Manage global platform settings and appearance"
          hint="Logo · Banner · Maintenance · Economy"
        />
      </div>

      <Card className="border-l-4 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{
            label: 'Database', value: 'Connected', detail: 'Neon PostgreSQL', highlight: true
          }, {
            label: 'Tables', value: '26/26', detail: 'All tables present'
          }, {
            label: 'Migrations', value: 'Latest', detail: 'All migrations applied', highlight: true
          }].map((item) => (
            <div key={item.label}>
              <p className="text-sm font-semibold text-muted-foreground">{item.label}</p>
              <p className={`text-xl font-bold ${item.highlight ? 'text-green-500' : ''}`}>{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminCard({
  href,
  icon,
  title,
  description,
  hint,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  hint: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
