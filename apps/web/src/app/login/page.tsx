'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '../../contexts/AuthContext';
import { getAssignments } from '../../lib/store';
import { AppShell } from '../../components/layout/AppShell';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '../../lib/supabaseClient';

type OAuthProvider = 'google' | 'apple' | 'yahoo';

export default function LoginPage() {
  const { loginAs, refreshSession, user } = useAuth();
  const router = useRouter();
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [busyProvider, setBusyProvider] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<string>('');
  const [lastSyncedIdentity, setLastSyncedIdentity] = useState<string>('');

  const people = typeof window !== 'undefined' ? getAssignments() : [];
  const supabaseReady = isSupabaseConfigured();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  function goForRole(roleTier?: string) {
    return roleTier === 'VOLUNTEER' || roleTier === 'GUEST' ? '/user/punchlist' : '/admin';
  }

  useEffect(() => {
    if (user) router.replace(goForRole(user.roleTier));
  }, [user, router]);

  async function syncExternalUser(supabaseUser: User, providerHint?: string) {
    const identity = supabaseUser.id || supabaseUser.email || supabaseUser.phone || '';
    if (!identity || identity === lastSyncedIdentity) return;

    const provider =
      providerHint ||
      String(supabaseUser.app_metadata?.provider || supabaseUser.user_metadata?.provider || 'external').toLowerCase();

    const fullName =
      String(
        supabaseUser.user_metadata?.full_name ||
          supabaseUser.user_metadata?.name ||
          supabaseUser.email ||
          supabaseUser.phone ||
          supabaseUser.id
      );

    const response = await fetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        provider,
        externalUserId: supabaseUser.id,
        email: supabaseUser.email,
        phone: supabaseUser.phone,
        fullName,
      }),
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok || !json?.ok) {
      throw new Error(json?.message || 'Unable to sync session.');
    }

    setLastSyncedIdentity(identity);
    const ok = await refreshSession();
    if (!ok) throw new Error('Session sync failed after login.');
  }

  useEffect(() => {
    if (!supabase || !supabaseReady) return;

    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active || !data.session?.user) return;
      try {
        await syncExternalUser(data.session.user);
        setStatus('Signed in successfully.');
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Sign-in sync failed.');
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active || !session?.user) return;
      if (event !== 'SIGNED_IN' && event !== 'TOKEN_REFRESHED' && event !== 'INITIAL_SESSION') return;
      try {
        await syncExternalUser(session.user);
      } catch {
        // handled by manual status actions
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase, supabaseReady, lastSyncedIdentity]);

  async function handleOAuth(provider: OAuthProvider) {
    if (!supabase) {
      setStatus('Supabase auth is not configured.');
      return;
    }

    setBusyProvider(provider);
    setStatus('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: { redirectTo: `${window.location.origin}/login` },
    });

    if (error) {
      setStatus(error.message);
      setBusyProvider(null);
      return;
    }
  }

  async function sendEmailMagicLink() {
    if (!supabase) {
      setStatus('Supabase auth is not configured.');
      return;
    }
    setBusyProvider('email');
    setStatus('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) {
      setStatus(error.message);
    } else {
      setStatus('Magic link sent. Check your email.');
    }
    setBusyProvider(null);
  }

  async function sendPhoneOtp() {
    if (!supabase) {
      setStatus('Supabase auth is not configured.');
      return;
    }
    setBusyProvider('phone-send');
    setStatus('');
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) setStatus(error.message);
    else setStatus('SMS code sent. Enter it below to verify.');
    setBusyProvider(null);
  }

  async function verifyPhoneOtp() {
    if (!supabase) {
      setStatus('Supabase auth is not configured.');
      return;
    }
    setBusyProvider('phone-verify');
    setStatus('');

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });

    if (error) {
      setStatus(error.message);
      setBusyProvider(null);
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      await syncExternalUser(data.session.user, 'phone');
      setStatus('Phone sign-in successful.');
    }

    setBusyProvider(null);
  }

  return (
    <AppShell variant="public" title="Sign in">
      <div className="max-w-md mx-auto space-y-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
          <h2 className="font-semibold text-slate-100">Production sign-in</h2>
          <p className="text-xs text-slate-400">
            OAuth (Google, Apple, Yahoo), email magic link, and phone OTP are available when Supabase is configured.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['google', 'apple', 'yahoo'] as OAuthProvider[]).map((provider) => (
              <button
                key={provider}
                disabled={!supabaseReady || busyProvider === provider}
                onClick={() => handleOAuth(provider)}
                className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-sm disabled:opacity-50"
              >
                {provider[0].toUpperCase() + provider.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400">Email magic link</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
              <button
                disabled={!supabaseReady || !email || busyProvider === 'email'}
                onClick={sendEmailMagicLink}
                className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-sm disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400">Phone OTP</label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+15555555555"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
              <button
                disabled={!supabaseReady || !phone || busyProvider === 'phone-send'}
                onClick={sendPhoneOtp}
                className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-sm disabled:opacity-50"
              >
                Send OTP
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
              <button
                disabled={!supabaseReady || !phone || !otp || busyProvider === 'phone-verify'}
                onClick={verifyPhoneOtp}
                className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-sm disabled:opacity-50"
              >
                Verify
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">Supabase status: {supabaseReady ? 'configured' : 'not configured'}</p>
          {status && <p className="text-xs text-amber-300">{status}</p>}
        </div>

        <div className="space-y-4">
          <p className="text-sm text-[#A89F91]">Demo mode fallback — pick a family member role.</p>
          {people.map((a) => (
            <button
              key={a.userId}
              disabled={busyUserId === a.userId}
              onClick={async () => {
                setBusyUserId(a.userId);
                const ok = await loginAs(a.userId);
                if (!ok) {
                  setBusyUserId(null);
                  return;
                }
                const dest = goForRole(a.roleTier);
                router.push(dest);
              }}
              className="w-full text-left px-5 py-4 bg-[#1A1615] border border-[#3F3A36] rounded-xl hover:border-[#C84B31] transition flex justify-between items-center disabled:opacity-60"
            >
              <div>
                <div className="font-semibold text-[#FDFBF7]">{a.profile?.fullName ?? a.userName ?? a.userId}</div>
                <div className="text-xs text-[#A89F91]">
                  {a.title} · {(a.roleTier ?? 'VOLUNTEER').replace(/_/g, ' ')}
                </div>
              </div>
              <span className="text-[#C84B31] text-sm font-bold">Enter →</span>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
