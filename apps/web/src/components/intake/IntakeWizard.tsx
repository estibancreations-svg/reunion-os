'use client';

import React, { useState } from 'react';
import type { IntakeAnswer } from '../../types';
import { runIntakeGeneration } from '../../lib/store';
import { useAuth } from '../../contexts/AuthContext';

const QUESTIONS = [
  { id: 'eventName', label: 'What is the name of this reunion / event?', type: 'text' as const, required: true },
  { id: 'eventDate', label: 'Target event date', type: 'date' as const, required: true },
  { id: 'expectedHeadcount', label: 'Expected headcount (approximate)', type: 'number' as const, required: false },
  { id: 'budgetBand', label: 'Rough total budget band (USD)', type: 'text' as const, required: false },
  { id: 'hasCatering', label: 'Will there be formal catering / food service?', type: 'boolean' as const },
  { id: 'hasEntertainment', label: 'Will there be DJ / talent / entertainment programming?', type: 'boolean' as const },
  { id: 'hasKidsActivities', label: 'Will there be dedicated kids activities / crafts?', type: 'boolean' as const },
  { id: 'hasVenue', label: 'Do you need venue / pavilion / parking logistics?', type: 'boolean' as const },
  { id: 'hasSecurity', label: 'Do you need security / first-aid coverage?', type: 'boolean' as const },
  { id: 'needsDeposits', label: 'Will households pay deposits / dues through this system?', type: 'boolean' as const },
  { id: 'multiDay', label: 'Is this a multi-day reunion?', type: 'boolean' as const },
];

export function IntakeWizard() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});
  const [result, setResult] = useState<{ taskCount: number; categoryCount: number } | null>(null);
  const [running, setRunning] = useState(false);

  const q = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  const setValue = (value: string | number | boolean) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  };

  const canNext =
    !q.required ||
    (answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null);

  const finish = () => {
    if (!user) return;
    setRunning(true);
    const payload: IntakeAnswer[] = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));
    const { newTasks, session } = runIntakeGeneration(payload, user.userId);
    setResult({
      taskCount: newTasks.length,
      categoryCount: session.generatedCategoryIds.length,
    });
    setRunning(false);
  };

  if (result) {
    return (
      <div className="max-w-xl mx-auto bg-[#1A1615] border border-[#3F3A36] rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="font-serif text-2xl font-bold text-[#FDFBF7] mb-2">Intake Complete</h2>
        <p className="text-[#A89F91] mb-6">
          Generated <strong className="text-[#FDFBF7]">{result.taskCount}</strong> tasks across{' '}
          <strong className="text-[#FDFBF7]">{result.categoryCount}</strong> categories.
        </p>
        <p className="text-sm text-[#5C544D] mb-6">
          Tasks are in the pool. Assign owners in the Responsibility Matrix.
        </p>
        <div className="flex gap-3 justify-center">
          <a href="/admin/assignments" className="px-5 py-2.5 bg-[#C84B31] text-white rounded-lg text-sm font-bold">
            Open Matrix
          </a>
          <button
            onClick={() => {
              setResult(null);
              setStep(0);
              setAnswers({});
            }}
            className="px-5 py-2.5 border border-[#5C544D] text-[#A89F91] rounded-lg text-sm"
          >
            Run another intake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-[#1A1615] border border-[#3F3A36] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#3F3A36] flex justify-between items-center">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#A89F91]">Intake Engine</p>
          <h2 className="font-serif text-xl font-bold text-[#FDFBF7]">
            Step {step + 1} of {QUESTIONS.length}
          </h2>
        </div>
        <div className="flex gap-1">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full ${i <= step ? 'bg-[#C84B31]' : 'bg-[#3F3A36]'}`}
            />
          ))}
        </div>
      </div>

      <div className="p-8">
        <label className="block text-lg font-medium text-[#FDFBF7] mb-4">{q.label}</label>

        {q.type === 'text' && (
          <input
            type="text"
            value={(answers[q.id] as string) ?? ''}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-3 bg-[#2C2825] border border-[#3F3A36] rounded-xl text-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-[#C84B31]/50"
            placeholder="e.g. Henry Family Reunion 2026"
          />
        )}
        {q.type === 'date' && (
          <input
            type="date"
            value={(answers[q.id] as string) ?? ''}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-3 bg-[#2C2825] border border-[#3F3A36] rounded-xl text-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-[#C84B31]/50"
          />
        )}
        {q.type === 'number' && (
          <input
            type="number"
            value={(answers[q.id] as number) ?? ''}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full px-4 py-3 bg-[#2C2825] border border-[#3F3A36] rounded-xl text-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-[#C84B31]/50"
            placeholder="150"
          />
        )}
        {q.type === 'boolean' && (
          <div className="flex gap-3">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                onClick={() => setValue(v)}
                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition ${
                  answers[q.id] === v
                    ? 'bg-[#C84B31] border-[#C84B31] text-white'
                    : 'bg-[#2C2825] border-[#3F3A36] text-[#A89F91] hover:border-[#5C544D]'
                }`}
              >
                {v ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-8 pb-8 flex justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-4 py-2 text-sm text-[#A89F91] disabled:opacity-30"
        >
          Back
        </button>
        {isLast ? (
          <button
            onClick={finish}
            disabled={!canNext || running}
            className="px-6 py-2.5 bg-[#C84B31] text-white rounded-lg text-sm font-bold disabled:opacity-40"
          >
            {running ? 'Generating…' : 'Generate Categories & Tasks'}
          </button>
        ) : (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
            className="px-6 py-2.5 bg-[#C84B31] text-white rounded-lg text-sm font-bold disabled:opacity-40"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
