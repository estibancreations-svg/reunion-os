/**
 * XP, levels, streaks, achievements.
 */

import type { BadgeId, GamificationProfile } from '@/types';

export const XP_PER_TASK = 50;
export const XP_PER_HIGH_PRIORITY = 25;
export const STREAK_BONUS = 10;

export const BADGE_META: Record<BadgeId, { name: string; description: string; icon: string }> = {
  'first-task': { name: 'First Steps', description: 'Complete your first task', icon: '👣' },
  'streak-3': { name: 'On a Roll', description: 'Maintain a 3-day streak', icon: '🔥' },
  'streak-7': { name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🏅' },
  'ten-tasks': { name: 'Task Master', description: 'Complete 10 tasks', icon: '✅' },
  'high-priority': { name: 'Crisis Averted', description: 'Complete a high-priority task', icon: '🚨' },
  'all-categories': { name: 'Full Spectrum', description: 'Contribute across 3+ categories', icon: '🌈' },
  'matrix-master': { name: 'Matrix Master', description: 'Edited assignment matrix', icon: '📊' },
};

export function levelFromXp(xp: number): number {
  let level = 1;
  let need = 100;
  let remaining = xp;
  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = Math.floor(100 * Math.pow(level, 1.5));
  }
  return level;
}

export function xpToNextLevel(xp: number): { current: number; next: number; pct: number } {
  const level = levelFromXp(xp);
  let spent = 0;
  for (let l = 1; l < level; l++) {
    spent += Math.floor(100 * Math.pow(l, 1.5));
  }
  const need = Math.floor(100 * Math.pow(level, 1.5));
  const into = xp - spent;
  return {
    current: into,
    next: need,
    pct: Math.min(100, Math.round((into / need) * 100)),
  };
}

export const pointsToNextLevel = xpToNextLevel;

export function defaultGamification(userId: string, fullName?: string): GamificationProfile {
  return {
    userId,
    fullName,
    name: fullName,
    points: 0,
    xp: 0,
    level: 1,
    currentStreak: 0,
    streak: 0,
    tasksCompleted: 0,
    badges: [],
  };
}

export function awardXp(
  currentXp: number,
  opts: { completed?: boolean; highPriority?: boolean; streakDay?: boolean }
): number {
  let add = 0;
  if (opts.completed) add += XP_PER_TASK;
  if (opts.highPriority) add += XP_PER_HIGH_PRIORITY;
  if (opts.streakDay) add += STREAK_BONUS;
  return currentXp + add;
}

export function checkAchievements(
  stats: {
    completedCount: number;
    streak: number;
    highPriorityDone: boolean;
    categoriesTouched: number;
  },
  alreadyUnlocked: BadgeId[]
): BadgeId[] {
  const newly: BadgeId[] = [];
  const has = (id: BadgeId) => alreadyUnlocked.includes(id) || newly.includes(id);

  if (stats.completedCount >= 1 && !has('first-task')) newly.push('first-task');
  if (stats.streak >= 3 && !has('streak-3')) newly.push('streak-3');
  if (stats.streak >= 7 && !has('streak-7')) newly.push('streak-7');
  if (stats.completedCount >= 10 && !has('ten-tasks')) newly.push('ten-tasks');
  if (stats.highPriorityDone && !has('high-priority')) newly.push('high-priority');
  if (stats.categoriesTouched >= 3 && !has('all-categories')) newly.push('all-categories');

  return newly;
}

export function leaderboardSort(
  profiles: { userId: string; name: string; points: number; level: number }[]
) {
  return [...profiles].sort((a, b) => b.points - a.points || b.level - a.level);
}
