'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/sidebar';
import { ClientProvider } from '@/components/client/ClientContext';
import { WindowsClient } from '@/components/client/WindowsClient';
import { WindowsClientWrapper } from '@/components/client/WindowsClientWrapper';
import { ClientLauncherWrapper } from '@/components/client/ClientLauncherWrapper';
import { useUser } from '@/hooks/use-user';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useUser();

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  // Show loading or nothing while checking auth
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ClientProvider>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1">
          <Header />
          <SidebarInset>
            <main className="min-h-screen-svh bg-transparent">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <WindowsClientWrapper />
      <ClientLauncherWrapper />
    </ClientProvider>
  );
}
