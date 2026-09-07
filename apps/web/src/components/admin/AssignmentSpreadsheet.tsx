'use client';

import React, { useMemo, useState, useCallback } from 'react';
import type { UserAssignment, OperationalCategory, RoleTier } from '../../types';
import { Badge } from '../ui/Badge';

interface Props {
  initialAssignments: UserAssignment[];
  availableCategories: OperationalCategory[];
  onSaveAssignment: (u: UserAssignment) => void;
  onExport?: () => void;
  readOnly?: boolean;
}

const ROLE_LABELS: Record<RoleTier, string> = {
  SUPER_ADMIN: 'Super Admin',
  COMMITTEE_CHAIR: 'Committee Chair',
  COMMITTEE_LEAD: 'Committee Lead',
  VOLUNTEER: 'Volunteer',
  GUEST: 'Guest',
  VENDOR: 'Vendor',
};

export default function AssignmentSpreadsheet({
  initialAssignments,
  availableCategories,
  onSaveAssignment,
  onExport,
  readOnly = false,
}: Props) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [openPicker, setOpenPicker] = useState<string | null>(null);

  React.useEffect(() => setAssignments(initialAssignments), [initialAssignments]);

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.profile.fullName.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q);
      const matchCat =
        filterCat === 'ALL' ||
        a.assignedCategories.some((c) => c.categoryId === filterCat);
      return matchSearch && matchCat;
    });
  }, [assignments, search, filterCat]);

  const toggleCategory = useCallback(
    (userId: string, cat: OperationalCategory) => {
      if (readOnly) return;
      setAssignments((prev) => {
        const next = prev.map((u) => {
          if (u.userId !== userId) return u;
          const exists = u.assignedCategories.some((c) => c.categoryId === cat.categoryId);
          const cats = exists
            ? u.assignedCategories.filter((c) => c.categoryId !== cat.categoryId)
            : [...u.assignedCategories, cat];
          const updated = { ...u, assignedCategories: cats, updatedAt: new Date().toISOString() };
          onSaveAssignment(updated);
          return updated;
        });
        return next;
      });
    },
    [onSaveAssignment, readOnly]
  );

  return (
    <div className="bg-[#1A1615] text-[#FDFBF7] rounded-2xl border border-[#3F3A36] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#3F3A36] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold">Master Responsibility Matrix</h2>
          <p className="text-[10px] uppercase tracking-widest text-[#A89F91] mt-0.5">
            Multi-category assignment engine
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="search"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 bg-[#2C2825] border border-[#3F3A36] rounded-lg text-sm w-40"
          />
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="px-3 py-1.5 bg-[#2C2825] border border-[#3F3A36] rounded-lg text-sm"
          >
            <option value="ALL">All categories</option>
            {availableCategories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.name}
              </option>
            ))}
          </select>
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 py-1.5 bg-[#2C2825] border border-[#5C544D] rounded-lg text-xs font-bold"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-[#2C2825] text-[#A89F91] text-[10px] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Member</th>
              <th className="px-4 py-3 text-left">Title / Role</th>
              <th className="px-4 py-3 text-left">Categories</th>
              <th className="px-4 py-3 text-left">Deposit</th>
              <th className="px-4 py-3 text-left">Responsibilities</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2C2825]">
            {filtered.map((u) => (
              <tr key={u.assignmentId} className="hover:bg-[#231F1D]/80">
                <td className="px-4 py-3">
                  <div className="font-semibold">{u.profile.fullName}</div>
                  <div className="text-[10px] text-[#A89F91] font-mono">{u.userId}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="italic text-[#D8C4B6]">{u.title}</div>
                  <Badge variant="neutral" className="mt-1">
                    {ROLE_LABELS[u.roleTier]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-[220px]">
                    {u.assignedCategories.map((c) => (
                      <button
                        key={c.categoryId}
                        onClick={() => toggleCategory(u.userId, c)}
                        disabled={readOnly}
                        className="disabled:cursor-default"
                      >
                        <Badge
                          style={{
                            backgroundColor: `${c.color}22`,
                            borderColor: `${c.color}66`,
                            color: c.color,
                          }}
                        >
                          {c.name}
                        </Badge>
                      </button>
                    ))}
                    {!readOnly && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenPicker(openPicker === u.userId ? null : u.userId)
                          }
                          className="px-2 py-0.5 border border-[#5C544D] rounded text-[11px] text-[#A89F91]"
                        >
                          +
                        </button>
                        {openPicker === u.userId && (
                          <div className="absolute z-20 mt-1 w-48 bg-[#2C2825] border border-[#5C544D] rounded-xl p-2 shadow-xl">
                            {availableCategories.map((c) => {
                              const on = u.assignedCategories.some(
                                (x) => x.categoryId === c.categoryId
                              );
                              return (
                                <button
                                  key={c.categoryId}
                                  onClick={() => {
                                    toggleCategory(u.userId, c);
                                    if (!on) setOpenPicker(null);
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 hover:bg-[#3F3A36] ${
                                    on ? 'text-emerald-400' : ''
                                  }`}
                                >
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: c.color }}
                                  />
                                  {c.name}
                                  {on && ' ✓'}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  <span
                    className={
                      u.depositStatus.isCleared ? 'text-emerald-400' : 'text-amber-400'
                    }
                  >
                    ${u.depositStatus.receivedAmount} / ${u.depositStatus.requiredAmount}
                  </span>
                  <div className="text-[10px] text-[#A89F91]">
                    {u.depositStatus.status}
                  </div>
                </td>
                <td className="px-4 py-3 text-[11px] text-[#A89F91] max-w-[200px]">
                  {u.specificResponsibilities.slice(0, 2).map((r, i) => (
                    <div key={i} className="truncate">
                      • {r}
                    </div>
                  ))}
                  {u.specificResponsibilities.length > 2 && (
                    <div className="text-[#C84B31]">
                      +{u.specificResponsibilities.length - 2} more
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 text-[10px] text-[#5C544D] border-t border-[#3F3A36]">
        {filtered.length} of {assignments.length} members
      </div>
    </div>
  );
}
