export type TaskStatus = 'todo' | 'pending' | 'in_progress' | 'done' | 'completed' | 'blocked';

export interface UserAssignment {
  id: string;
  userId: string;
  userName?: string;
  categoryId: string;
  categoryName?: string;
  role?: string;
  status?: string;
  startDate?: string;
  notes?: string;
}

export interface PunchListItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  categoryId?: string;
  status: TaskStatus;
  priority?: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OperationalCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body?: string;
  type?: string;
  read: boolean;
  createdAt: string;
}

export interface IntakeSession {
  id: string;
  userId: string;
  answers: { questionId: string; value: unknown }[];
  createdAt: string;
  status: string;
}

export interface IntakeAnswer {
  questionId: string;
  value: unknown;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
  db?: boolean;
  auth?: boolean;
  api?: boolean;
}

export interface GamificationProfile {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  name?: string;
}

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description?: string;
  unlockedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  xp: number;
  level: number;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  type: string;
  summary: string;
  at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  xp?: number;
  level?: number;
  streak?: number;
}
