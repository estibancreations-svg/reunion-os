/**
 * Simple toast event bus for client components.
 */

export type ToastKind = 'success' | 'error' | 'info' | 'warning' | 'achievement' | 'xp';

export interface ToastItem {
  id: string;
  kind: ToastKind;
  title: string;
  body?: string;
  durationMs?: number;
}

type Listener = (t: ToastItem) => void;

const listeners = new Set<Listener>();

export function subscribeToasts(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function pushToast(partial: Omit<ToastItem, 'id'> & { id?: string }) {
  const t: ToastItem = {
    id: partial.id ?? `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind: partial.kind,
    title: partial.title,
    body: partial.body,
    durationMs: partial.durationMs ?? 4000,
  };
  listeners.forEach((fn) => fn(t));
  return t;
}

export function toastSuccess(title: string, body?: string) {
  return pushToast({ kind: 'success', title, body });
}

export function toastError(title: string, body?: string) {
  return pushToast({ kind: 'error', title, body });
}

export function toastInfo(title: string, body?: string) {
  return pushToast({ kind: 'info', title, body });
}

export function toastAchievement(title: string, body?: string) {
  return pushToast({ kind: 'achievement', title, body, durationMs: 6000 });
}
