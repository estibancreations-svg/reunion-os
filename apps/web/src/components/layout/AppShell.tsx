'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { getSystemHealth } from '../../lib/store';

export function AppShell({
  children,
  title,
  variant = 'admin',
}: {
  children: React.ReactNode;
  title?: string;
  variant?: 'admin' | 'user' | 'public';
}) {
  const { user, logout, canEditMatrix, canRunIntake } = useAuth();
  const health =
    typeof window !== 'undefined' && user ? getSystemHealth(user.userId) : null;

  const nav =
    variant === 'admin'
      ? [
          { href: '/admin', label: 'Dashboard' },
          { href: '/admin/assignments', label: 'Matrix' },
          { href: '/admin/categories', label: 'Categories' },
          { href: '/admin/intake', label: 'Intake' },
          { href: '/admin/activity', label: 'Activity' },
          { href: '/admin/leaderboard', label: 'Leaderboard' },
        ]
      : variant === 'user'
        ? [
            { href: '/user/punchlist', label: 'My Punch List' },
            { href: '/user/notifications', label: 'Notifications' },
            { href: '/user/achievements', label: 'Achievements' },
          ]
        : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold tracking-tight text-lg text-amber-400">
              Reunion OS
            </Link>
            {title && <span className="text-slate-400 text-sm hidden sm:inline">{title}</span>}
            <nav className="hidden md:flex gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {health && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  health.status === 'healthy'
                    ? 'bg-emerald-900/50 text-emerald-300'
                    : 'bg-amber-900/50 text-amber-300'
                }`}
              >
                {health.status}
              </span>
            )}
            {user ? (
              <>
                <span className="text-sm text-slate-400 hidden sm:inline">{user.fullName ?? user.name}</span>
                <button
                  onClick={() => logout()}
                  className="text-xs px-2 py-1 rounded border border-slate-700 hover:bg-slate-800"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link href="/login" className="text-sm text-amber-400 hover:underline">
                Sign in
              </Link>
            )}
          </div>
        </div>
        {/* mobile nav */}
        <nav className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1 rounded-md text-xs whitespace-nowrap text-slate-300 bg-slate-800/50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
