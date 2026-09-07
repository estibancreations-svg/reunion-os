'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../components/layout/AppShell';
import { useAuth } from '../../contexts/AuthContext';
import { getSystemHealth, getCategories, getAllTasks, getAssignments } from '../../lib/store';
import { Badge } from '../../components/ui/Badge';
import type { SystemHealth } from '../../types';

export default function AdminDashboard() {
  const { user, isLoading, canEditMatrix } = useAuth();
  const router = useRouter();
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
    if (user) setHealth(getSystemHealth(user.userId));
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const overdue = getAllTasks().filter(
    (t) => !['COMPLETED', 'CANCELLED'].includes(t.status) && new Date(t.dueDateUtc) < new Date()
  );
  const cats = getCategories();

  return (
    <AppShell variant="admin" title="Command Center">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ['Members', health?.totalUsers ?? 0],
          ['Open tasks', health?.openTasks ?? 0],
          ['Overdue', health?.overdueTasks ?? 0],
          ['Deposits', `$${health?.totalDepositsReceived ?? 0}`],
        ].map(([l, v]) => (
          <div key={l as string} className="bg-[#1A1615] border border-[#3F3A36] rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-wider text-[#A89F91]">{l as string}</p>
            <p className="text-3xl font-bold mt-1 tabular-nums">{v as string | number}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-[#1A1615] border border-[#3F3A36] rounded-2xl p-6">
          <h2 className="font-serif text-xl font-bold mb-4">Needs Attention</h2>
          {overdue.length === 0 ? (
            <p className="text-[#A89F91] text-sm">No overdue tasks.</p>
          ) : (
            <ul className="space-y-3">
              {overdue.slice(0, 6).map((t) => (
                <li key={t.taskId} className="flex justify-between gap-2 text-sm">
                  <span className="truncate">{t.title}</span>
                  <Badge variant="danger">Overdue</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-[#1A1615] border border-[#3F3A36] rounded-2xl p-6">
          <h2 className="font-serif text-xl font-bold mb-4">Categories</h2>
          <ul className="space-y-2">
            {cats.map((c) => (
              <li key={c.categoryId} className="flex items-center gap-3 text-sm">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                <span className="flex-1">{c.name}</span>
                <span className="text-[#A89F91] text-xs">
                  {getAssignments().filter((a) =>
                    a.assignedCategories.some((x) => x.categoryId === c.categoryId)
                  ).length}{' '}
                  people
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href="/admin/assignments" className="px-5 py-2.5 bg-[#C84B31] rounded-lg text-sm font-bold">
          Responsibility Matrix
        </a>
        {canEditMatrix && (
          <a href="/admin/intake" className="px-5 py-2.5 border border-[#5C544D] rounded-lg text-sm font-bold">
            Run Intake Engine
          </a>
        )}
        <a href="/user/punchlist" className="px-5 py-2.5 border border-[#5C544D] rounded-lg text-sm font-bold">
          View as User
        </a>
      </div>
    </AppShell>
  );
}
