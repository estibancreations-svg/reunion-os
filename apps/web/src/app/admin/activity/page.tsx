'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { useAuth } from '../../../contexts/AuthContext';
import { getAuditLog } from '../../../lib/audit';
import type { AuditEvent } from '../../../types';

export default function ActivityPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
    setEvents(getAuditLog(80));
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <AppShell variant="admin" title="Activity / Audit Feed">
      <p className="text-sm text-[#A89F91] mb-6">
        Who did what — task completions, intake runs, matrix edits.
      </p>
      <div className="space-y-2">
        {events.length === 0 && (
          <p className="text-[#5C544D] text-sm">No audit events yet. Complete a task or run intake.</p>
        )}
        {events.map((e) => (
          <div
            key={e.eventId}
            className="bg-[#1A1615] border border-[#3F3A36] rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 text-sm"
          >
            <span className="font-mono text-[10px] text-[#5C544D] shrink-0">
              {new Date(e.timestamp).toLocaleString()}
            </span>
            <span className="font-semibold text-[#FDFBF7]">{e.actorName}</span>
            <span className="text-[#C84B31] font-mono text-xs">{e.action}</span>
            <span className="text-[#A89F91] text-xs">
              {e.entityType} · {e.entityId}
            </span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
