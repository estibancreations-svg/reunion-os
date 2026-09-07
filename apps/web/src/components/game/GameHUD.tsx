'use client';

import React from 'react';
import type { GamificationProfile } from '../../types';
import { BADGE_META, pointsToNextLevel } from '../../lib/gamification';

export function GameHUD({ profile }: { profile: GamificationProfile }) {
  const { pct, next } = pointsToNextLevel(profile.points);

  return (
    <div className="rounded-2xl border border-[#E3CAA5] bg-gradient-to-br from-[#1A1615] to-[#2C2825] text-[#FDFBF7] p-4 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#A89F91]">Your Quest Rank</p>
          <p className="font-serif text-2xl font-bold">
            Level {profile.level}
            <span className="text-sm font-sans font-normal text-[#A89F91] ml-2">
              {profile.points} pts
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-[#A89F91]">Streak</p>
          <p className="text-xl font-bold">
            {profile.currentStreak > 0 ? `🔥 ${profile.currentStreak}d` : '—'}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-[#A89F91] mb-1">
          <span>Progress to Level {profile.level + 1}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#3F3A36] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#C84B31] to-[#F59E0B] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-[#5C544D] mt-1">{next - profile.points} pts to next rank</p>
      </div>

      {profile.badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {profile.badges.map((b) => (
            <span
              key={b}
              title={BADGE_META[b]?.description}
              className="px-2 py-1 rounded-lg bg-white/10 text-xs border border-white/10"
            >
              {BADGE_META[b]?.icon} {BADGE_META[b]?.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function PointsToast({ points, badge }: { points: number; badge?: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce px-4 py-3 rounded-xl bg-[#C84B31] text-white shadow-2xl font-bold text-sm">
      +{points} pts{badge ? ` · Badge: ${badge}` : ''} ✨
    </div>
  );
}
