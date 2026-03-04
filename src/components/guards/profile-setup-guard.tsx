'use client';

import { useEffect } from 'react';
import { AlertTriangle, Loader2, LogOut, RefreshCw } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/context/auth-context';
import { useOwnProfile } from '@/hooks/use-profile';

function isProfileIncomplete(profile: { name: string; handle: string | null }) {
  return profile.name.trim() === '' || profile.handle === null;
}

interface ProfileSetupGuardProps {
  children: React.ReactNode;
  navigation: React.ReactNode;
  mainClassName?: string;
}

export function ProfileSetupGuard({
  children,
  navigation,
  mainClassName,
}: ProfileSetupGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated, signOut } = useAuth();
  const {
    data: profile,
    isLoading: profileLoading,
    isError,
    refetch,
  } = useOwnProfile();

  const isSetupPage = pathname === '/profile/setup';
  const needsSetup = profile ? isProfileIncomplete(profile) : false;

  useEffect(() => {
    if (authLoading || profileLoading || isError) return;
    if (!isAuthenticated) return;

    if (needsSetup && !isSetupPage) {
      router.replace('/profile/setup');
    }
  }, [
    authLoading,
    profileLoading,
    isError,
    isAuthenticated,
    needsSetup,
    isSetupPage,
    router,
  ]);

  // Profile incomplete — show setup page only (no nav)
  if (needsSetup) {
    if (isSetupPage) {
      return <main>{children}</main>;
    }
    // Redirecting — show spinner (no nav)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  // Auth or profile loading — show nav + centered spinner
  if (authLoading || profileLoading) {
    return (
      <>
        {navigation}
        <main id="main-content" className={mainClassName}>
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 size={32} className="animate-spin text-accent" />
          </div>
        </main>
      </>
    );
  }

  // Profile fetch error — show nav + error
  if (isError) {
    return (
      <>
        {navigation}
        <main id="main-content" className={mainClassName}>
          <div className="flex items-center justify-center min-h-[50vh] px-4">
            <div className="text-center max-w-sm">
              <AlertTriangle size={48} className="text-accent mx-auto mb-4" />
              <h2 className="text-lg font-bold text-text-primary mb-2">
                プロフィールの読み込みに失敗しました
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                ネットワーク接続を確認して、もう一度お試しください。
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="w-full py-3 rounded-lg bg-accent text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors"
                >
                  <RefreshCw size={16} />
                  再試行
                </button>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full py-3 rounded-lg border border-text-secondary text-text-primary font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-light transition-colors"
                >
                  <LogOut size={16} />
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Profile complete — render normally with nav
  return (
    <>
      {navigation}
      <main id="main-content" className={mainClassName}>
        {children}
      </main>
    </>
  );
}
