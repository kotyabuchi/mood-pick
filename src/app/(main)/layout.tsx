'use client';

import { AppNavigation } from '@/components/layout/app-navigation';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppNavigation />
      <main id="main-content" className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
