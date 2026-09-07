'use client';

import React, { useEffect, useState } from 'react';
import { store } from '../../lib/store';
import type { UserAssignment } from '../../types';
import { toastSuccess } from '../../lib/toasts';

export function AssignmentSpreadsheet() {
  const [rows, setRows] = useState<UserAssignment[]>([]);

  useEffect(() => {
    setRows(store.getAssignments());
  }, []);

  function refresh() {
    setRows(store.getAssignments());
  }

  function addRow() {
    const a: UserAssignment = {
      id: `asg-${Date.now()}`,
      userId: 'user-demo',
      userName: 'New User',
      categoryId: 'cat-ops',
      categoryName: 'Operations',
      role: 'Contributor',
      status: 'active',
      startDate: new Date().toISOString().slice(0, 10),
      notes: '',
    } as any;
    store.upsertAssignment(a);
    toastSuccess('Assignment added');
    refresh();
  }

  function update(id: string, patch: Partial<UserAssignment>) {
    const current = rows.find((r) => r.id === id);
    if (!current) return;
    store.upsertAssignment({ ...current, ...patch } as any);
    refresh();
  }

  function remove(id: string) {
    store.deleteAssignment(id);
    toastSuccess('Removed');
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Assignment Matrix</h2>
        <button
          onClick={addRow}
          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-sm"
        >
          + Add row
        </button>
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
                    className="bg-transparent border-b border-slate-700 w-full"
                    value={(r as any).userName ?? r.userId}
                    onChange={(e) => update(r.id, { userName: e.target.value } as any)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="bg-transparent border-b border-slate-700 w-full"
                    value={(r as any).categoryName ?? r.categoryId}
                    onChange={(e) => update(r.id, { categoryName: e.target.value } as any)}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    className="bg-slate-950 border border-slate-700 rounded px-1"
                    value={(r as any).role ?? 'Contributor'}
                    onChange={(e) => update(r.id, { role: e.target.value } as any)}
                  >
                    <option>Lead</option>
                    <option>Contributor</option>
                    <option>Support</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select
                    className="bg-slate-950 border border-slate-700 rounded px-1"
                    value={(r as any).status ?? 'active'}
                    onChange={(e) => update(r.id, { status: e.target.value } as any)}
                  >
                    <option>active</option>
                    <option>paused</option>
                    <option>done</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    className="bg-transparent border-b border-slate-700 w-full"
                    value={(r as any).notes ?? ''}
                    onChange={(e) => update(r.id, { notes: e.target.value } as any)}
                  />
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => remove(r.id)} className="text-red-400 text-xs">
                    Delete
                  </button>
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
