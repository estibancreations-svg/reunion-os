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

  const bg = variant === 'user' ? 'bg-[#F8F4ED]' : 'bg-[#0F0D0C]';
  const text = variant === 'user' ? 'text-[#1A1615]' : 'text-[#FDFBF7]';

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      <header className="border-b border-[#3F3A36]/40 px-4 md:px-8 py-3 sticky top-0 z-40 backdrop-blur bg-inherit/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/" className="font-serif text-lg font-bold tracking-tight shrink-0">
              Reunion OS
            </Link>
            {user && variant === 'admin' && (
              <nav className="hidden md:flex gap-3 text-xs font-medium flex-wrap">
                <Link href="/admin" className="opacity-70 hover:opacity-100">Dashboard</Link>
                <Link href="/admin/assignments" className="opacity-70 hover:opacity-100">Matrix</Link>
                <Link href="/admin/categories" className="opacity-70 hover:opacity-100">Categories</Link>
                {canRunIntake && (
                  <Link href="/admin/intake" className="opacity-70 hover:opacity-100">Intake</Link>
                )}
                <Link href="/admin/leaderboard" className="opacity-70 hover:opacity-100">Leaderboard</Link>
                <Link href="/admin/activity" className="opacity-70 hover:opacity-100">Activity</Link>
              </nav>
            )}
            {user && variant === 'user' && (
              <nav className="hidden sm:flex gap-3 text-xs font-medium">
                <Link href="/user/punchlist" className="opacity-70 hover:opacity-100">Punch-List</Link>
                <Link href="/user/achievements" className="opacity-70 hover:opacity-100">Achievements</Link>
                <Link href="/user/notifications" className="opacity-70 hover:opacity-100">
                  Alerts
                  {health && health.unreadNotifications > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-[#C84B31] text-white rounded-full text-[10px]">
                      {health.unreadNotifications}
                    </span>
                  )}
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs shrink-0">
            {user ? (
              <>
                <span className="opacity-60 hidden lg:inline truncate max-w-[160px]">
                  {user.fullName} · {user.roleTier.replace(/_/g, ' ')}
                </span>
                {canEditMatrix && variant === 'user' && (
                  <Link href="/admin" className="opacity-70 hover:opacity-100 underline">Admin</Link>
                )}
                <button onClick={logout} className="opacity-70 hover:opacity-100 underline">Sign out</button>
              </>
            ) : (
              <Link href="/login" className="opacity-70 hover:opacity-100">Sign in</Link>
            )}
          </div>
        </div>
        {title && (
          <div className="max-w-7xl mx-auto pt-4 pb-1">
            <h1 className="font-serif text-2xl md:text-3xl font-bold">{title}</h1>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">{children}</main>
    </div>
  );
}
