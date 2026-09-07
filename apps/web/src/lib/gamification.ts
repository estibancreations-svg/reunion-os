/**
 * XP, levels, streaks, achievements.
 */

export const XP_PER_TASK = 50;
export const XP_PER_HIGH_PRIORITY = 25;
export const STREAK_BONUS = 10;

export function levelFromXp(xp: number): number {
  // simple curve: level n requires ~100 * n^1.5 xp
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

export const ACHIEVEMENTS = [
  { id: "first-task", title: "First Steps", description: "Complete your first punch-list item", xp: 50 },
  { id: "streak-3", title: "On a Roll", description: "3-day activity streak", xp: 75 },
  { id: "streak-7", title: "Week Warrior", description: "7-day activity streak", xp: 150 },
  { id: "ten-tasks", title: "Task Master", description: "Complete 10 items", xp: 100 },
  { id: "high-priority", title: "Crisis Averted", description: "Complete a high-priority item", xp: 50 },
  { id: "all-categories", title: "Full Spectrum", description: "Contribute across 3+ categories", xp: 120 },
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];

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
  alreadyUnlocked: string[]
): string[] {
  const newly: string[] = [];
  const has = (id: string) => alreadyUnlocked.includes(id) || newly.includes(id);

  if (stats.completedCount >= 1 && !has("first-task")) newly.push("first-task");
  if (stats.streak >= 3 && !has("streak-3")) newly.push("streak-3");
  if (stats.streak >= 7 && !has("streak-7")) newly.push("streak-7");
  if (stats.completedCount >= 10 && !has("ten-tasks")) newly.push("ten-tasks");
  if (stats.highPriorityDone && !has("high-priority")) newly.push("high-priority");
  if (stats.categoriesTouched >= 3 && !has("all-categories")) newly.push("all-categories");

  return newly;
}

export function leaderboardSort(
  profiles: { userId: string; name: string; xp: number; level: number }[]
) {
  return [...profiles].sort((a, b) => b.xp - a.xp || b.level - a.level);
}
