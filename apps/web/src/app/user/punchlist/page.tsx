'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import PersonalPunchList from '../../../components/user/PersonalPunchList';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getAssignmentForUser,
  getConvergedPunchList,
  updateTask,
  updateTaskStatus,
  completeTaskWithRewards,
  getGamification,
} from '../../../lib/store';
import type { PunchListItem, TaskStatus, UserAssignment, GamificationProfile } from '../../../types';
import { GameHUD } from '../../../components/game/GameHUD';
import { defaultGamification } from '../../../lib/gamification';

export default function PunchListPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [assignment, setAssignment] = useState<UserAssignment | null>(null);
  const [tasks, setTasks] = useState<PunchListItem[]>([]);
  const [profile, setProfile] = useState<GamificationProfile | null>(null);

  const refresh = useCallback((userId: string) => {
    setAssignment(getAssignmentForUser(userId) ?? null);
    setTasks(getConvergedPunchList(userId));
    setProfile(getGamification(userId));
  }, []);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
    if (user) refresh(user.userId);
  }, [user, isLoading, router, refresh]);

  const handleUpload = useCallback(
    (taskId: string, file: File) => {
      if (!user) return;
      const url = URL.createObjectURL(file);
      const current = tasks.find((t) => t.taskId === taskId);
      updateTask(taskId, {
        uploadedProofUrls: [...(current?.uploadedProofUrls ?? []), url],
        status: 'IN_PROGRESS',
      });
      refresh(user.userId);
    },
    [user, tasks, refresh]
  );

  const handleStatus = useCallback(
    (taskId: string, status: TaskStatus) => {
      if (!user) return;
      if (status === 'COMPLETED') {
        const { profile: p } = completeTaskWithRewards(taskId, user.userId, user.fullName);
        setProfile(p);
        setTasks(getConvergedPunchList(user.userId));
      } else {
        updateTaskStatus(taskId, status, user.userId);
        setTasks(getConvergedPunchList(user.userId));
      }
    },
    [user]
  );

  if (isLoading || !user || !assignment) return null;

  return (
    <AppShell variant="user">
      <div className="space-y-4">
        <GameHUD profile={profile ?? assignment.gamification ?? defaultGamification(assignment.userId)} />
        <PersonalPunchList
          userFullName={assignment.profile.fullName}
          userTitle={assignment.title}
          assignedCategories={assignment.assignedCategories}
          punchListItems={tasks}
          onUploadProof={handleUpload}
          onStatusChange={handleStatus}
        />
      </div>
    </AppShell>
  );
}
