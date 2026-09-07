import type {
  OperationalCategory,
  UserAssignment,
  PunchListItem,
  Notification,
  UserProfile,
} from '../types';

export const SEED_CATEGORIES: OperationalCategory[] = [
  { id: 'cat-ops', name: 'Operations', description: 'Day-to-day ops & logistics', color: '#3B82F6', order: 1 },
  { id: 'cat-fin', name: 'Finance', description: 'Budget, invoices, reimbursements', color: '#10B981', order: 2 },
  { id: 'cat-hr', name: 'People', description: 'Staffing, onboarding, culture', color: '#8B5CF6', order: 3 },
  { id: 'cat-tech', name: 'Technology', description: 'Systems, tools, integrations', color: '#F59E0B', order: 4 },
  { id: 'cat-mkt', name: 'Marketing', description: 'Brand, campaigns, events', color: '#EF4444', order: 5 },
];

export const SEED_ASSIGNMENTS: UserAssignment[] = [
  {
    id: 'asg-1',
    userId: 'user-demo',
    userName: 'Alex Rivera',
    categoryId: 'cat-ops',
    categoryName: 'Operations',
    role: 'Lead',
    status: 'active',
    startDate: '2025-01-15',
    notes: 'Primary ops owner',
  },
  {
    id: 'asg-2',
    userId: 'user-demo',
    userName: 'Alex Rivera',
    categoryId: 'cat-tech',
    categoryName: 'Technology',
    role: 'Contributor',
    status: 'active',
    startDate: '2025-02-01',
    notes: '',
  },
  {
    id: 'asg-3',
    userId: 'user-sam',
    userName: 'Sam Chen',
    categoryId: 'cat-fin',
    categoryName: 'Finance',
    role: 'Lead',
    status: 'active',
    startDate: '2025-01-10',
    notes: 'Budget owner',
  },
];

export const SEED_PUNCH: PunchListItem[] = [
  {
    id: 'pl-1',
    userId: 'user-demo',
    title: 'Finalize venue contract',
    description: 'Review and sign the main venue agreement',
    categoryId: 'cat-ops',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2025-03-15',
    createdAt: '2025-02-20T10:00:00Z',
    updatedAt: '2025-02-28T14:00:00Z',
  },
  {
    id: 'pl-2',
    userId: 'user-demo',
    title: 'Set up shared drive structure',
    description: 'Folders for each department + permissions',
    categoryId: 'cat-tech',
    status: 'todo',
    priority: 'medium',
    dueDate: '2025-03-01',
    createdAt: '2025-02-22T09:00:00Z',
    updatedAt: '2025-02-22T09:00:00Z',
  },
  {
    id: 'pl-3',
    userId: 'user-demo',
    title: 'Draft opening ceremony run-of-show',
    description: 'Timeline + speaker list',
    categoryId: 'cat-ops',
    status: 'done',
    priority: 'high',
    dueDate: '2025-02-25',
    createdAt: '2025-02-10T11:00:00Z',
    updatedAt: '2025-02-24T16:00:00Z',
  },
  {
    id: 'pl-4',
    userId: 'user-sam',
    title: 'Reconcile Q1 invoices',
    description: 'Match vendor invoices to POs',
    categoryId: 'cat-fin',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2025-03-05',
    createdAt: '2025-02-18T08:00:00Z',
    updatedAt: '2025-02-27T12:00:00Z',
  },
];

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-1',
    userId: 'user-demo',
    title: 'New assignment',
    body: 'You were assigned Lead on Operations',
    type: 'assignment',
    read: false,
    createdAt: '2025-02-28T09:00:00Z',
  },
  {
    id: 'n-2',
    userId: 'user-demo',
    title: 'Punch item due soon',
    body: 'Finalize venue contract is due in 5 days',
    type: 'reminder',
    read: false,
    createdAt: '2025-02-28T08:00:00Z',
  },
  {
    id: 'n-3',
    userId: 'user-demo',
    title: 'Achievement unlocked',
    body: 'First task completed — +50 XP',
    type: 'achievement',
    read: true,
    createdAt: '2025-02-24T16:05:00Z',
  },
];

export const SEED_PROFILES: UserProfile[] = [
  {
    id: 'user-demo',
    name: 'Alex Rivera',
    email: 'alex@reunion.demo',
    role: 'member',
    avatarUrl: null,
    xp: 320,
    level: 3,
    streak: 4,
  },
  {
    id: 'user-sam',
    name: 'Sam Chen',
    email: 'sam@reunion.demo',
    role: 'admin',
    avatarUrl: null,
    xp: 510,
    level: 4,
    streak: 7,
  },
];

export function getSeedPayload() {
  return {
    categories: SEED_CATEGORIES,
    assignments: SEED_ASSIGNMENTS,
    punchItems: SEED_PUNCH,
    notifications: SEED_NOTIFICATIONS,
    profiles: SEED_PROFILES,
  };
}
