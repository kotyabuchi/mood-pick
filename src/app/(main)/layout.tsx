'use client';

import { ProfileSetupGuard } from '@/components/guards/profile-setup-guard';
import { AppNavigation } from '@/components/layout/app-navigation';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <ProfileSetupGuard
        navigation={<AppNavigation />}
        mainClassName="flex-1 pb-16 lg:pb-0"
      >
        {children}
      </ProfileSetupGuard>
    </div>
  );
}
