'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { getAssignments } from '../../lib/store';
import { AppShell } from '../../components/layout/AppShell';

export default function LoginPage() {
  const { loginAs, user } = useAuth();
  const router = useRouter();
  const people = typeof window !== 'undefined' ? getAssignments() : [];

  if (user) {
    router.replace(user.roleTier === 'VOLUNTEER' || user.roleTier === 'GUEST' ? '/user/punchlist' : '/admin');
  }

  return (
    <AppShell variant="public" title="Sign in">
      <div className="max-w-md mx-auto space-y-4">
        <p className="text-sm text-[#A89F91] mb-6">
          Demo mode — pick any family member to experience their role and surface.
        </p>
        {people.map((a) => (
          <button
            key={a.userId}
            onClick={() => {
              loginAs(a.userId);
              const dest =
                a.roleTier === 'VOLUNTEER' || a.roleTier === 'GUEST'
                  ? '/user/punchlist'
                  : '/admin';
              router.push(dest);
            }}
            className="w-full text-left px-5 py-4 bg-[#1A1615] border border-[#3F3A36] rounded-xl hover:border-[#C84B31] transition flex justify-between items-center"
          >
            <div>
              <div className="font-semibold text-[#FDFBF7]">{a.profile.fullName}</div>
              <div className="text-xs text-[#A89F91]">
                {a.title} · {a.roleTier.replace(/_/g, ' ')}
              </div>
            </div>
            <span className="text-[#C84B31] text-sm font-bold">Enter →</span>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
