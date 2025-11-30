import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
