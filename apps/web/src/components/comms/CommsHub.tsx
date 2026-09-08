'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAssignments, getCommsTyping, setCommsTyping } from '../../lib/store';
import {
  fetchCommsChannels,
  fetchCommsMessages,
  fetchCommsPresence,
  patchCommsPresence,
  postCommsChirp,
  postCommsText,
  postMarkCommsRead,
} from '../../lib/commsApi';
import type { CommsChannel, CommsMessage, CommsPresence } from '../../types';
import { toastError, toastInfo, toastSuccess } from '../../lib/toasts';

async function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function CommsHub() {
  const { user } = useAuth();
  const [source, setSource] = useState<'api' | 'local'>('local');
  const [channels, setChannels] = useState<CommsChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [draft, setDraft] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, CommsMessage[]>>({});
  const [presenceByUser, setPresenceByUser] = useState<Record<string, CommsPresence>>({});
  const [unreadByChannel, setUnreadByChannel] = useState<Record<string, number>>({});

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const typingTimeoutRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);
  const lastNotifyRef = useRef<string>('');

  const assignments = getAssignments();

  const pull = async () => {
    if (!user) return;

    const channelsResult = await fetchCommsChannels(user);
    setSource(channelsResult.source);
    setChannels(channelsResult.data);

    if (!activeChannelId && channelsResult.data.length > 0) {
      setActiveChannelId(channelsResult.data[0].id);
    }

    const presenceResult = await fetchCommsPresence(user);
    const presenceMap: Record<string, CommsPresence> = {};
    presenceResult.data.forEach((p) => {
      presenceMap[p.userId] = p;
    });
    setPresenceByUser(presenceMap);

    const ids = channelsResult.data.map((c) => c.id);
    const messagePairs = await Promise.all(ids.map((channelId) => fetchCommsMessages(user, channelId)));

    const nextMessagesByChannel: Record<string, CommsMessage[]> = {};
    const nextUnread: Record<string, number> = {};

    ids.forEach((channelId, idx) => {
      const rows = messagePairs[idx]?.data ?? [];
      nextMessagesByChannel[channelId] = rows;
      nextUnread[channelId] = rows.filter(
        (m) => m.senderUserId !== user.userId && !m.readByUserIds.includes(user.userId)
      ).length;
    });

    setMessagesByChannel(nextMessagesByChannel);
    setUnreadByChannel(nextUnread);

    const activeMessages = nextMessagesByChannel[activeChannelId] ?? [];
    const latestIncoming = [...activeMessages]
      .reverse()
      .find((m) => m.senderUserId !== user.userId && !m.readByUserIds.includes(user.userId));

    if (
      latestIncoming &&
      document.visibilityState !== 'visible' &&
      latestIncoming.id !== lastNotifyRef.current &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(`New message from ${latestIncoming.senderName}`, {
        body: latestIncoming.type === 'chirp' ? 'Sent a chirp audio clip' : latestIncoming.body ?? 'New message',
      });
      lastNotifyRef.current = latestIncoming.id;
    }
  };

  useEffect(() => {
    if (!user) return;

    patchCommsPresence(user, 'online');
    pull();

    pollRef.current = window.setInterval(() => {
      pull();
    }, 3000);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      patchCommsPresence(user, 'away');
    };
  }, [user]);

  useEffect(() => {
    if (!user || !activeChannelId) return;
    postMarkCommsRead(user, activeChannelId);
    pull();
  }, [user, activeChannelId]);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') Notification.requestPermission();
  }, []);

  const messages = useMemo(() => messagesByChannel[activeChannelId] ?? [], [messagesByChannel, activeChannelId]);
  const typing = useMemo(
    () => (activeChannelId && user ? getCommsTyping(activeChannelId, user.userId) : []),
    [activeChannelId, user, draft]
  );

  if (!user) return null;

  const activeChannel = channels.find((c) => c.id === activeChannelId) ?? null;

  async function submitText() {
    if (!activeChannelId || !user) return;
    const mentionMatches = Array.from(draft.matchAll(/@(\w[\w-]+)/g)).map((x) => x[1]);
    const mentionUserIds = assignments
      .filter(
        (a) =>
          mentionMatches.includes(a.userId) ||
          mentionMatches.includes((a.profile?.fullName ?? '').replace(/\s+/g, ''))
      )
      .map((a) => a.userId);

    const result = await postCommsText(user, activeChannelId, draft, mentionUserIds);
    if (!result.data) return;

    setDraft('');
    setCommsTyping(activeChannelId, user, false);
    await postMarkCommsRead(user, activeChannelId);
    await pull();
  }

  function onDraftChange(value: string) {
    setDraft(value);
    if (!activeChannelId || !user) return;
    setCommsTyping(activeChannelId, user, value.trim().length > 0);
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      setCommsTyping(activeChannelId, user, false);
    }, 3000);
  }

  async function toggleRecording() {
    if (!activeChannelId || !user) return;

    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      toastInfo('Recording unavailable', 'Use upload chirp to share an audio clip from your phone.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const dataUrl = await toDataUrl(blob);
        await postCommsChirp(user, activeChannelId, dataUrl);
        toastSuccess('Chirp sent');
        stream.getTracks().forEach((t) => t.stop());
        await pull();
      };
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      toastError('Microphone access denied', 'Allow mic access or use upload chirp.');
    }
  }

  async function uploadChirp(file?: File) {
    if (!file || !activeChannelId || !user) return;
    const dataUrl = await toDataUrl(file);
    await postCommsChirp(user, activeChannelId, dataUrl);
    toastSuccess('Chirp uploaded');
    await pull();
  }

  const participant = assignments.find((a) => a.userId !== user.userId);
  const participantEmail = participant?.profile?.email;
  const facetime = participantEmail ? `facetime://${participantEmail}` : null;
  const facetimeAudio = participantEmail ? `facetime-audio://${participantEmail}` : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300 px-1">Channels</h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{source}</span>
        </div>
        {channels.map((channel) => {
          const unread = unreadByChannel[channel.id] ?? 0;
          return (
            <button
              key={channel.id}
              onClick={() => setActiveChannelId(channel.id)}
              className={`w-full text-left rounded-lg px-3 py-2 border transition ${
                activeChannelId === channel.id
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center gap-2">
                <div className="font-medium">{channel.name}</div>
                {unread > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-600 text-white">{unread}</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{channel.description}</p>
            </button>
          );
        })}
      </aside>

      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 sm:p-4 space-y-4 min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-semibold">{activeChannel?.name ?? 'Comms'}</h1>
            <p className="text-xs text-slate-500">
              {typing.length > 0
                ? `${typing.map((t) => t.userName).join(', ')} typing...`
                : 'Fast chat, chirps, and call handoff'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={facetime ?? '#'}
              className={`text-xs px-2 py-1 rounded border ${
                facetime
                  ? 'border-slate-700 hover:bg-slate-800'
                  : 'border-slate-800 text-slate-600 pointer-events-none'
              }`}
            >
              FaceTime Video
            </a>
            <a
              href={facetimeAudio ?? '#'}
              className={`text-xs px-2 py-1 rounded border ${
                facetimeAudio
                  ? 'border-slate-700 hover:bg-slate-800'
                  : 'border-slate-800 text-slate-600 pointer-events-none'
              }`}
            >
              FaceTime Audio
            </a>
            <a href="tel:" className="text-xs px-2 py-1 rounded border border-slate-700 hover:bg-slate-800">
              Phone Call
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 max-h-[52vh] overflow-y-auto space-y-3">
          {messages.length === 0 && <p className="text-sm text-slate-500">No messages yet.</p>}
          {messages.map((m) => {
            const mine = m.senderUserId === user.userId;
            const presence = presenceByUser[m.senderUserId];
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 border ${
                    mine ? 'bg-amber-600/20 border-amber-700' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                    <span>{m.senderName}</span>
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        presence?.status === 'online'
                          ? 'bg-emerald-400'
                          : presence?.status === 'away'
                            ? 'bg-amber-400'
                            : 'bg-slate-500'
                      }`}
                    />
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {m.type === 'chirp' ? (
                    <audio controls className="max-w-full" src={m.audioUrl} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Type a message... use @userId to mention"
            rows={3}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={submitText}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-sm"
            >
              Send
            </button>
            <button
              onClick={toggleRecording}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                isRecording ? 'border-red-500 text-red-300' : 'border-slate-700 hover:bg-slate-800'
              }`}
            >
              {isRecording ? 'Stop chirp' : 'Record chirp'}
            </button>
            <label className="px-3 py-1.5 rounded-lg text-sm border border-slate-700 hover:bg-slate-800 cursor-pointer">
              Upload chirp
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => uploadChirp(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
