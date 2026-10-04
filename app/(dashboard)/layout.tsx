import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { getOrganizationProfile } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organization = await getOrganizationProfile();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar for Desktop */}
      <Sidebar organizationName={organization.name} />

      {/* Mobile Navigation Drawer */}
      <MobileNav />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>

      {/* Mobile Ergonomic Bottom Navigation Dock */}
      <MobileBottomNav />
    </div>
  );
}
