'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { useAuth } from '../../../contexts/AuthContext';
import { getNotifications, markNotificationRead } from '../../../lib/store';
import { Badge } from '../../../components/ui/Badge';
import type { Notification } from '../../../types';

export default function NotificationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
    if (user) setItems(getNotifications(user.userId));
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <AppShell variant="user" title="Notifications">
      <div className="max-w-xl space-y-3">
        {items.length === 0 && (
          <p className="text-[#8D7B68] text-center py-12">No notifications yet.</p>
        )}
        {items.map((n) => (
          <button
            key={n.notificationId}
            onClick={() => {
              markNotificationRead(n.notificationId);
              setItems(getNotifications(user.userId));
              if (n.link) router.push(n.link);
            }}
            className={`w-full text-left p-4 rounded-xl border transition ${
              n.readAt
                ? 'bg-white/50 border-[#E5DFD3] opacity-70'
                : 'bg-white border-[#E3CAA5] shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-[#1A1615]">{n.title}</div>
                <p className="text-sm text-[#5C5470] mt-0.5">{n.body}</p>
                <p className="text-[10px] text-[#8D7B68] mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge
                variant={
                  n.severity === 'CRITICAL'
                    ? 'danger'
                    : n.severity === 'WARNING'
                      ? 'warning'
                      : 'info'
                }
              >
                {n.severity}
              </Badge>
            </div>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
