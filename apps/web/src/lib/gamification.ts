/**
 * Gamification engine — points, levels, badges, streaks
 */

import type { BadgeId, GamificationProfile, PunchListItem } from '../types';

export const BADGE_META: Record<
  BadgeId,
  { name: string; description: string; icon: string }
> = {
  FIRST_TASK: { name: 'First Step', description: 'Complete your first task', icon: '🌱' },
  STREAK_3: { name: 'On a Roll', description: '3-day activity streak', icon: '🔥' },
  STREAK_7: { name: 'Week Warrior', description: '7-day activity streak', icon: '⚡' },
  CATEGORY_MASTER: { name: 'Category Master', description: 'Own 3+ categories', icon: '👑' },
  ON_TIME: { name: 'On Time', description: 'Complete 5 tasks before due date', icon: '⏰' },
  PROOF_PRO: { name: 'Proof Pro', description: 'Upload 5 proofs/receipts', icon: '📸' },
  INTAKE_RUNNER: { name: 'Architect', description: 'Run the Intake Engine once', icon: '🏗️' },
  MATRIX_EDITOR: { name: 'Matrix Operator', description: 'Edit the responsibility matrix', icon: '🎛️' },
  DEPOSIT_CLEARED: { name: 'Cleared', description: 'Fully clear your deposit', icon: '💎' },
  TEAM_PLAYER: { name: 'Team Player', description: 'Complete 10 tasks total', icon: '🤝' },
};

export function levelFromPoints(points: number): number {
  if (points < 100) return 1;
  if (points < 250) return 2;
  if (points < 500) return 3;
  if (points < 900) return 4;
  if (points < 1500) return 5;
  return Math.min(20, 6 + Math.floor((points - 1500) / 400));
}

export function pointsToNextLevel(points: number): { current: number; next: number; pct: number } {
  const thresholds = [0, 100, 250, 500, 900, 1500, 1900, 2300, 2700, 3100, 3500];
  const level = levelFromPoints(points);
  const current = thresholds[Math.min(level - 1, thresholds.length - 1)] ?? 0;
  const next = thresholds[Math.min(level, thresholds.length - 1)] ?? current + 400;
  const pct = next === current ? 100 : Math.min(100, Math.round(((points - current) / (next - current)) * 100));
  return { current, next, pct };
}

export function defaultGamification(userId: string): GamificationProfile {
  return {
    userId,
    points: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    badges: [],
    tasksCompleted: 0,
    onTimeCompletions: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function awardTaskCompletion(
  profile: GamificationProfile,
  task: PunchListItem,
  completedOnTime: boolean
): { profile: GamificationProfile; newBadges: BadgeId[]; pointsGained: number } {
  const pointsGained = task.pointsValue || priorityPoints(task.priority);
  let points = profile.points + pointsGained;
  let tasksCompleted = profile.tasksCompleted + 1;
  let onTimeCompletions = profile.onTimeCompletions + (completedOnTime ? 1 : 0);
  let badges = [...profile.badges];
  const newBadges: BadgeId[] = [];

  const today = new Date().toISOString().slice(0, 10);
  let currentStreak = profile.currentStreak;
  let longestStreak = profile.longestStreak;

  if (profile.lastActivityDate) {
    const last = new Date(profile.lastActivityDate);
    const diff = Math.floor((Date.now() - last.getTime()) / 86400000);
    if (diff === 1) currentStreak += 1;
    else if (diff > 1) currentStreak = 1;
  } else {
    currentStreak = 1;
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  const tryBadge = (id: BadgeId, cond: boolean) => {
    if (cond && !badges.includes(id)) {
      badges.push(id);
      newBadges.push(id);
      points += 25;
    }
  };

  tryBadge('FIRST_TASK', tasksCompleted >= 1);
  tryBadge('STREAK_3', currentStreak >= 3);
  tryBadge('STREAK_7', currentStreak >= 7);
  tryBadge('ON_TIME', onTimeCompletions >= 5);
  tryBadge('TEAM_PLAYER', tasksCompleted >= 10);

  return {
    profile: {
      ...profile,
      points,
      level: levelFromPoints(points),
      currentStreak,
      longestStreak,
      badges,
      tasksCompleted,
      onTimeCompletions,
      lastActivityDate: today,
      updatedAt: new Date().toISOString(),
    },
    newBadges,
    pointsGained: points - profile.points,
  };
}

function priorityPoints(p: PunchListItem['priority']): number {
  switch (p) {
    case 'CRITICAL': return 50;
    case 'HIGH': return 30;
    case 'MEDIUM': return 20;
    case 'LOW': return 10;
    default: return 15;
  }
}

export function awardBadge(
  profile: GamificationProfile,
  badge: BadgeId
): GamificationProfile {
  if (profile.badges.includes(badge)) return profile;
  const points = profile.points + 25;
  return {
    ...profile,
    badges: [...profile.badges, badge],
    points,
    level: levelFromPoints(points),
    updatedAt: new Date().toISOString(),
  };
}
