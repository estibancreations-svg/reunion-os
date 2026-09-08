import type { GamificationProfile, Notification, SessionUser } from '@/types';
import { getGamification, getNotifications, markNotificationRead, store } from './store';

function actorHeaders(user: SessionUser): HeadersInit {
  return {
    'x-demo-user-id': user.userId,
    'x-demo-role-tier': user.roleTier,
    'x-demo-user-name': user.fullName ?? user.name ?? user.userId,
    'x-demo-user-email': user.email ?? `${user.userId}@reunion.local`,
  };
}

async function parseJson<T = any>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || (json as any)?.ok === false) throw new Error((json as any)?.message || 'Request failed');
  return json as T;
}

export async function fetchNotificationsApi(user: SessionUser): Promise<{ source: 'api' | 'local'; data: Notification[] }> {
  try {
    const qs = new URLSearchParams({ userId: user.userId });
    const res = await fetch(`/api/notifications?${qs.toString()}`, {
      method: 'GET',
      headers: actorHeaders(user),
      cache: 'no-store',
    });
    const json = await parseJson<{ ok: true; data: Notification[] }>(res);
    return { source: 'api', data: json.data };
  } catch {
    return { source: 'local', data: getNotifications(user.userId) };
  }
}

export async function markNotificationReadApi(user: SessionUser, notificationId: string): Promise<{ source: 'api' | 'local' }> {
  try {
    await parseJson(
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', ...actorHeaders(user) },
        body: JSON.stringify({ notificationId }),
      })
    );
    return { source: 'api' };
  } catch {
    markNotificationRead(notificationId);
    return { source: 'local' };
  }
}

export async function fetchGamificationApi(user: SessionUser): Promise<{ source: 'api' | 'local'; data: GamificationProfile }> {
  try {
    const qs = new URLSearchParams({ userId: user.userId });
    const res = await fetch(`/api/gamification?${qs.toString()}`, {
      method: 'GET',
      headers: actorHeaders(user),
      cache: 'no-store',
    });
    const json = await parseJson<{ ok: true; data: GamificationProfile }>(res);
    return { source: 'api', data: json.data };
  } catch {
    return { source: 'local', data: getGamification(user.userId) };
  }
}

export async function submitIntakeApi(
  user: SessionUser,
  answers: Array<{ questionId: string; value: unknown }>
): Promise<{ source: 'api' | 'local'; tasksCreated: number }> {
  try {
    const res = await fetch('/api/intake', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...actorHeaders(user) },
      body: JSON.stringify({ answers }),
    });
    const json = await parseJson<{ ok: true; data: { tasksCreated: number } }>(res);
    return { source: 'api', tasksCreated: json.data.tasksCreated ?? 0 };
  } catch {
    store.saveIntakeSession({
      id: `intake-${Date.now()}`,
      userId: user.userId,
      answers,
      createdAt: new Date().toISOString(),
      status: 'completed',
    });
    return { source: 'local', tasksCreated: 0 };
  }
}
