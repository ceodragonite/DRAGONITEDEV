'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DragoniteLogo } from '@/components/dragonite-ui';
import { AuthDialog } from '@/components/auth-dialog';
import { UserMenu } from '@/components/user-menu';
import { Trophy, BookOpen, Code2, Sun, Moon } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Bảng Bài Tập', icon: Trophy },
  { href: '/kb', label: 'Thư Viện Kiến Thức', icon: BookOpen },
  { href: '/snippets', label: 'Chia Sẻ Code', icon: Code2 },
];

export function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('dragonite-theme');
    if (stored === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dragonite-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dragonite-theme', 'light');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex-shrink-0">
              <DragoniteLogo size="md" />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-orange-400 bg-orange-500/10 nav-link-active'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-slate-800/50 transition-all"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {!loading && !user && (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500 transition-all glow-orange"
                >
                  Đăng nhập
                </button>
              )}

              {!loading && user && <UserMenu />}
            </div>
          </div>

          {/* Mobile nav */}
          <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'text-orange-400 bg-orange-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
