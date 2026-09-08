'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { useAuth } from '../../../contexts/AuthContext';

const dimensions = [
  { key: 'onboarding', label: 'Onboarding + trust/safety', score: 62, target: 95 },
  { key: 'realtime', label: 'Realtime comms (chat/chirp/video handoff)', score: 58, target: 95 },
  { key: 'crossDevice', label: 'Cross-device continuity', score: 68, target: 95 },
  { key: 'notifications', label: 'Notifications + escalation', score: 61, target: 95 },
  { key: 'collaboration', label: 'Mentions/attachments/reactions/read-state', score: 57, target: 95 },
  { key: 'searchAudit', label: 'Search + history + auditability', score: 64, target: 95 },
  { key: 'performance', label: 'Weak-network resilience', score: 55, target: 95 },
  { key: 'privacyRecovery', label: 'Privacy controls + account recovery', score: 45, target: 95 },
];

const knownRisks = [
  'Adoption drift if members coordinate in external apps instead of in-app comms.',
  'State drift between demo localStorage and server persistence during multi-user rollout.',
  'Push/real-time reliability gaps on mobile may reduce daily engagement.',
  'Insufficient trust/safety and account recovery patterns can block production readiness.',
];

export default function BenchmarkPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const overall = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length);

  return (
    <AppShell variant="admin" title="Architect Benchmark (Top-200 Pattern Scorecard)">
      <div className="space-y-6">
        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Benchmark sample size</p>
          <h1 className="text-xl font-semibold mt-1">Top-200 Pattern Coverage</h1>
          <p className="text-sm text-slate-400 mt-2">
            Current score {overall}/100 against high-adoption patterns seen in top networking, dating,
            productivity, and community coordination apps.
          </p>
        </section>

        <section className="grid gap-3">
          {dimensions.map((d) => (
            <div key={d.key} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex justify-between items-center gap-2">
                <h2 className="font-medium text-sm sm:text-base">{d.label}</h2>
                <span className="text-xs sm:text-sm text-amber-400 font-semibold">
                  {d.score} / {d.target}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 mt-3 overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, d.score)}%` }} />
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
          <h2 className="font-semibold">Shortcomings likely to mirror other apps if ignored</h2>
          <ul className="list-disc list-inside text-sm text-slate-400 mt-3 space-y-1">
            {knownRisks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
