import type { AuditEvent } from '../types';

const KEY = 'reunion.v4.audit';

function load(): AuditEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(events: AuditEvent[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(events.slice(0, 500)));
}

export function recordAudit(partial: Omit<AuditEvent, 'eventId' | 'timestamp'>) {
  const event: AuditEvent = {
    ...partial,
    eventId: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  const next = [event, ...load()];
  save(next);
  return event;
}

export function getAuditLog(limit = 50): AuditEvent[] {
  return load().slice(0, limit);
}
