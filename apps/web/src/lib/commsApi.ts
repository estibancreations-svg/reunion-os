import type { CommsChannel, CommsMessage, CommsPresence, SessionUser } from '@/types';
import {
  getCommsChannels,
  getCommsMessages,
  getCommsPresence,
  markCommsRead,
  sendCommsChirp,
  sendCommsText,
  setCommsPresence,
} from './store';

function actorHeaders(user: SessionUser): HeadersInit {
  return {
    'x-demo-user-id': user.userId,
    'x-demo-role-tier': user.roleTier,
    'x-demo-user-name': user.fullName ?? user.name ?? user.userId,
    'x-demo-user-email': user.email ?? `${user.userId}@reunion.local`,
  };
}

async function parseJson(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.ok === false) throw new Error(json?.message || 'Request failed');
  return json;
}

export async function fetchCommsChannels(user: SessionUser): Promise<{ source: 'api' | 'local'; data: CommsChannel[] }> {
  try {
    const res = await fetch('/api/comms/channels', {
      method: 'GET',
      headers: actorHeaders(user),
      cache: 'no-store',
    });
    const json = await parseJson(res);
    return { source: 'api', data: json.data as CommsChannel[] };
  } catch {
    return { source: 'local', data: getCommsChannels() };
  }
}

export async function fetchCommsMessages(
  user: SessionUser,
  channelId: string,
  since?: string
): Promise<{ source: 'api' | 'local'; data: CommsMessage[] }> {
  try {
    const qs = new URLSearchParams({ channelId });
    if (since) qs.set('since', since);
    const res = await fetch(`/api/comms/messages?${qs.toString()}`, {
      method: 'GET',
      headers: actorHeaders(user),
      cache: 'no-store',
    });
    const json = await parseJson(res);
    return { source: 'api', data: json.data as CommsMessage[] };
  } catch {
    return { source: 'local', data: getCommsMessages(channelId) };
  }
}

export async function postCommsText(
  user: SessionUser,
  channelId: string,
  body: string,
  mentions: string[] = []
): Promise<{ source: 'api' | 'local'; data: CommsMessage | null }> {
  try {
    const res = await fetch('/api/comms/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...actorHeaders(user) },
      body: JSON.stringify({ channelId, type: 'text', body, mentions }),
    });
    const json = await parseJson(res);
    return { source: 'api', data: (json.data as CommsMessage) ?? null };
  } catch {
    return { source: 'local', data: sendCommsText(channelId, user, body, mentions) };
  }
}

export async function postCommsChirp(
  user: SessionUser,
  channelId: string,
  audioUrl: string,
  durationSec?: number
): Promise<{ source: 'api' | 'local'; data: CommsMessage }> {
  try {
    const res = await fetch('/api/comms/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...actorHeaders(user) },
      body: JSON.stringify({ channelId, type: 'chirp', audioUrl, durationSec }),
    });
    const json = await parseJson(res);
    return { source: 'api', data: json.data as CommsMessage };
  } catch {
    return { source: 'local', data: sendCommsChirp(channelId, user, audioUrl, durationSec) };
  }
}

export async function fetchCommsPresence(user: SessionUser): Promise<{ source: 'api' | 'local'; data: CommsPresence[] }> {
  try {
    const res = await fetch('/api/comms/presence', {
      method: 'GET',
      headers: actorHeaders(user),
      cache: 'no-store',
    });
    const json = await parseJson(res);
    return { source: 'api', data: json.data as CommsPresence[] };
  } catch {
    return { source: 'local', data: getCommsPresence() };
  }
}

export async function patchCommsPresence(user: SessionUser, status: CommsPresence['status']) {
  try {
    await parseJson(
      await fetch('/api/comms/presence', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', ...actorHeaders(user) },
        body: JSON.stringify({ status }),
      })
    );
  } catch {
    setCommsPresence(user, status);
  }
}

export async function postMarkCommsRead(user: SessionUser, channelId: string) {
  try {
    await parseJson(
      await fetch('/api/comms/read', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...actorHeaders(user) },
        body: JSON.stringify({ channelId }),
      })
    );
  } catch {
    markCommsRead(channelId, user.userId);
  }
}
