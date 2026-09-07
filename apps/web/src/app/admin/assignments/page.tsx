'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import AssignmentSpreadsheet from '../../../components/admin/AssignmentSpreadsheet';
import { useAuth } from '../../../contexts/AuthContext';
import { getAssignments, getCategories, saveAssignment, grantMatrixEditorBadge } from '../../../lib/store';
import type { UserAssignment } from '../../../types';

export default function AssignmentsPage() {
  const { user, isLoading, canEditMatrix } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<UserAssignment[]>([]);
  const [cats, setCats] = useState(getCategories());

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
    setAssignments(getAssignments());
    setCats(getCategories());
  }, [user, isLoading, router]);

  const handleSave = useCallback((u: UserAssignment) => {
    setAssignments(saveAssignment(u));
    if (user) grantMatrixEditorBadge(user.userId);
  }, [user]);

  const handleExport = () => {
    const rows = [
      ['Name', 'Title', 'Role', 'Categories', 'Received', 'Required', 'Status'],
      ...assignments.map((a) => [
        a.profile?.fullName ?? a.userName ?? a.userId,
        a.title,
        a.roleTier,
        (a.assignedCategories ?? []).map((c) => c.name).join('; '),
        a.depositStatus?.receivedAmount ?? 0,
        a.depositStatus?.requiredAmount ?? 0,
        a.depositStatus?.status ?? 'PENDING',
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matrix-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (isLoading || !user) return null;

  return (
    <AppShell variant="admin" title="Responsibility Matrix">
      <AssignmentSpreadsheet
        initialAssignments={assignments}
        availableCategories={cats}
        onSaveAssignment={handleSave}
        onExport={handleExport}
        readOnly={!canEditMatrix}
      />
    </AppShell>
  );
}
