'use client';

import React, { useEffect, useState } from 'react';
import { store } from '../../lib/store';
import type { UserAssignment, OperationalCategory } from '../../types';
import { toastSuccess } from '../../lib/toasts';

interface AssignmentSpreadsheetProps {
  initialAssignments?: UserAssignment[];
  availableCategories?: OperationalCategory[];
  onSaveAssignment?: (assignment: UserAssignment) => void;
  onExport?: () => void;
  readOnly?: boolean;
}

export function AssignmentSpreadsheet({
  initialAssignments,
  availableCategories = [],
  onSaveAssignment,
  onExport,
  readOnly = false,
}: AssignmentSpreadsheetProps) {
  const [rows, setRows] = useState<UserAssignment[]>([]);

  useEffect(() => {
    setRows(initialAssignments ?? store.getAssignments());
  }, [initialAssignments]);

  function refresh() {
    setRows(store.getAssignments());
  }

  function addRow() {
    if (readOnly) return;
    const a: UserAssignment = {
      id: `asg-${Date.now()}`,
      assignmentId: `asg-${Date.now()}`,
      userId: 'user-demo',
      userName: 'New User',
      categoryId: 'cat-ops',
      categoryName: 'Operations',
      role: 'Contributor',
      roleTier: 'VOLUNTEER',
      status: 'active',
      startDate: new Date().toISOString().slice(0, 10),
      notes: '',
      title: 'Contributor',
      profile: { fullName: 'New User', email: 'new.user@reunion.demo' },
      assignedCategories: [{ categoryId: 'cat-ops', name: 'Operations', color: '#3B82F6' }],
      depositStatus: { requiredAmount: 0, receivedAmount: 0, status: 'PAID' },
    };
    store.upsertAssignment(a);
    onSaveAssignment?.(a);
    toastSuccess('Assignment added');
    refresh();
  }

  function update(id: string, patch: Partial<UserAssignment>) {
    if (readOnly) return;
    const current = rows.find((r) => r.id === id);
    if (!current) return;
    const next = store.upsertAssignment({ ...current, ...patch });
    onSaveAssignment?.(next);
    refresh();
  }

  function remove(id: string) {
    if (readOnly) return;
    store.deleteAssignment(id);
    toastSuccess('Removed');
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Assignment Matrix</h2>
        <div className="flex items-center gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-sm"
            >
              Export
            </button>
          )}
          {!readOnly && (
            <button
              onClick={addRow}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-sm"
            >
              + Add row
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400 text-left">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Notes</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-800">
                <td className="px-3 py-2">
                  <input
                    disabled={readOnly}
                    className="bg-transparent border-b border-slate-700 w-full disabled:opacity-70"
                    value={r.userName ?? r.profile?.fullName ?? r.userId}
                    onChange={(e) => update(r.id, { userName: e.target.value, profile: { ...r.profile, fullName: e.target.value } })}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    disabled={readOnly}
                    className="bg-slate-950 border border-slate-700 rounded px-1 disabled:opacity-70"
                    value={r.categoryId ?? r.assignedCategories?.[0]?.categoryId ?? 'cat-ops'}
                    onChange={(e) => {
                      const category = availableCategories.find(
                        (c) => (c.categoryId ?? c.id) === e.target.value
                      );
                      update(r.id, {
                        categoryId: e.target.value,
                        categoryName: category?.name ?? e.target.value,
                        assignedCategories: [
                          {
                            categoryId: e.target.value,
                            name: category?.name ?? e.target.value,
                            color: category?.color,
                          },
                        ],
                      });
                    }}
                  >
                    {(availableCategories.length > 0 ? availableCategories : [{ id: 'cat-ops', name: 'Operations' }]).map((c) => {
                      const id = c.categoryId ?? c.id;
                      return (
                        <option key={id} value={id}>
                          {c.name}
                        </option>
                      );
                    })}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select
                    disabled={readOnly}
                    className="bg-slate-950 border border-slate-700 rounded px-1 disabled:opacity-70"
                    value={r.role ?? r.title ?? 'Contributor'}
                    onChange={(e) => update(r.id, { role: e.target.value, title: e.target.value })}
                  >
                    <option>Lead</option>
                    <option>Contributor</option>
                    <option>Support</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select
                    disabled={readOnly}
                    className="bg-slate-950 border border-slate-700 rounded px-1 disabled:opacity-70"
                    value={r.status ?? 'active'}
                    onChange={(e) => update(r.id, { status: e.target.value })}
                  >
                    <option>active</option>
                    <option>paused</option>
                    <option>done</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    disabled={readOnly}
                    className="bg-transparent border-b border-slate-700 w-full disabled:opacity-70"
                    value={r.notes ?? ''}
                    onChange={(e) => update(r.id, { notes: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2">
                  {!readOnly && (
                    <button onClick={() => remove(r.id)} className="text-red-400 text-xs">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  No assignments yet. Add a row or run seed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssignmentSpreadsheet;
