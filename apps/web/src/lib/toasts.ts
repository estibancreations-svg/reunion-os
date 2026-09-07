export type ToastKind = 'success' | 'info' | 'warning' | 'error' | 'xp';

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
  return () => listeners.delete(fn);
}

export function pushToast(partial: Omit<ToastItem, 'id'>) {
  const t: ToastItem = {
    id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    durationMs: partial.kind === 'xp' ? 3200 : 2800,
    ...partial,
  };
  listeners.forEach((fn) => fn(t));
  return t.id;
}
