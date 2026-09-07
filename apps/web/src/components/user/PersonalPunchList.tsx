'use client';

import React, { useEffect, useState } from 'react';
import { store } from '../../lib/store';
import type { PunchListItem, TaskStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { toastSuccess, toastAchievement } from '../../lib/toasts';
import { awardXp, checkAchievements } from '../../lib/gamification';

export function PersonalPunchList() {
  const { user } = useAuth();
  const [items, setItems] = useState<PunchListItem[]>([]);

  function load() {
    const uid = user?.userId ?? 'user-demo';
    setItems(store.getPunchItems(uid));
  }

  useEffect(() => {
    load();
  }, [user]);

  function setStatus(id: string, status: TaskStatus) {
    store.updatePunchStatus(id, status);
    if (status === 'done' || status === 'completed') {
      toastSuccess('Task completed');
      // simple xp bump via activity
      store.logActivity({
        userId: user?.userId ?? 'user-demo',
        type: 'task_complete',
        summary: `Completed punch item ${id}`,
      });
    }
    load();
  }

  function addItem() {
    const item: PunchListItem = {
      id: `pl-${Date.now()}`,
      userId: user?.userId ?? 'user-demo',
      title: 'New task',
      description: '',
      categoryId: 'cat-ops',
      status: 'todo',
      priority: 'medium',
      dueDate: null as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;
    store.upsertPunchItem(item);
    load();
  }

  const byStatus = {
    todo: items.filter((i) => i.status === 'todo' || i.status === 'pending'),
    in_progress: items.filter((i) => i.status === 'in_progress'),
    done: items.filter((i) => i.status === 'done' || i.status === 'completed'),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">My Punch List</h2>
        <button
          onClick={addItem}
          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-sm"
        >
          + Add item
        </button>
      </div>

      {(['todo', 'in_progress', 'done'] as const).map((col) => (
        <section key={col}>
          <h3 className="text-sm uppercase tracking-wide text-slate-500 mb-2">
            {col.replace('_', ' ')} ({byStatus[col].length})
          </h3>
          <ul className="space-y-2">
            {byStatus[col].map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  {item.description && (
                    <p className="text-sm text-slate-400 mt-0.5">{item.description}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {(item as any).priority ?? 'medium'} · due {(item as any).dueDate ?? '—'}
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {col !== 'todo' && (
                    <button
                      className="text-xs text-slate-400 hover:text-white"
                      onClick={() => setStatus(item.id, 'todo' as TaskStatus)}
                    >
                      To do
                    </button>
                  )}
                  {col !== 'in_progress' && (
                    <button
                      className="text-xs text-amber-400 hover:text-amber-300"
                      onClick={() => setStatus(item.id, 'in_progress' as TaskStatus)}
                    >
                      Start
                    </button>
                  )}
                  {col !== 'done' && (
                    <button
                      className="text-xs text-emerald-400 hover:text-emerald-300"
                      onClick={() => setStatus(item.id, 'done' as TaskStatus)}
                    >
                      Done
                    </button>
                  )}
                </div>
              </li>
            ))}
            {byStatus[col].length === 0 && (
              <li className="text-sm text-slate-600 py-2">Empty</li>
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}
