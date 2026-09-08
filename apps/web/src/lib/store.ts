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
  SystemHealth,
  GamificationProfile,
  Achievement,
  LeaderboardEntry,
  ActivityEvent,
  BadgeId,
  CommsChannel,
  CommsMessage,
  CommsPresence,
  CommsTypingState,
  SessionUser,
} from '@/types';
import { awardXp, checkAchievements, defaultGamification, levelFromXp, leaderboardSort } from './gamification';
import { getSeedPayload, SEED_PROFILES } from './seed';

const STORAGE_KEY = 'reunion-os-v5';

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
  commsChannels: CommsChannel[];
  commsMessages: CommsMessage[];
  commsPresence: CommsPresence[];
  commsTyping: CommsTypingState[];
}

function defaultState(): StoreState {
  return {
    assignments: [],
    punchItems: [],
    categories: [],
    notifications: [],
    intakeSessions: [],
    health: {
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      db: true,
      auth: true,
      api: true,
    },
    profiles: [],
    achievements: [],
    activity: [],
    currentUserId: null,
    commsChannels: [],
    commsMessages: [],
    commsPresence: [],
    commsTyping: [],
  };
}

function normalizeCategory(c: OperationalCategory): OperationalCategory {
  return {
    ...c,
    id: c.id ?? c.categoryId ?? `cat-${Date.now()}`,
    categoryId: c.categoryId ?? c.id,
    sortOrder: c.sortOrder ?? c.order ?? 0,
    order: c.order ?? c.sortOrder ?? 0,
    color: c.color ?? '#C84B31',
    isActive: c.isActive ?? true,
    isCustom: c.isCustom ?? false,
  };
}

function normalizeAssignment(a: UserAssignment): UserAssignment {
  const id = a.assignmentId ?? a.id;
  const categoryId = a.categoryId ?? a.assignedCategories?.[0]?.categoryId ?? 'cat-ops';
  const categoryName =
    a.categoryName ?? a.assignedCategories?.[0]?.name ?? (categoryId === 'cat-ops' ? 'Operations' : categoryId);

  return {
    ...a,
    id,
    assignmentId: id,
    roleTier: a.roleTier ?? ((a.role?.toUpperCase().replace(/\s+/g, '_') as UserAssignment['roleTier']) ?? 'VOLUNTEER'),
    title: a.title ?? a.role ?? 'Contributor',
    profile: a.profile ?? {
      fullName: a.userName ?? a.userId,
      email: `${a.userId}@reunion.demo`,
    },
    assignedCategories:
      a.assignedCategories ??
      [{
        categoryId,
        name: categoryName,
        color: '#C84B31',
      }],
    categoryId,
    categoryName,
    depositStatus: a.depositStatus ?? {
      requiredAmount: 0,
      receivedAmount: 0,
      status: 'PAID',
    },
  };
}

function normalizeTask(item: PunchListItem): PunchListItem {
  const id = item.taskId ?? item.id;
  return {
    ...item,
    id,
    taskId: id,
    status: item.status ?? 'TODO',
    uploadedProofUrls: item.uploadedProofUrls ?? [],
    updatedAt: item.updatedAt ?? new Date().toISOString(),
    createdAt: item.createdAt ?? new Date().toISOString(),
  };
}

function normalizeNotification(n: Notification): Notification {
  const id = n.notificationId ?? n.id;
  const read = n.read ?? Boolean(n.readAt);
  return {
    ...n,
    id,
    notificationId: id,
    severity: n.severity ?? 'INFO',
    read,
    readAt: n.readAt ?? (read ? n.createdAt : null),
  };
}

function normalizeProfile(p: Partial<GamificationProfile> & { userId: string }): GamificationProfile {
  const points = p.points ?? p.xp ?? 0;
  const currentStreak = p.currentStreak ?? p.streak ?? 0;
  const badges = (p.badges ?? []) as BadgeId[];
  return {
    ...defaultGamification(p.userId, p.fullName ?? p.name),
    ...p,
    points,
    xp: points,
    level: p.level ?? levelFromXp(points),
    currentStreak,
    streak: currentStreak,
    tasksCompleted: p.tasksCompleted ?? 0,
    badges,
  };
}

function normalizeCommsChannel(channel: CommsChannel): CommsChannel {
  return {
    ...channel,
    description: channel.description ?? '',
    memberUserIds: Array.from(new Set(channel.memberUserIds.filter(Boolean))),
    lastMessageAt: channel.lastMessageAt ?? new Date().toISOString(),
  };
}

function normalizeCommsMessage(message: CommsMessage): CommsMessage {
  return {
    ...message,
    mentions: message.mentions ?? [],
    readByUserIds: Array.from(new Set(message.readByUserIds ?? [])),
    createdAt: message.createdAt ?? new Date().toISOString(),
    type: message.type ?? 'text',
  };
}

function seedFromDefaults(state: StoreState): StoreState {
  const seed = getSeedPayload();
  const assignments = (
    state.assignments.length > 0 ? state.assignments : seed.assignments
  ).map((a) => normalizeAssignment(a));
  const categories = (
    state.categories.length > 0 ? state.categories : seed.categories
  ).map((c) => normalizeCategory(c));
  const punchItems = (
    state.punchItems.length > 0 ? state.punchItems : seed.punchItems
  ).map((t) => normalizeTask(t));
  const notifications = (
    state.notifications.length > 0 ? state.notifications : seed.notifications
  ).map((n) => normalizeNotification(n));
  const profiles = (
    state.profiles.length > 0
      ? state.profiles
      : SEED_PROFILES.map((p) => ({
          userId: p.id,
          fullName: p.name,
          points: p.xp ?? 0,
          level: p.level,
          currentStreak: p.streak ?? 0,
          tasksCompleted: punchItems.filter(
            (x) =>
              x.userId === p.id &&
              (x.status === 'done' ||
                x.status === 'completed' ||
                x.status === 'DONE' ||
                x.status === 'COMPLETED')
          ).length,
        }))
  ).map((p) => normalizeProfile(p));

  const knownUsers = Array.from(new Set(assignments.map((a) => a.userId))).filter(Boolean);
  const commsChannels: CommsChannel[] =
    state.commsChannels.length > 0
      ? state.commsChannels.map((c) => normalizeCommsChannel(c))
      : [
          normalizeCommsChannel({
            id: 'ch-general',
            name: 'Family HQ',
            description: 'Primary coordination channel for all members.',
            memberUserIds: knownUsers,
            lastMessageAt: new Date().toISOString(),
          }),
          normalizeCommsChannel({
            id: 'ch-ops',
            name: 'Operations Crew',
            description: 'Logistics and execution updates.',
            memberUserIds: knownUsers,
            lastMessageAt: new Date().toISOString(),
          }),
        ];

  const commsPresence: CommsPresence[] =
    state.commsPresence.length > 0
      ? state.commsPresence
      : assignments.map((a, idx) => ({
          userId: a.userId,
          userName: a.profile?.fullName ?? a.userName ?? a.userId,
          status: idx === 0 ? 'online' : 'away',
          updatedAt: new Date().toISOString(),
        }));

  const commsMessages: CommsMessage[] =
    state.commsMessages.length > 0
      ? state.commsMessages.map((m) => normalizeCommsMessage(m))
      : [
          normalizeCommsMessage({
            id: 'msg-seed-1',
            channelId: 'ch-general',
            senderUserId: knownUsers[0] ?? 'user-demo',
            senderName: assignments[0]?.profile?.fullName ?? 'Coordinator',
            type: 'text',
            body: 'Welcome to Reunion OS Comms. Use this thread for fast coordination.',
            mentions: [],
            createdAt: new Date().toISOString(),
            readByUserIds: knownUsers,
          }),
        ];

  return {
    ...state,
    assignments,
    categories,
    punchItems,
    notifications,
    profiles,
    commsChannels,
    commsMessages,
    commsPresence,
    commsTyping: state.commsTyping ?? [],
  };
}

function load(): StoreState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedFromDefaults(defaultState());
    const parsed = { ...defaultState(), ...JSON.parse(raw) } as StoreState;
    parsed.assignments = parsed.assignments.map((a) => normalizeAssignment(a));
    parsed.categories = parsed.categories.map((c) => normalizeCategory(c));
    parsed.punchItems = parsed.punchItems.map((t) => normalizeTask(t));
    parsed.notifications = parsed.notifications.map((n) => normalizeNotification(n));
    parsed.profiles = parsed.profiles.map((p) => normalizeProfile(p));
    parsed.commsChannels = (parsed.commsChannels ?? []).map((c) => normalizeCommsChannel(c));
    parsed.commsMessages = (parsed.commsMessages ?? []).map((m) => normalizeCommsMessage(m));
    parsed.commsPresence = parsed.commsPresence ?? [];
    parsed.commsTyping = parsed.commsTyping ?? [];
    return seedFromDefaults(parsed);
  } catch {
    return seedFromDefaults(defaultState());
  }
}

function save(state: StoreState) {
  if (typeof window === 'undefined') return;
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

  setCurrentUser(userId: string | null) {
    setState({ currentUserId: userId });
  },
  getCurrentUserId() {
    return getState().currentUserId;
  },

  getAssignments() {
    return getState().assignments;
  },
  upsertAssignment(a: UserAssignment) {
    const normalized = normalizeAssignment(a);
    const list = getState().assignments;
    const idx = list.findIndex((x) => (x.assignmentId ?? x.id) === normalized.assignmentId);
    const next = idx >= 0 ? list.map((x, i) => (i === idx ? normalized : x)) : [...list, normalized];
    setState({ assignments: next });
    return normalized;
  },
  deleteAssignment(id: string) {
    setState({
      assignments: getState().assignments.filter((x) => (x.assignmentId ?? x.id) !== id),
    });
  },

  getPunchItems(userId?: string) {
    const items = getState().punchItems;
    return userId ? items.filter((i) => i.userId === userId) : items;
  },
  upsertPunchItem(item: PunchListItem) {
    const normalized = normalizeTask(item);
    const list = getState().punchItems;
    const idx = list.findIndex((x) => (x.taskId ?? x.id) === normalized.taskId);
    const next = idx >= 0 ? list.map((x, i) => (i === idx ? normalized : x)) : [...list, normalized];
    setState({ punchItems: next });
    return normalized;
  },
  updatePunchStatus(id: string, status: TaskStatus) {
    const list = getState().punchItems.map((x) =>
      (x.taskId ?? x.id) === id ? { ...x, status, updatedAt: new Date().toISOString() } : x
    );
    setState({ punchItems: list });
  },

  getCategories() {
    return getState().categories;
  },
  upsertCategory(c: OperationalCategory) {
    const normalized = normalizeCategory(c);
    const list = getState().categories;
    const idx = list.findIndex((x) => (x.categoryId ?? x.id) === normalized.categoryId);
    const next = idx >= 0 ? list.map((x, i) => (i === idx ? normalized : x)) : [...list, normalized];
    setState({ categories: next });
    return normalized;
  },

  getNotifications(userId?: string) {
    const n = getState().notifications;
    return userId ? n.filter((x) => x.userId === userId) : n;
  },
  addNotification(n: Notification) {
    setState({ notifications: [normalizeNotification(n), ...getState().notifications] });
  },
  markNotificationRead(id: string) {
    setState({
      notifications: getState().notifications.map((x) =>
        (x.notificationId ?? x.id) === id ? { ...x, read: true, readAt: new Date().toISOString() } : x
      ),
    });
  },

  getIntakeSessions() {
    return getState().intakeSessions;
  },
  saveIntakeSession(session: IntakeSession) {
    const list = getState().intakeSessions;
    const idx = list.findIndex((x) => x.id === session.id);
    const next = idx >= 0 ? list.map((x, i) => (i === idx ? session : x)) : [...list, session];
    setState({ intakeSessions: next });
    return session;
  },

  getHealth() {
    return getState().health;
  },
  setHealth(h: SystemHealth) {
    setState({ health: h });
  },

  getProfiles() {
    return getState().profiles;
  },
  getProfile(userId: string) {
    return getState().profiles.find((p) => p.userId === userId) ?? null;
  },
  upsertProfile(p: GamificationProfile) {
    const normalized = normalizeProfile(p);
    const list = getState().profiles;
    const idx = list.findIndex((x) => x.userId === normalized.userId);
    const next = idx >= 0 ? list.map((x, i) => (i === idx ? normalized : x)) : [...list, normalized];
    setState({ profiles: next });
    return normalized;
  },
  getAchievements() {
    return getState().achievements;
  },
  unlockAchievement(userId: string, achievementId: string) {
    const list = getState().achievements;
    if (list.some((a) => a.userId === userId && a.id === achievementId)) return;
    const a: Achievement = {
      id: achievementId,
      userId,
      unlockedAt: new Date().toISOString(),
      title: achievementId,
      description: '',
    };
    setState({ achievements: [...list, a] });
  },

  getActivity(limit = 50) {
    return getState().activity.slice(0, limit);
  },
  logActivity(event: Omit<ActivityEvent, 'id' | 'at'>) {
    const e: ActivityEvent = {
      ...event,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      at: new Date().toISOString(),
    };
    setState({ activity: [e, ...getState().activity].slice(0, 200) });
    return e;
  },

  getCommsChannels() {
    return getState().commsChannels;
  },
  upsertCommsChannel(channel: CommsChannel) {
    const normalized = normalizeCommsChannel(channel);
    const list = getState().commsChannels;
    const idx = list.findIndex((x) => x.id === normalized.id);
    const next = idx >= 0 ? list.map((x, i) => (i === idx ? normalized : x)) : [...list, normalized];
    setState({ commsChannels: next });
    return normalized;
  },
  getCommsMessages(channelId: string) {
    return getState().commsMessages
      .filter((x) => x.channelId === channelId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  addCommsMessage(message: CommsMessage) {
    const normalized = normalizeCommsMessage(message);
    const nextMessages = [...getState().commsMessages, normalized];
    const nextChannels = getState().commsChannels.map((channel) =>
      channel.id === normalized.channelId
        ? { ...channel, lastMessageAt: normalized.createdAt }
        : channel
    );
    setState({ commsMessages: nextMessages, commsChannels: nextChannels });
    return normalized;
  },
  setCommsPresence(userId: string, userName: string, status: CommsPresence['status']) {
    const list = getState().commsPresence;
    const next = [
      ...list.filter((x) => x.userId !== userId),
      { userId, userName, status, updatedAt: new Date().toISOString() },
    ];
    setState({ commsPresence: next });
  },
  getCommsPresence() {
    return getState().commsPresence;
  },
  setTypingState(channelId: string, userId: string, userName: string, isTyping: boolean) {
    if (!isTyping) {
      setState({
        commsTyping: getState().commsTyping.filter((x) => !(x.channelId === channelId && x.userId === userId)),
      });
      return;
    }
    const current = getState().commsTyping.filter((x) => !(x.channelId === channelId && x.userId === userId));
    current.push({ channelId, userId, userName, updatedAt: new Date().toISOString() });
    setState({ commsTyping: current });
  },
  getTypingState(channelId: string, exceptUserId?: string) {
    const now = Date.now();
    const active = getState().commsTyping.filter(
      (x) =>
        x.channelId === channelId &&
        (!exceptUserId || x.userId !== exceptUserId) &&
        now - new Date(x.updatedAt).getTime() < 6000
    );
    if (active.length !== getState().commsTyping.length) {
      setState({ commsTyping: getState().commsTyping.filter((x) => now - new Date(x.updatedAt).getTime() < 6000) });
    }
    return active;
  },
  markChannelRead(channelId: string, userId: string) {
    const next = getState().commsMessages.map((m) => {
      if (m.channelId !== channelId) return m;
      if (m.readByUserIds.includes(userId)) return m;
      return { ...m, readByUserIds: [...m.readByUserIds, userId] };
    });
    setState({ commsMessages: next });
  },
  getUnreadCount(userId: string, channelId?: string) {
    return getState().commsMessages.filter((m) => {
      if (channelId && m.channelId !== channelId) return false;
      if (m.senderUserId === userId) return false;
      return !m.readByUserIds.includes(userId);
    }).length;
  },

  seed(data: Partial<StoreState>) {
    setState({ ...getState(), ...data });
  },
  reset() {
    memory = seedFromDefaults(defaultState());
    save(memory);
  },
};

export function getAssignments() {
  return store.getAssignments();
}

export function saveAssignment(assignment: UserAssignment) {
  store.upsertAssignment(assignment);
  return getAssignments();
}

export function getCategories() {
  return store.getCategories();
}

export function getAllTasks() {
  return store.getPunchItems();
}

export function updateTask(taskId: string, patch: Partial<PunchListItem>) {
  const current = getAllTasks().find((t) => (t.taskId ?? t.id) === taskId);
  if (!current) return null;
  return store.upsertPunchItem({ ...current, ...patch, id: current.id, taskId: current.taskId ?? current.id });
}

export function updateTaskStatus(taskId: string, status: TaskStatus, userId?: string) {
  store.updatePunchStatus(taskId, status);
  if (userId) {
    store.logActivity({
      userId,
      type: 'task_status',
      summary: `Updated ${taskId} to ${status}`,
    });
  }
}

function isTaskDone(status: TaskStatus) {
  return ['done', 'completed', 'DONE', 'COMPLETED'].includes(status);
}

export function getAssignmentForUser(userId: string) {
  return getAssignments().find((a) => a.userId === userId) ?? null;
}

export function getConvergedPunchList(userId: string) {
  const assignment = getAssignmentForUser(userId);
  const categoryIds = new Set((assignment?.assignedCategories ?? []).map((c) => c.categoryId));
  return getAllTasks().filter((task) => {
    if (task.userId === userId) return true;
    return !task.userId && Boolean(task.categoryId && categoryIds.has(task.categoryId));
  });
}

export function getGamification(userId: string) {
  return (
    store.getProfile(userId) ??
    defaultGamification(userId, getAssignmentForUser(userId)?.profile?.fullName)
  );
}

export function grantMatrixEditorBadge(userId: string) {
  const profile = getGamification(userId);
  if (!profile.badges.includes('matrix-master')) {
    const updated = normalizeProfile({ ...profile, badges: [...profile.badges, 'matrix-master'] });
    store.upsertProfile(updated);
  }
}

export function completeTaskWithRewards(taskId: string, userId: string, fullName: string) {
  const task = getAllTasks().find((t) => (t.taskId ?? t.id) === taskId);
  if (!task) return { profile: getGamification(userId), unlocked: [] as BadgeId[] };

  updateTaskStatus(taskId, 'COMPLETED', userId);

  const current = getGamification(userId);
  const points = awardXp(current.points, {
    completed: true,
    highPriority: (task.priority ?? '').toLowerCase() === 'high',
    streakDay: true,
  });

  const completed = getAllTasks().filter((x) => x.userId === userId && isTaskDone(x.status));
  const categoriesTouched = new Set(completed.map((x) => x.categoryId).filter(Boolean)).size;
  const currentStreak = current.currentStreak + 1;

  const unlocked = checkAchievements(
    {
      completedCount: completed.length,
      streak: currentStreak,
      highPriorityDone: completed.some((x) => (x.priority ?? '').toLowerCase() === 'high'),
      categoriesTouched,
    },
    current.badges
  );

  const nextProfile = normalizeProfile({
    ...current,
    userId,
    fullName,
    name: fullName,
    points,
    currentStreak,
    streak: currentStreak,
    tasksCompleted: completed.length,
    badges: Array.from(new Set([...current.badges, ...unlocked])) as BadgeId[],
  });

  store.upsertProfile(nextProfile);

  unlocked.forEach((badge) => {
    store.addNotification({
      id: `notif-${Date.now()}-${badge}`,
      userId,
      title: 'Achievement unlocked',
      body: badge,
      type: 'achievement',
      severity: 'INFO',
      read: false,
      createdAt: new Date().toISOString(),
    });
  });

  return { profile: nextProfile, unlocked };
}

export function getSystemHealth(_userId?: string) {
  return store.getHealth();
}

export function getNotifications(userId: string) {
  return store.getNotifications(userId);
}

export function markNotificationRead(notificationId: string) {
  store.markNotificationRead(notificationId);
}

export function getLeaderboard(): LeaderboardEntry[] {
  const assignmentsByUser = new Map(getAssignments().map((a) => [a.userId, a]));
  const rows = store.getProfiles().map((p) => {
    const assignment = assignmentsByUser.get(p.userId);
    return {
      userId: p.userId,
      fullName: assignment?.profile?.fullName ?? p.fullName ?? p.name ?? p.userId,
      name: p.name ?? p.fullName,
      points: p.points,
      xp: p.xp ?? p.points,
      level: p.level,
      tasksCompleted: p.tasksCompleted,
      badges: p.badges.length,
    };
  });

  return leaderboardSort(rows.map((r) => ({ userId: r.userId, name: r.fullName, points: r.points, level: r.level })))
    .map((sorted) => rows.find((row) => row.userId === sorted.userId)!)
    .filter(Boolean);
}

export function getCommsChannels() {
  return [...store.getCommsChannels()].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

export function getCommsMessages(channelId: string) {
  return store.getCommsMessages(channelId);
}

export function sendCommsText(channelId: string, user: SessionUser, body: string, mentions: string[] = []) {
  const trimmed = body.trim();
  if (!trimmed) return null;
  const message = store.addCommsMessage({
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    channelId,
    senderUserId: user.userId,
    senderName: user.fullName ?? user.name ?? user.userId,
    type: 'text',
    body: trimmed,
    mentions,
    createdAt: new Date().toISOString(),
    readByUserIds: [user.userId],
  });
  store.logActivity({
    userId: user.userId,
    type: 'comms_text',
    summary: `Sent chat message in ${channelId}`,
  });
  return message;
}

export function sendCommsChirp(
  channelId: string,
  user: SessionUser,
  audioUrl: string,
  durationSec?: number
) {
  const message = store.addCommsMessage({
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    channelId,
    senderUserId: user.userId,
    senderName: user.fullName ?? user.name ?? user.userId,
    type: 'chirp',
    audioUrl,
    durationSec,
    createdAt: new Date().toISOString(),
    readByUserIds: [user.userId],
  });
  store.logActivity({
    userId: user.userId,
    type: 'comms_chirp',
    summary: `Sent chirp in ${channelId}`,
  });
  return message;
}

export function setCommsPresence(user: SessionUser, status: CommsPresence['status']) {
  store.setCommsPresence(user.userId, user.fullName ?? user.name ?? user.userId, status);
}

export function getCommsPresence() {
  return store.getCommsPresence();
}

export function setCommsTyping(channelId: string, user: SessionUser, isTyping: boolean) {
  store.setTypingState(channelId, user.userId, user.fullName ?? user.name ?? user.userId, isTyping);
}

export function getCommsTyping(channelId: string, userId?: string) {
  return store.getTypingState(channelId, userId);
}

export function markCommsRead(channelId: string, userId: string) {
  store.markChannelRead(channelId, userId);
}

export function getCommsUnreadCount(userId: string, channelId?: string) {
  return store.getUnreadCount(userId, channelId);
}

export type { StoreState };
