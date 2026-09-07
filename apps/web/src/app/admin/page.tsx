'use client';

import Link from 'next/link';
import { AppShell } from '../../components/layout/AppShell';

const cards = [
  { href: '/admin/assignments', title: 'Assignment Matrix', desc: 'Spreadsheet view of roles & categories' },
  { href: '/admin/categories', title: 'Categories', desc: 'Operational categories & colors' },
  { href: '/admin/intake', title: 'Intake Wizard', desc: 'Guided event setup questionnaire' },
  { href: '/admin/activity', title: 'Activity', desc: 'Recent system events' },
  { href: '/admin/leaderboard', title: 'Leaderboard', desc: 'XP and streaks' },
  { href: '/comms', title: 'Comms Hub', desc: 'Chat, chirp audio, and one-tap call handoff' },
  { href: '/admin/benchmark', title: 'Benchmark', desc: 'Top-200 pattern coverage and risk radar' },
];

export default function AdminDashboard() {
  return (
    <AppShell title="Admin" variant="admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-400 mt-1">Reunion OS control center</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-amber-600/50 transition"
          >
            <h2 className="font-semibold text-amber-400">{c.title}</h2>
            <p className="text-sm text-slate-400 mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
