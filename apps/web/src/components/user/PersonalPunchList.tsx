'use client';

import React, { useMemo, useState } from 'react';
import type { PunchListItem, OperationalCategory, TaskStatus } from '../../types';
import { Badge } from '../ui/Badge';

const STATUS: Record<TaskStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  PENDING: { label: 'Pending', variant: 'neutral' },
  IN_PROGRESS: { label: 'In Progress', variant: 'info' },
  REVIEW_NEEDED: { label: 'Review Needed', variant: 'warning' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  BLOCKED: { label: 'Blocked', variant: 'danger' },
  CANCELLED: { label: 'Cancelled', variant: 'neutral' },
};

interface Props {
  userFullName: string;
  userTitle: string;
  assignedCategories: OperationalCategory[];
  punchListItems: PunchListItem[];
  onUploadProof: (taskId: string, file: File) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
}

export default function PersonalPunchList({
  userFullName,
  userTitle,
  assignedCategories,
  punchListItems,
  onUploadProof,
  onStatusChange,
}: Props) {
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return punchListItems
      .filter((t) => filterStatus === 'ALL' || t.status === filterStatus)
      .sort((a, b) => {
        const o = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return (o[a.priority] ?? 4) - (o[b.priority] ?? 4);
      });
  }, [punchListItems, filterStatus]);

  const counts = useMemo(() => {
    const open = punchListItems.filter((t) => !['COMPLETED', 'CANCELLED'].includes(t.status)).length;
    const overdue = punchListItems.filter(
      (t) => !['COMPLETED', 'CANCELLED'].includes(t.status) && new Date(t.dueDateUtc) < new Date()
    ).length;
    const done = punchListItems.filter((t) => t.status === 'COMPLETED').length;
    return { total: punchListItems.length, open, overdue, done };
  }, [punchListItems]);

  return (
    <div className="bg-[#FDFBF7] text-[#1A1615] rounded-2xl border border-[#E5DFD3] shadow-xl overflow-hidden">
      <div className="bg-gradient-to-br from-[#1A1615] to-[#2C2825] text-[#FDFBF7] px-6 py-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#A89F91]">Personal Command Center</p>
        <h1 className="font-serif text-3xl font-bold mt-1">{userFullName}</h1>
        <p className="text-sm text-[#C84B31] mt-0.5">{userTitle}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {assignedCategories.map((c) => (
            <span
              key={c.categoryId}
              className="px-2 py-0.5 rounded text-xs border"
              style={{ borderColor: `${c.color}55`, background: `${c.color}22` }}
            >
              {c.name}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 mt-5">
          {[
            ['Total', counts.total, ''],
            ['Open', counts.open, 'text-amber-300'],
            ['Overdue', counts.overdue, 'text-red-400'],
            ['Done', counts.done, 'text-emerald-400'],
          ].map(([l, v, c]) => (
            <div key={l as string} className="bg-white/5 rounded-xl px-3 py-2 border border-white/10">
              <div className={`text-xl font-bold tabular-nums ${c}`}>{v as number}</div>
              <div className="text-[10px] uppercase text-[#A89F91]">{l as string}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 border-b border-[#E5DFD3] bg-[#F8F4ED] flex gap-2 items-center">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'ALL')}
          className="px-3 py-1.5 rounded-lg border border-[#E5DFD3] bg-white text-xs"
        >
          <option value="ALL">All statuses</option>
          {(Object.keys(STATUS) as TaskStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS[s].label}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-[#8D7B68]">{filtered.length} items</span>
      </div>

      <div className="p-4 space-y-3">
        {filtered.length === 0 && (
          <p className="text-center py-12 text-[#8D7B68]">No tasks match filters.</p>
        )}
        {filtered.map((item) => {
          const due = new Date(item.dueDateUtc);
          const overdue = due < new Date() && item.status !== 'COMPLETED';
          const cfg = STATUS[item.status];
          return (
            <div
              key={item.taskId}
              className={`rounded-xl border p-4 ${
                item.status === 'COMPLETED'
                  ? 'bg-[#F0FDF4] border-emerald-200'
                  : overdue
                    ? 'bg-[#FEF2F2] border-red-200'
                    : 'bg-[#F5EBE0] border-[#E3CAA5]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0" onClick={() => setExpanded(expanded === item.taskId ? null : item.taskId)}>
                  <div className="flex flex-wrap gap-1.5 items-center mb-1">
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    {overdue && <Badge variant="danger">Overdue</Badge>}
                    <span className="text-[10px] text-[#8D7B68]">{item.categoryName}</span>
                  </div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-xs text-[#5C5470] mt-0.5">
                    Due {due.toLocaleDateString()}
                    {item.estimatedCost != null && ` · Est. $${item.estimatedCost}`}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {item.status !== 'COMPLETED' && (item.requiresPhotoProof || item.requiresReceipt) && (
                    <label className="px-3 py-1.5 bg-[#1A1615] text-white rounded-lg text-xs font-bold cursor-pointer">
                      Upload
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onUploadProof(item.taskId, f);
                        }}
                      />
                    </label>
                  )}
                  {onStatusChange && item.status !== 'COMPLETED' && (
                    <select
                      value={item.status}
                      onChange={(e) => onStatusChange(item.taskId, e.target.value as TaskStatus)}
                      className="px-2 py-1.5 rounded-lg border text-xs bg-white"
                    >
                      {(Object.keys(STATUS) as TaskStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS[s].label}
                        </option>
                      ))}
                    </select>
                  )}
                  {item.status === 'COMPLETED' && (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                      ✓ Done
                    </span>
                  )}
                </div>
              </div>
              {expanded === item.taskId && item.description && (
                <p className="mt-3 text-sm text-[#5C5470] border-t border-[#E3CAA5]/50 pt-3">
                  {item.description}
                </p>
              )}
              {expanded === item.taskId && item.comments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {item.comments.map((c) => (
                    <div key={c.commentId} className="text-xs bg-white/60 rounded p-2">
                      <strong>{c.authorName}</strong>: {c.body}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
