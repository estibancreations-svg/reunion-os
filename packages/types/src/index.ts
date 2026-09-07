export type TaskStatus =
  | 'TODO'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'todo'
  | 'pending'
  | 'in_progress'
  | 'done'
  | 'completed'
  | 'blocked';

export type RoleTier =
  | 'SUPER_ADMIN'
  | 'COMMITTEE_CHAIR'
  | 'VOLUNTEER'
  | 'GUEST'
  | 'MEMBER';

export type BadgeId =
  | 'first-task'
  | 'streak-3'
  | 'streak-7'
  | 'ten-tasks'
  | 'high-priority'
  | 'all-categories'
  | 'matrix-master';

export interface UserAssignmentCategory {
  categoryId: string;
  name: string;
  color?: string;
}

export interface AssignmentDepositStatus {
  requiredAmount: number;
  receivedAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
}

export interface SessionUser {
  userId: string;
  fullName: string;
  name?: string;
  email?: string;
  roleTier: RoleTier;
  assignmentId?: string;
}

export interface UserAssignment {
  id: string;
  assignmentId?: string;
  userId: string;
  title?: string;
  roleTier?: RoleTier;
  profile?: {
    fullName: string;
    email?: string;
  };
  assignedCategories?: UserAssignmentCategory[];
  depositStatus?: AssignmentDepositStatus;
  gamification?: GamificationProfile;

  // Simplified/demo compatibility fields
  userName?: string;
  categoryId?: string;
  categoryName?: string;
  role?: string;
  status?: string;
  startDate?: string;
  notes?: string;
}

export interface PunchListItem {
  id: string;
  taskId?: string;
  userId: string;
  title: string;
  description?: string;
  categoryId?: string;
  status: TaskStatus;
  priority?: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  uploadedProofUrls?: string[];
  assigneeId?: string | null;
}

export interface OperationalCategory {
  id: string;
  categoryId?: string;
  name: string;
  description?: string;
  color?: string;
  order?: number;
  sortOrder?: number;
  isActive?: boolean;
  isCustom?: boolean;
}

export interface Notification {
  id: string;
  notificationId?: string;
  userId: string;
  title: string;
  body?: string;
  type?: string;
  read?: boolean;
  readAt?: string | null;
  createdAt: string;
  link?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
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
  name?: string;
  fullName?: string;
  xp?: number;
  points: number;
  level: number;
  streak?: number;
  currentStreak: number;
  tasksCompleted: number;
  badges: BadgeId[];
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
  fullName: string;
  name?: string;
  points: number;
  xp?: number;
  level: number;
  tasksCompleted: number;
  badges: number;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  type: string;
  summary: string;
  at: string;
}

export interface AuditEvent {
  eventId: string;
  timestamp: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
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
