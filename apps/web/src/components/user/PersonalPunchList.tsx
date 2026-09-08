'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { store } from '../../lib/store';
import type { PunchListItem, TaskStatus, UserAssignmentCategory } from '../../types';
import { toastSuccess } from '../../lib/toasts';

interface PersonalPunchListProps {
  userFullName?: string;
  userTitle?: string;
  assignedCategories?: UserAssignmentCategory[];
  punchListItems?: PunchListItem[];
  onUploadProof?: (taskId: string, file: File) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
}

function normalizeStatus(status: TaskStatus) {
  const normalized = String(status).toLowerCase();
  if (normalized === 'in_progress') return 'in_progress';
  if (normalized === 'done' || normalized === 'completed') return 'done';
  return 'todo';
}

function toDoneStatus(status: TaskStatus): TaskStatus {
  return String(status).toUpperCase() === 'COMPLETED' ? 'COMPLETED' : 'done';
}

export function PersonalPunchList(props: PersonalPunchListProps) {
  const controlled = Boolean(props.punchListItems && props.onStatusChange);
  const [items, setItems] = useState<PunchListItem[]>([]);

  function load() {
    setItems(store.getPunchItems(store.getCurrentUserId() ?? 'user-demo'));
  }

  useEffect(() => {
    if (controlled) return;
    load();
  }, [controlled]);

  const sourceItems = controlled ? props.punchListItems ?? [] : items;

  function setStatus(id: string, status: TaskStatus) {
    if (controlled && props.onStatusChange) {
      props.onStatusChange(id, status);
      return;
    }

    store.updatePunchStatus(id, status);
    if (normalizeStatus(status) === 'done') {
      toastSuccess('Task completed');
      store.logActivity({
        userId: store.getCurrentUserId() ?? 'user-demo',
        type: 'task_complete',
        summary: `Completed punch item ${id}`,
      });
    }
    load();
  }

  function addItem() {
    if (controlled) return;

    const item: PunchListItem = {
      id: `pl-${Date.now()}`,
      taskId: `pl-${Date.now()}`,
      userId: store.getCurrentUserId() ?? 'user-demo',
      title: 'New task',
      description: '',
      categoryId: 'cat-ops',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uploadedProofUrls: [],
    };
    store.upsertPunchItem(item);
    load();
  }

  const byStatus = useMemo(
    () => ({
      todo: sourceItems.filter((i) => normalizeStatus(i.status) === 'todo'),
      in_progress: sourceItems.filter((i) => normalizeStatus(i.status) === 'in_progress'),
      done: sourceItems.filter((i) => normalizeStatus(i.status) === 'done'),
    }),
    [sourceItems]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold">My Punch List</h2>
          {(props.userFullName || props.userTitle) && (
            <p className="text-xs text-slate-400 mt-1">
              {props.userFullName}
              {props.userTitle ? ` · ${props.userTitle}` : ''}
            </p>
          )}
        </div>
        {!controlled && (
          <button
            onClick={addItem}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-sm"
          >
            + Add item
          </button>
        )}
      </div>

      {(['todo', 'in_progress', 'done'] as const).map((col) => (
        <section key={col}>
          <h3 className="text-sm uppercase tracking-wide text-slate-500 mb-2">
            {col.replace('_', ' ')} ({byStatus[col].length})
          </h3>
          <ul className="space-y-2">
            {byStatus[col].map((item) => {
              const taskId = item.taskId ?? item.id;
              return (
                <li
                  key={taskId}
                  className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    {item.description && (
                      <p className="text-sm text-slate-400 mt-0.5">{item.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {(item.priority ?? 'medium')} · due {item.dueDate ?? '—'}
                    </p>
                    {controlled && props.onUploadProof && (
                      <label className="mt-2 inline-flex items-center text-xs text-amber-400 cursor-pointer">
                        Upload proof
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) props.onUploadProof?.(taskId, file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {col !== 'todo' && (
                      <button
                        className="text-xs text-slate-400 hover:text-white"
                        onClick={() => setStatus(taskId, 'todo')}
                      >
                        To do
                      </button>
                    )}
                    {col !== 'in_progress' && (
                      <button
                        className="text-xs text-amber-400 hover:text-amber-300"
                        onClick={() => setStatus(taskId, controlled ? 'IN_PROGRESS' : 'in_progress')}
                      >
                        Start
                      </button>
                    )}
                    {col !== 'done' && (
                      <button
                        className="text-xs text-emerald-400 hover:text-emerald-300"
                        onClick={() => setStatus(taskId, controlled ? 'COMPLETED' : toDoneStatus(item.status))}
                      >
                        Done
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
            {byStatus[col].length === 0 && (
              <li className="text-sm text-slate-600 py-2">Empty</li>
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default PersonalPunchList;
