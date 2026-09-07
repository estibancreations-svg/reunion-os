/**
 * Demo persistence + domain operations.
 * Swap the internals for Prisma client in production.
 */

import type {
  UserAssignment,
  PunchListItem,
  OperationalCategory,
  Notification,
  TaskStatus,
  IntakeSession,
  IntakeAnswer,
  SystemHealth,
  GamificationProfile,
  Achievement,
  LeaderboardEntry,
  ActivityEvent,
} from "@/types";

const STORAGE_KEY = "reunion-os-v5";

interface StoreState {
  assignments: UserAssignment[];
  punchItems: PunchListItem[];
  categories: OperationalCategory[];
  notifications: Notification[];
  intakeSessions: IntakeSession[];
  health: SystemHealth;
  profiles: GamificationProfile[];
  achievements: Achievement[];
  activity: ActivityEvent[];
  currentUserId: string | null;
}

function defaultState(): StoreState {
  return {
    assignments: [],
    punchItems: [],
    categories: [],
    notifications: [],
    intakeSessions: [],
    health: {
      status: "healthy",
      lastCheck: new Date().toISOString(),
      db: true,
      auth: true,
      api: true,
    },
    profiles: [],
    achievements: [],
    activity: [],
    currentUserId: null,
  };
}

function load(): StoreState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function save(state: StoreState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota
  }
}

let memory: StoreState | null = null;

function getState(): StoreState {
  if (memory) return memory;
  memory = load();
  return memory;
}

function setState(partial: Partial<StoreState>) {
  const next = { ...getState(), ...partial };
  memory = next;
  save(next);
  return next;
}

export const store = {
  getState,
  setState,

  // ——— Auth / session ———
  setCurrentUser(userId: string | null) {
    setState({ currentUserId: userId });
  },
  getCurrentUserId() {
    return getState().currentUserId;
  },

  // ——— Assignments ———
  getAssignments() {
    return getState().assignments;
  },
  upsertAssignment(a: UserAssignment) {
    const list = getState().assignments;
    const idx = list.findIndex((x) => x.id === a.id);
    const next =
      idx >= 0
        ? list.map((x, i) => (i === idx ? a : x))
        : [...list, a];
    setState({ assignments: next });
    return a;
  },
  deleteAssignment(id: string) {
    setState({
      assignments: getState().assignments.filter((x) => x.id !== id),
    });
  },

  // ——— Punch list ———
  getPunchItems(userId?: string) {
    const items = getState().punchItems;
    return userId ? items.filter((i) => i.userId === userId) : items;
  },
  upsertPunchItem(item: PunchListItem) {
    const list = getState().punchItems;
    const idx = list.findIndex((x) => x.id === item.id);
    const next =
      idx >= 0
        ? list.map((x, i) => (i === idx ? item : x))
        : [...list, item];
    setState({ punchItems: next });
    return item;
  },
  updatePunchStatus(id: string, status: TaskStatus) {
    const list = getState().punchItems.map((x) =>
      x.id === id ? { ...x, status, updatedAt: new Date().toISOString() } : x
    );
    setState({ punchItems: list });
  },

  // ——— Categories ———
  getCategories() {
    return getState().categories;
  },
  upsertCategory(c: OperationalCategory) {
    const list = getState().categories;
    const idx = list.findIndex((x) => x.id === c.id);
    const next =
      idx >= 0
        ? list.map((x, i) => (i === idx ? c : x))
        : [...list, c];
    setState({ categories: next });
    return c;
  },

  // ——— Notifications ———
  getNotifications(userId?: string) {
    const n = getState().notifications;
    return userId ? n.filter((x) => x.userId === userId) : n;
  },
  addNotification(n: Notification) {
    setState({ notifications: [n, ...getState().notifications] });
  },
  markNotificationRead(id: string) {
    setState({
      notifications: getState().notifications.map((x) =>
        x.id === id ? { ...x, read: true } : x
      ),
    });
  },

  // ——— Intake ———
  getIntakeSessions() {
    return getState().intakeSessions;
  },
  saveIntakeSession(session: IntakeSession) {
    const list = getState().intakeSessions;
    const idx = list.findIndex((x) => x.id === session.id);
    const next =
      idx >= 0
        ? list.map((x, i) => (i === idx ? session : x))
        : [...list, session];
    setState({ intakeSessions: next });
    return session;
  },

  // ——— Health ———
  getHealth() {
    return getState().health;
  },
  setHealth(h: SystemHealth) {
    setState({ health: h });
  },

  // ——— Gamification ———
  getProfiles() {
    return getState().profiles;
  },
  getProfile(userId: string) {
    return getState().profiles.find((p) => p.userId === userId) ?? null;
  },
  upsertProfile(p: GamificationProfile) {
    const list = getState().profiles;
    const idx = list.findIndex((x) => x.userId === p.userId);
    const next =
      idx >= 0
        ? list.map((x, i) => (i === idx ? p : x))
        : [...list, p];
    setState({ profiles: next });
    return p;
  },
  getAchievements() {
    return getState().achievements;
  },
  unlockAchievement(userId: string, achievementId: string) {
    const list = getState().achievements;
    if (list.some((a) => a.userId === userId && a.id === achievementId))
      return;
    const a: Achievement = {
      id: achievementId,
      userId,
      unlockedAt: new Date().toISOString(),
      title: achievementId,
      description: "",
    };
    setState({ achievements: [...list, a] });
  },

  // ——— Activity ———
  getActivity(limit = 50) {
    return getState().activity.slice(0, limit);
  },
  logActivity(event: Omit<ActivityEvent, "id" | "at">) {
    const e: ActivityEvent = {
      ...event,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      at: new Date().toISOString(),
    };
    setState({ activity: [e, ...getState().activity].slice(0, 200) });
    return e;
  },

  // ——— Seed / reset ———
  seed(data: Partial<StoreState>) {
    setState({ ...getState(), ...data });
  },
  reset() {
    memory = defaultState();
    save(memory);
  },
};

export type { StoreState };
