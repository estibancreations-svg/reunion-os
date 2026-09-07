'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { useAuth } from '../../../contexts/AuthContext';
import { getLeaderboard } from '../../../lib/store';

export default function LeaderboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<ReturnType<typeof getLeaderboard>>([]);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
    setRows(getLeaderboard());
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <AppShell variant="admin" title="Family Quest Leaderboard">
      <p className="text-sm text-[#A89F91] mb-6">
        Cooperative ranking by XP. Designed to celebrate contribution, not punish.
      </p>
      <div className="bg-[#1A1615] border border-[#3F3A36] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#2C2825] text-[10px] uppercase tracking-wider text-[#A89F91]">
            <tr>
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">Member</th>
              <th className="text-left px-4 py-3">Level</th>
              <th className="text-left px-4 py-3">XP</th>
              <th className="text-left px-4 py-3">Tasks</th>
              <th className="text-left px-4 py-3">Badges</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2C2825]">
            {rows.map((r, i) => (
              <tr key={r.userId} className={i === 0 ? 'bg-[#C84B31]/10' : ''}>
                <td className="px-4 py-3 font-mono text-[#A89F91]">{i + 1}</td>
                <td className="px-4 py-3 font-semibold">
                  {i === 0 ? '👑 ' : ''}
                  {r.fullName}
                </td>
                <td className="px-4 py-3">{r.level}</td>
                <td className="px-4 py-3 font-mono text-[#F59E0B]">{r.points}</td>
                <td className="px-4 py-3">{r.tasksCompleted}</td>
                <td className="px-4 py-3">{r.badges}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
