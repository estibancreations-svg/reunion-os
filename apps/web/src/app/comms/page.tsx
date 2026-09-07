'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../components/layout/AppShell';
import { CommsHub } from '../../components/comms/CommsHub';
import { useAuth } from '../../contexts/AuthContext';

export default function CommsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  return (
    <AppShell variant={user.roleTier === 'VOLUNTEER' || user.roleTier === 'GUEST' ? 'user' : 'admin'} title="Comms Hub">
      <CommsHub />
    </AppShell>
  );
}
