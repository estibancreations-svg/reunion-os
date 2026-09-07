'use client';

import React, { useEffect, useState } from 'react';
import { subscribeToasts, type ToastItem } from '../../lib/toasts';

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToasts((t) => {
      setItems((prev) => [...prev.slice(-4), t]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id));
      }, t.durationMs ?? 2800);
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-xl px-4 py-3 shadow-2xl border text-sm animate-[slideIn_0.25s_ease-out] ${
            t.kind === 'xp'
              ? 'bg-[#C84B31] border-[#E07A5F] text-white'
              : t.kind === 'success'
                ? 'bg-emerald-900 border-emerald-600 text-emerald-50'
                : t.kind === 'error'
                  ? 'bg-red-900 border-red-600 text-red-50'
                  : t.kind === 'warning'
                    ? 'bg-amber-900 border-amber-600 text-amber-50'
                    : 'bg-[#1A1615] border-[#5C544D] text-[#FDFBF7]'
          }`}
        >
          <div className="font-bold">{t.title}</div>
          {t.body && <div className="opacity-90 text-xs mt-0.5">{t.body}</div>}
        </div>
      ))}
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
