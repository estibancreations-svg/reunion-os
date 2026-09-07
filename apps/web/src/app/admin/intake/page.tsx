'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { IntakeWizard } from '../../../components/intake/IntakeWizard';
import { useAuth } from '../../../contexts/AuthContext';

export default function IntakePage() {
  const { user, isLoading, canRunIntake } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
    if (user && !canRunIntake) router.replace('/admin');
  }, [user, isLoading, canRunIntake, router]);

  if (isLoading || !user || !canRunIntake) return null;

  return (
    <AppShell variant="admin" title="Intake Engine">
      <p className="text-sm text-[#A89F91] mb-6 max-w-xl">
        Answer the operational questions. The engine generates categories and seed tasks,
        then drops them into the pool for assignment in the Responsibility Matrix.
      </p>
      <IntakeWizard />
    </AppShell>
  );
}
