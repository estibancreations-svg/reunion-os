'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { store } from '../../lib/store';
import { toastSuccess } from '../../lib/toasts';
import { submitIntakeApi } from '../../lib/appApi';

const QUESTIONS = [
  { id: 'eventName', label: 'What is the name of this reunion / event?', type: 'text', required: true },
  { id: 'eventDate', label: 'Target event date', type: 'date', required: true },
  { id: 'expectedHeadcount', label: 'Expected headcount (approximate)', type: 'number', required: false },
  { id: 'budgetBand', label: 'Rough total budget band (USD)', type: 'text', required: false },
  { id: 'hasCatering', label: 'Will there be formal catering / food service?', type: 'boolean' },
  { id: 'hasEntertainment', label: 'Will there be DJ / talent / entertainment?', type: 'boolean' },
  { id: 'hasKidsActivities', label: 'Dedicated kids activities?', type: 'boolean' },
  { id: 'hasVenue', label: 'Need venue / parking logistics?', type: 'boolean' },
  { id: 'hasSecurity', label: 'Need security / first-aid?', type: 'boolean' },
  { id: 'needsAirportPickup', label: 'Need airport pickup coordination or arrival tracking?', type: 'boolean' },
  { id: 'needsTravelMonitoring', label: 'Need route or travel disruption monitoring?', type: 'boolean' },
  { id: 'needsPortCoordination', label: 'Need ferry, cruise, or port coordination visibility?', type: 'boolean' },
  { id: 'needsWeatherMonitoring', label: 'Need weather watch or outdoor operations monitoring?', type: 'boolean' },
];

export function IntakeWizard() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean | number>>({});
  const [done, setDone] = useState(false);
  const [source, setSource] = useState<'api' | 'local' | null>(null);
  const [tasksCreated, setTasksCreated] = useState<number>(0);

  const q = QUESTIONS[step];
  const progress = Math.round(((step + 1) / QUESTIONS.length) * 100);

  function setAnswer(value: string | boolean | number) {
    setAnswers((a) => ({ ...a, [q.id]: value }));
  }

  function next() {
    if (step < QUESTIONS.length - 1) setStep((s) => s + 1);
    else finish();
  }

  async function finish() {
    if (!user) return;
    const answerRows = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));
    const session = {
      id: `intake-${Date.now()}`,
      userId: user.userId,
      answers: answerRows,
      createdAt: new Date().toISOString(),
      status: 'completed' as const,
    };
    const result = await submitIntakeApi(user, answerRows);
    setSource(result.source);
    setTasksCreated(result.tasksCreated);
    store.saveIntakeSession(session as any);
    store.logActivity({
      userId: user.userId,
      type: 'intake_complete',
      summary: 'Completed intake wizard',
    });
    toastSuccess(
      'Intake saved',
      result.source === 'api'
        ? `${result.tasksCreated} tasks generated for assignment.`
        : 'Saved locally (API unavailable).'
    );
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <h2 className="text-xl font-semibold text-emerald-400 mb-2">Intake complete</h2>
        <p className="text-slate-400">Session stored. Use the matrix or punch-list to assign follow-ups.</p>
        <p className="text-xs text-slate-500 mt-2">
          Source: {source ?? 'local'} {source === 'api' ? `· Tasks generated: ${tasksCreated}` : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-500 mt-1">Step {step + 1} of {QUESTIONS.length}</p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <label className="block text-lg font-medium">{q.label}</label>
        {q.type === 'boolean' ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAnswer(true)}
              className={`px-4 py-2 rounded-lg border ${answers[q.id] === true ? 'border-amber-500 bg-amber-500/20' : 'border-slate-700'}`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setAnswer(false)}
              className={`px-4 py-2 rounded-lg border ${answers[q.id] === false ? 'border-amber-500 bg-amber-500/20' : 'border-slate-700'}`}
            >
              No
            </button>
          </div>
        ) : (
          <input
            type={q.type === 'number' ? 'number' : q.type === 'date' ? 'date' : 'text'}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            value={(answers[q.id] as string | number) ?? ''}
            onChange={(e) =>
              setAnswer(q.type === 'number' ? Number(e.target.value) : e.target.value)
            }
          />
        )}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="text-sm text-slate-400 disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-sm font-medium"
          >
            {step === QUESTIONS.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
