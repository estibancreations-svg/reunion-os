'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#0F0D0C] text-[#FDFBF7]">
      <div className="max-w-lg text-center space-y-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#A89F91]">White-Glove Family Operations</p>
        <h1 className="font-serif text-5xl font-bold">Reunion OS</h1>
        <p className="text-[#A89F91] leading-relaxed">
          Full intake-to-delivery system: dynamic intake, multi-category responsibility matrix,
          personal punch-lists, notifications, and role-aware surfaces.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {user ? (
            <>
              <Link href="/admin" className="px-6 py-3 bg-[#C84B31] rounded-xl font-bold text-sm uppercase tracking-wider">
                Admin Dashboard
              </Link>
              <Link href="/user/punchlist" className="px-6 py-3 border border-[#5C544D] rounded-xl font-bold text-sm uppercase tracking-wider">
                My Punch-List
              </Link>
            </>
          ) : (
            <Link href="/login" className="px-6 py-3 bg-[#C84B31] rounded-xl font-bold text-sm uppercase tracking-wider">
              Sign in to continue
            </Link>
          )}
        </div>
        <p className="text-xs text-[#5C544D] pt-6">v5.0 · See DEPLOY.md for Vercel + Supabase</p>
      </div>
    </div>
  );
}
