'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { useAuth } from '../../../contexts/AuthContext';

const osirisUrl = process.env.NEXT_PUBLIC_OSIRIS_URL?.trim() || '';

const signals = [
  {
    title: 'Flight movement',
    desc: 'Monitor airport arrivals, pickup windows, and route disruption risk for traveling guests.',
  },
  {
    title: 'Maritime visibility',
    desc: 'Track port-adjacent activity when ferries, cruise arrivals, or waterfront access affect the event plan.',
  },
  {
    title: 'Satellite and weather context',
    desc: 'Use wide-area conditions for route monitoring, outdoor operations, and contingency planning.',
  },
];

const workflowLinks = [
  {
    href: '/admin/intake',
    title: 'Intake triggers',
    desc: 'Capture airport pickup, travel monitoring, port coordination, and weather watch needs during setup.',
  },
  {
    href: '/admin/assignments',
    title: 'Assignment follow-through',
    desc: 'Route intelligence-driven follow-ups into the matrix only after they become actionable.',
  },
  {
    href: '/comms',
    title: 'Comms escalation',
    desc: 'Use Comms Hub for exceptions, disruptions, and coordinator handoff after human review.',
  },
];

export default function IntelligencePage() {
  const { user, isLoading, canEditMatrix } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
    if (user && !canEditMatrix) router.replace('/admin');
  }, [user, isLoading, canEditMatrix, router]);

  if (isLoading || !user || !canEditMatrix) return null;

  return (
    <AppShell variant="admin" title="Operations Intelligence">
      <div className="space-y-6">
        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-wider text-slate-500">Admin-only read-only surface</p>
              <h1 className="mt-1 text-xl font-semibold">Operations Intelligence</h1>
              <p className="mt-2 text-sm text-slate-400">
                OSIRIS runs as a separate service and is linked into Reunion OS for situational awareness only.
                Review external intelligence here, then escalate only high-signal items into assignments, comms,
                or follow-up tasks.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {osirisUrl ? (
                <a
                  href={osirisUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
                >
                  Open OSIRIS
                </a>
              ) : (
                <Link
                  href="/admin/intake"
                  className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
                >
                  Configure workflow inputs
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-3">
          {signals.map((signal) => (
            <div key={signal.title} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h2 className="font-medium text-amber-400">{signal.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{signal.desc}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Embedded OSIRIS view</h2>
              <p className="mt-1 text-sm text-slate-400">
                Embed first when the OSIRIS host allows framing. If the panel is blank or blocked, open the
                standalone service instead.
              </p>
            </div>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-300">
              Phase 1
            </span>
          </div>

          {osirisUrl ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-amber-700/40 bg-amber-500/10 p-3 text-xs text-amber-100">
                This view is read-only. Keep OSIRIS auth, API keys, and infrastructure separate from Reunion OS.
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                <iframe
                  title="OSIRIS intelligence dashboard"
                  src={osirisUrl}
                  className="h-[720px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span>Fallback: if framing is denied by CSP or X-Frame-Options, launch the external service.</span>
                <a href={osirisUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                  Launch OSIRIS in new tab
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-300">No OSIRIS endpoint configured yet.</p>
              <p className="mt-2 text-sm text-slate-500">
                Set <code>NEXT_PUBLIC_OSIRIS_URL</code> to the separately deployed OSIRIS host or reverse-proxied
                subdomain. Until then, Reunion OS keeps this integration dormant.
              </p>
            </div>
          )}
        </section>

        <section className="grid gap-3 lg:grid-cols-3">
          {workflowLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-amber-600/50"
            >
              <h2 className="font-medium">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{item.desc}</p>
            </Link>
          ))}
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
          <h2 className="font-semibold">Adapter layer recommendation</h2>
          <p className="mt-2 text-sm text-slate-400">
            Do not write OSIRIS data directly into app state yet. Add a small internal adapter later that normalizes
            only high-value disruptions into Reunion OS notifications, comms alerts, or follow-up tasks.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
