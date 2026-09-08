'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { useAuth } from '../../../contexts/AuthContext';
import { getCategories, getAssignments, getAllTasks } from '../../../lib/store';
import { Badge } from '../../../components/ui/Badge';
import type { OperationalCategory } from '../../../types';

export default function CategoriesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [cats, setCats] = useState<OperationalCategory[]>([]);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
    setCats(getCategories());
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <AppShell variant="admin" title="Category Registry">
      <div className="space-y-4">
        {cats.map((c) => {
          const people = getAssignments().filter((a) =>
            (a.assignedCategories ?? []).some((x) => x.categoryId === (c.categoryId ?? c.id))
          ).length;
          const tasks = getAllTasks().filter((t) => t.categoryId === (c.categoryId ?? c.id)).length;
          return (
            <div
              key={c.categoryId ?? c.id}
              className="bg-[#1A1615] border border-[#3F3A36] rounded-2xl p-5 flex items-center gap-4"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: `${c.color}22`, color: c.color }}
              >
                ◆
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg font-bold">{c.name}</h2>
                  <Badge variant={c.isCustom ? 'info' : 'neutral'}>
                    {c.isCustom ? 'Custom' : 'System'}
                  </Badge>
                </div>
                <p className="text-sm text-[#A89F91]">{c.description}</p>
                <p className="text-xs text-[#5C544D] mt-1">
                  {people} people · {tasks} tasks · {c.categoryId ?? c.id}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
