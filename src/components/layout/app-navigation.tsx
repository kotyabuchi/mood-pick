'use client';

import {
  HouseIcon,
  ListIcon,
  MagnifyingGlassIcon,
  UserIcon,
  UsersIcon,
} from '@phosphor-icons/react/ssr';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';

const navItems = [
  { href: '/', icon: HouseIcon, label: 'ホーム' },
  { href: '/list', icon: ListIcon, label: 'リスト' },
  { href: '/search', icon: MagnifyingGlassIcon, label: '検索' },
  { href: '/feed', icon: UsersIcon, label: 'フィード' },
  { href: '/profile', icon: UserIcon, label: 'プロフィール' },
];

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <>
      {/* デスクトップサイドバー */}
      <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 bg-surface border-r border-border p-4">
        <div className="mb-8 px-3">
          <h1 className="text-xl font-bold text-accent">MoodPick</h1>
        </div>
        <nav aria-label="メインナビゲーション" className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent-subtle text-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-light',
                )}
              >
                <item.icon size={20} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* モバイルボトムナビ */}
      <nav
        aria-label="モバイルナビゲーション"
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50"
      >
        <div className="grid grid-cols-5 items-center h-16">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center py-1 text-[10px] transition-colors',
                  isActive
                    ? 'text-accent'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                <item.icon size={22} aria-hidden="true" />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
