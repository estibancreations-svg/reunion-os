import type {
  OperationalCategory,
  UserAssignment,
  PunchListItem,
  Notification,
  UserProfile,
} from '../types';

export const SEED_CATEGORIES: OperationalCategory[] = [
  { categoryId: 'cat-food', name: 'Food & Catering', description: 'Catering, ice, dietary needs', isCustom: false, color: '#C84B31', icon: 'utensils', sortOrder: 1, isActive: true, createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z' },
  { categoryId: 'cat-dance', name: 'Dance & Entertainment', description: 'DJ, talent show, playlists', isCustom: false, color: '#7C3AED', icon: 'music', sortOrder: 2, isActive: true, createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z' },
  { categoryId: 'cat-kids', name: 'Kids Hats & Crafts', description: 'Children activities & supplies', isCustom: false, color: '#059669', icon: 'palette', sortOrder: 3, isActive: true, createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z' },
  { categoryId: 'cat-venue', name: 'Venue & Logistics', description: 'Pavilion, parking, load-in', isCustom: false, color: '#2563EB', icon: 'map-pin', sortOrder: 4, isActive: true, createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z' },
  { categoryId: 'cat-finance', name: 'Finance & Deposits', description: 'Dues, budgets, vendor payments', isCustom: false, color: '#D97706', icon: 'dollar', sortOrder: 5, isActive: true, createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z' },
  { categoryId: 'cat-security', name: 'Security & Health', description: 'First aid, security, emergency', isCustom: false, color: '#DC2626', icon: 'shield', sortOrder: 6, isActive: true, createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z' },
  { categoryId: 'cat-punch', name: 'Master Punch-List', description: 'Cross-cutting checklist items', isCustom: false, color: '#4B5563', icon: 'check', sortOrder: 7, isActive: true, createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z' },
];

const profiles: Record<string, UserProfile> = {
  'usr-admin': { userId: 'usr-admin', email: 'admin@reunion.family', fullName: 'Alex Admin', ageTier: 'ADULT_18_64', isActive: true, createdAt: '2025-10-01T08:00:00Z', lastLoginAt: '2026-08-12T12:00:00Z' },
  'usr-sarah': { userId: 'usr-sarah', email: 'sarah.henry@family.example', fullName: 'Sarah Henry', preferredName: 'Sarah', phone: '+1-555-0101', ageTier: 'ADULT_18_64', isActive: true, createdAt: '2025-11-01T08:00:00Z', lastLoginAt: '2026-08-11T14:22:00Z' },
  'usr-marcus': { userId: 'usr-marcus', email: 'marcus.henry@family.example', fullName: 'Marcus Henry', preferredName: 'Marcus', phone: '+1-555-0102', ageTier: 'ADULT_18_64', isActive: true, createdAt: '2025-11-01T08:00:00Z', lastLoginAt: '2026-08-10T09:15:00Z' },
  'usr-david': { userId: 'usr-david', email: 'david.henry@family.example', fullName: 'David Henry', preferredName: 'David', phone: '+1-555-0103', ageTier: 'ADULT_18_64', isActive: true, createdAt: '2025-11-01T08:00:00Z', lastLoginAt: '2026-08-12T07:40:00Z' },
  'usr-elena': { userId: 'usr-elena', email: 'elena.henry@family.example', fullName: 'Elena Henry', preferredName: 'Elena', ageTier: 'ADULT_18_64', isActive: true, createdAt: '2025-12-15T10:00:00Z' },
  'usr-james': { userId: 'usr-james', email: 'james.henry@family.example', fullName: 'James Henry', preferredName: 'Jamie', ageTier: 'TEEN_17_SUBACCOUNT', isActive: true, createdAt: '2026-02-01T12:00:00Z' },
};

const emptyDeposit = (cleared: boolean, required = 500, received = 0) => ({
  requiredAmount: required,
  receivedAmount: received,
  remainingBalance: required - received,
  status: cleared ? ('CLEARED' as const) : received > 0 ? ('PARTIAL' as const) : ('NOT_STARTED' as const),
  isCleared: cleared,
  layawayMonthsTotal: 0,
  layawayMonthsPaid: 0,
  ledger: [] as [],
  lastUpdatedAt: '2026-01-01T00:00:00Z',
});

export const SEED_ASSIGNMENTS: UserAssignment[] = [
  {
    assignmentId: 'asg-admin', userId: 'usr-admin', profile: profiles['usr-admin'], title: 'Super Administrator', roleTier: 'SUPER_ADMIN',
    assignedCategories: SEED_CATEGORIES, specificResponsibilities: ['Full system ownership'],
    depositStatus: emptyDeposit(true, 0, 0),
    assignedBy: 'usr-admin', assignedAt: '2025-10-01T08:00:00Z', updatedAt: '2026-08-01T00:00:00Z',
  },
  {
    assignmentId: 'asg-001', userId: 'usr-sarah', profile: profiles['usr-sarah'], title: 'Catering Chair & Kids Crafts Lead', roleTier: 'COMMITTEE_CHAIR',
    assignedCategories: [SEED_CATEGORIES[0], SEED_CATEGORIES[2]],
    specificResponsibilities: ['Manage dinner caterer', 'Procure craft supplies', 'Dietary matrix', 'Ice logistics'],
    depositStatus: emptyDeposit(true, 500, 500),
    assignedBy: 'usr-admin', assignedAt: '2026-01-20T09:00:00Z', updatedAt: '2026-07-15T16:30:00Z',
  },
  {
    assignmentId: 'asg-002', userId: 'usr-marcus', profile: profiles['usr-marcus'], title: 'Entertainment Lead', roleTier: 'COMMITTEE_LEAD',
    assignedCategories: [SEED_CATEGORIES[1]],
    specificResponsibilities: ['DJ & sound setup', 'Talent show run-of-show'],
    depositStatus: { ...emptyDeposit(false, 500, 220), layawayMonthsTotal: 36, layawayMonthsPaid: 4, nextDueDate: '2026-09-01' },
    assignedBy: 'usr-admin', assignedAt: '2026-01-22T11:00:00Z', updatedAt: '2026-07-01T10:00:00Z',
  },
  {
    assignmentId: 'asg-003', userId: 'usr-david', profile: profiles['usr-david'], title: 'Logistics Lead', roleTier: 'COMMITTEE_LEAD',
    assignedCategories: [SEED_CATEGORIES[3], SEED_CATEGORIES[6]],
    specificResponsibilities: ['Pavilion deposit', 'Parking passes', 'Master punch-list'],
    depositStatus: emptyDeposit(true, 500, 500),
    assignedBy: 'usr-admin', assignedAt: '2026-01-18T14:00:00Z', updatedAt: '2026-06-20T09:45:00Z',
  },
  {
    assignmentId: 'asg-004', userId: 'usr-elena', profile: profiles['usr-elena'], title: 'Finance Coordinator', roleTier: 'COMMITTEE_LEAD',
    assignedCategories: [SEED_CATEGORIES[4]],
    specificResponsibilities: ['Track deposits', 'Vendor payments'],
    depositStatus: emptyDeposit(true, 500, 500),
    assignedBy: 'usr-admin', assignedAt: '2026-02-01T10:00:00Z', updatedAt: '2026-05-01T12:00:00Z',
  },
  {
    assignmentId: 'asg-005', userId: 'usr-james', profile: profiles['usr-james'], title: 'Youth Volunteer', roleTier: 'VOLUNTEER',
    assignedCategories: [SEED_CATEGORIES[1], SEED_CATEGORIES[2]],
    specificResponsibilities: ['Assist talent show setup'],
    depositStatus: emptyDeposit(true, 0, 0),
    assignedBy: 'usr-admin', assignedAt: '2026-02-05T16:00:00Z', updatedAt: '2026-02-05T16:00:00Z',
  },
];

export const SEED_TASKS: PunchListItem[] = [
  { taskId: 'tsk-001', title: 'Finalize catering contract with Rosewood Kitchen', description: 'Sign SOW, confirm headcount.', categoryId: 'cat-food', categoryName: 'Food & Catering', assignedUserId: 'usr-sarah', assignedUserName: 'Sarah Henry', dueDateUtc: '2026-08-20T17:00:00Z', status: 'IN_PROGRESS', priority: 'HIGH', requiresPhotoProof: false, requiresReceipt: true, uploadedProofUrls: [], uploadedReceiptUrls: [], estimatedCost: 4200, pointsValue: 30, tags: ['contract'], createdAt: '2026-06-01T09:00:00Z', updatedAt: '2026-08-05T14:20:00Z', comments: [] },
  { taskId: 'tsk-002', title: 'Order ice (200 lbs) for beverage station', categoryId: 'cat-food', categoryName: 'Food & Catering', assignedUserId: 'usr-sarah', assignedUserName: 'Sarah Henry', dueDateUtc: '2026-08-25T12:00:00Z', status: 'PENDING', priority: 'MEDIUM', requiresPhotoProof: true, requiresReceipt: true, uploadedProofUrls: [], uploadedReceiptUrls: [], estimatedCost: 180, pointsValue: 20, tags: ['logistics'], createdAt: '2026-07-10T11:00:00Z', updatedAt: '2026-07-10T11:00:00Z', comments: [] },
  { taskId: 'tsk-003', title: 'Procure craft supplies & sizing table', categoryId: 'cat-kids', categoryName: 'Kids Hats & Crafts', assignedUserId: 'usr-sarah', assignedUserName: 'Sarah Henry', dueDateUtc: '2026-08-18T17:00:00Z', status: 'REVIEW_NEEDED', priority: 'MEDIUM', requiresPhotoProof: true, requiresReceipt: true, uploadedProofUrls: [], uploadedReceiptUrls: [], estimatedCost: 320, pointsValue: 20, tags: ['supplies'], createdAt: '2026-06-15T10:00:00Z', updatedAt: '2026-08-08T16:45:00Z', comments: [] },
  { taskId: 'tsk-004', title: 'Sound check & DJ tech rider confirmation', categoryId: 'cat-dance', categoryName: 'Dance & Entertainment', assignedUserId: 'usr-marcus', assignedUserName: 'Marcus Henry', dueDateUtc: '2026-08-22T15:00:00Z', status: 'PENDING', priority: 'HIGH', requiresPhotoProof: false, requiresReceipt: false, uploadedProofUrls: [], uploadedReceiptUrls: [], pointsValue: 30, tags: ['tech'], createdAt: '2026-07-01T09:00:00Z', updatedAt: '2026-07-01T09:00:00Z', comments: [] },
  { taskId: 'tsk-005', title: 'Build talent show run-of-show & MC script', categoryId: 'cat-dance', categoryName: 'Dance & Entertainment', assignedUserId: 'usr-marcus', assignedUserName: 'Marcus Henry', dueDateUtc: '2026-08-15T17:00:00Z', status: 'IN_PROGRESS', priority: 'HIGH', requiresPhotoProof: false, requiresReceipt: false, uploadedProofUrls: [], uploadedReceiptUrls: [], pointsValue: 30, tags: ['programming'], createdAt: '2026-06-20T13:00:00Z', updatedAt: '2026-08-09T11:30:00Z', comments: [] },
  { taskId: 'tsk-006', title: 'Youth basketball bracket & court reservation', categoryId: 'cat-dance', categoryName: 'Dance & Entertainment', assignedUserId: 'usr-marcus', assignedUserName: 'Marcus Henry', dueDateUtc: '2026-08-10T12:00:00Z', status: 'COMPLETED', priority: 'MEDIUM', requiresPhotoProof: true, requiresReceipt: false, uploadedProofUrls: [], uploadedReceiptUrls: [], completedAt: '2026-08-08T18:00:00Z', completedBy: 'usr-marcus', pointsValue: 20, tags: ['youth'], createdAt: '2026-06-25T10:00:00Z', updatedAt: '2026-08-08T18:00:00Z', comments: [] },
  { taskId: 'tsk-007', title: 'Pavilion deposit & final site map approval', categoryId: 'cat-venue', categoryName: 'Venue & Logistics', assignedUserId: 'usr-david', assignedUserName: 'David Henry', dueDateUtc: '2026-07-30T17:00:00Z', status: 'COMPLETED', priority: 'CRITICAL', requiresPhotoProof: true, requiresReceipt: true, uploadedProofUrls: [], uploadedReceiptUrls: [], estimatedCost: 2500, actualCost: 2500, completedAt: '2026-07-28T14:00:00Z', completedBy: 'usr-david', pointsValue: 50, tags: ['venue'], createdAt: '2026-05-01T09:00:00Z', updatedAt: '2026-07-28T14:00:00Z', comments: [] },
  { taskId: 'tsk-008', title: 'Print & distribute parking passes', categoryId: 'cat-venue', categoryName: 'Venue & Logistics', assignedUserId: 'usr-david', assignedUserName: 'David Henry', dueDateUtc: '2026-08-20T12:00:00Z', status: 'PENDING', priority: 'MEDIUM', requiresPhotoProof: true, requiresReceipt: false, uploadedProofUrls: [], uploadedReceiptUrls: [], estimatedCost: 85, pointsValue: 20, tags: ['logistics'], createdAt: '2026-07-15T10:00:00Z', updatedAt: '2026-07-15T10:00:00Z', comments: [] },
  { taskId: 'tsk-009', title: 'Site load-in schedule & volunteer roster', categoryId: 'cat-punch', categoryName: 'Master Punch-List', assignedUserId: 'usr-david', assignedUserName: 'David Henry', dueDateUtc: '2026-08-12T17:00:00Z', status: 'REVIEW_NEEDED', priority: 'HIGH', requiresPhotoProof: false, requiresReceipt: false, uploadedProofUrls: [], uploadedReceiptUrls: [], pointsValue: 30, tags: ['operations'], createdAt: '2026-07-01T09:00:00Z', updatedAt: '2026-08-10T15:00:00Z', comments: [] },
  { taskId: 'tsk-010', title: 'Assist stage setup for talent show', categoryId: 'cat-dance', categoryName: 'Dance & Entertainment', assignedUserId: 'usr-james', assignedUserName: 'James Henry', dueDateUtc: '2026-08-28T14:00:00Z', status: 'PENDING', priority: 'LOW', requiresPhotoProof: false, requiresReceipt: false, uploadedProofUrls: [], uploadedReceiptUrls: [], pointsValue: 10, tags: ['youth'], createdAt: '2026-07-20T11:00:00Z', updatedAt: '2026-07-20T11:00:00Z', comments: [] },
];

export const SEED_NOTIFICATIONS: Notification[] = [
  { notificationId: 'ntf-001', userId: 'usr-sarah', title: 'Task due soon', body: 'Craft supplies due in 6 days.', channel: 'IN_APP', severity: 'WARNING', createdAt: '2026-08-12T08:00:00Z', link: '/user/punchlist' },
  { notificationId: 'ntf-002', userId: 'usr-marcus', title: 'Deposit reminder', body: 'Layaway payment due Sep 1.', channel: 'IN_APP', severity: 'WARNING', createdAt: '2026-08-11T10:00:00Z', link: '/user/punchlist' },
  { notificationId: 'ntf-003', userId: 'usr-david', title: 'Review needed', body: 'Load-in schedule is waiting for your review.', channel: 'IN_APP', severity: 'INFO', createdAt: '2026-08-10T15:30:00Z', link: '/user/punchlist' },
  { notificationId: 'ntf-004', userId: 'usr-admin', title: 'System ready', body: 'Reunion OS intake-to-delivery engine is online.', channel: 'IN_APP', severity: 'INFO', createdAt: '2026-08-12T07:00:00Z' },
];

export const INTAKE_TASK_TEMPLATES: Record<string, Array<{ title: string; categoryId: string; priority: PunchListItem['priority']; requiresPhotoProof?: boolean; requiresReceipt?: boolean }>> = {
  hasCatering: [
    { title: 'Finalize catering contract', categoryId: 'cat-food', priority: 'HIGH', requiresReceipt: true },
    { title: 'Confirm dietary restrictions matrix', categoryId: 'cat-food', priority: 'HIGH' },
    { title: 'Order ice and beverage supplies', categoryId: 'cat-food', priority: 'MEDIUM', requiresPhotoProof: true, requiresReceipt: true },
  ],
  hasEntertainment: [
    { title: 'Confirm DJ / sound tech rider', categoryId: 'cat-dance', priority: 'HIGH' },
    { title: 'Build talent show run-of-show', categoryId: 'cat-dance', priority: 'HIGH' },
  ],
  hasKidsActivities: [
    { title: 'Procure craft supplies and sizing table', categoryId: 'cat-kids', priority: 'MEDIUM', requiresPhotoProof: true, requiresReceipt: true },
    { title: 'Staff kids station volunteer roster', categoryId: 'cat-kids', priority: 'MEDIUM' },
  ],
  hasVenue: [
    { title: 'Secure pavilion / venue deposit', categoryId: 'cat-venue', priority: 'CRITICAL', requiresReceipt: true },
    { title: 'Create site load-in schedule', categoryId: 'cat-punch', priority: 'HIGH' },
    { title: 'Print and distribute parking passes', categoryId: 'cat-venue', priority: 'MEDIUM', requiresPhotoProof: true },
  ],
  hasSecurity: [
    { title: 'Assemble first-aid and emergency kit', categoryId: 'cat-security', priority: 'HIGH', requiresPhotoProof: true },
    { title: 'Confirm security volunteer roster', categoryId: 'cat-security', priority: 'HIGH' },
  ],
};
