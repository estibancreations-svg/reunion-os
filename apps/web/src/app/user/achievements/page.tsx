'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchGamificationApi } from '../../../lib/appApi';
import { BADGE_META, pointsToNextLevel, defaultGamification } from '../../../lib/gamification';
import type { BadgeId, GamificationProfile } from '../../../types';
import { GameHUD } from '../../../components/game/GameHUD';

export default function AchievementsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [source, setSource] = useState<'api' | 'local'>('local');

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
    if (user) {
      fetchGamificationApi(user).then((res) => {
        setProfile(res.data);
        setSource(res.source);
      });
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;
  const g = profile ?? defaultGamification(user.userId);
  const allBadges = Object.keys(BADGE_META) as BadgeId[];

  return (
    <AppShell variant="user" title="Achievements">
      <div className="space-y-6 max-w-2xl">
        <div className="text-xs text-slate-500">Data source: {source}</div>
        <GameHUD profile={g} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allBadges.map((id) => {
            const unlocked = g.badges.includes(id);
            const meta = BADGE_META[id];
            return (
              <div
                key={id}
                className={`rounded-xl border p-4 ${
                  unlocked
                    ? 'bg-white border-[#E3CAA5] shadow-sm'
                    : 'bg-[#F0EBE3] border-dashed border-[#D4CBBE] opacity-60'
                }`}
              >
                <div className="text-2xl mb-1">{meta.icon}</div>
                <div className="font-bold text-[#1A1615]">{meta.name}</div>
                <div className="text-xs text-[#5C5470] mt-0.5">{meta.description}</div>
                <div className="text-[10px] mt-2 font-semibold text-[#C84B31]">
                  {unlocked ? 'UNLOCKED' : 'LOCKED'}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-[#8D7B68]">
          Next level progress: {pointsToNextLevel(g.points).pct}% · {g.points} XP total
        </p>
      </div>
    </AppShell>
  );
}
