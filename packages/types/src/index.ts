/**
 * Reunion OS v4 — Complete Domain Contract
 * Intake → Delivery + Gamification + SEO-ready metadata shapes
 */

export type RoleTier =
  | 'SUPER_ADMIN'
  | 'COMMITTEE_CHAIR'
  | 'COMMITTEE_LEAD'
  | 'VOLUNTEER'
  | 'GUEST'
  | 'VENDOR';

export type AgeTier =
  | 'SENIOR_65_PLUS'
  | 'ADULT_18_64'
  | 'TEEN_17_SUBACCOUNT'
  | 'CHILD_16_UNDER';

export type TaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'REVIEW_NEEDED'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'CANCELLED';

export type DepositStatusType =
  | 'NOT_STARTED'
  | 'PARTIAL'
  | 'CLEARED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'WAIVED';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type BadgeId =
  | 'FIRST_TASK'
  | 'STREAK_3'
  | 'STREAK_7'
  | 'CATEGORY_MASTER'
  | 'ON_TIME'
  | 'PROOF_PRO'
  | 'INTAKE_RUNNER'
  | 'MATRIX_EDITOR'
  | 'DEPOSIT_CLEARED'
  | 'TEAM_PLAYER';

export interface OperationalCategory {
  categoryId: string;
  name: string;
  description: string;
  isCustom: boolean;
  color: string;
  icon?: string;
  parentCategoryId?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialLedgerEntry {
  entryId: string;
  userId: string;
  amount: number;
  currency: 'USD';
  type: 'DEPOSIT' | 'PAYMENT' | 'REFUND' | 'ADJUSTMENT' | 'FEE';
  method: 'CASH' | 'CHECK' | 'ACH' | 'CARD' | 'LAYAWAY' | 'WAIVER';
  note?: string;
  recordedBy: string;
  recordedAt: string;
  relatedTaskId?: string;
}

export interface DepositStatus {
  requiredAmount: number;
  receivedAmount: number;
  remainingBalance: number;
  status: DepositStatusType;
  isCleared: boolean;
  layawayMonthsTotal: number;
  layawayMonthsPaid: number;
  nextDueDate?: string;
  ledger: FinancialLedgerEntry[];
  lastUpdatedAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  preferredName?: string;
  phone?: string;
  ageTier: AgeTier;
  avatarUrl?: string;
  householdId?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface GamificationProfile {
  userId: string;
  points: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  badges: BadgeId[];
  tasksCompleted: number;
  onTimeCompletions: number;
  lastActivityDate?: string;
  updatedAt: string;
}

export interface UserAssignment {
  assignmentId: string;
  userId: string;
  profile: UserProfile;
  title: string;
  roleTier: RoleTier;
  assignedCategories: OperationalCategory[];
  specificResponsibilities: string[];
  depositStatus: DepositStatus;
  gamification?: GamificationProfile;
  notes?: string;
  assignedBy: string;
  assignedAt: string;
  updatedAt: string;
}

export interface TaskComment {
  commentId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  isInternal: boolean;
}

export interface PunchListItem {
  taskId: string;
  title: string;
  description?: string;
  categoryId: string;
  categoryName?: string;
  assignedUserId: string;
  assignedUserName?: string;
  dueDateUtc: string;
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresPhotoProof: boolean;
  requiresReceipt: boolean;
  uploadedProofUrls: string[];
  uploadedReceiptUrls: string[];
  estimatedCost?: number;
  actualCost?: number;
  tags: string[];
  blockedReason?: string;
  pointsValue: number;
  completedAt?: string;
  completedBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  comments: TaskComment[];
}

export interface IntakeAnswer {
  questionId: string;
  value: string | string[] | number | boolean;
}

export interface IntakeSession {
  sessionId: string;
  startedAt: string;
  completedAt?: string;
  answers: IntakeAnswer[];
  generatedCategoryIds: string[];
  generatedTaskIds: string[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  createdBy: string;
}

export interface AuditEvent {
  eventId: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  timestamp: string;
}

export interface Notification {
  notificationId: string;
  userId: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  severity: NotificationSeverity;
  readAt?: string;
  createdAt: string;
  link?: string;
}

export interface SystemHealth {
  totalUsers: number;
  activeAssignments: number;
  openTasks: number;
  overdueTasks: number;
  totalDepositsRequired: number;
  totalDepositsReceived: number;
  categoriesCount: number;
  unreadNotifications: number;
  totalPointsAwarded: number;
  lastSyncAt: string;
}

export interface SessionUser {
  userId: string;
  fullName: string;
  email: string;
  roleTier: RoleTier;
  assignmentId?: string;
}

export interface SeoConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  ogImage: string;
  twitterHandle?: string;
  locale: string;
}

export type CreateCategoryInput = Omit<OperationalCategory, 'categoryId' | 'createdAt' | 'updatedAt'>;
export type CreateTaskInput = Omit<
  PunchListItem,
  | 'taskId'
  | 'createdAt'
  | 'updatedAt'
  | 'comments'
  | 'uploadedProofUrls'
  | 'uploadedReceiptUrls'
  | 'completedAt'
  | 'completedBy'
  | 'reviewedBy'
  | 'reviewedAt'
  | 'pointsValue'
>;
