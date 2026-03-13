'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Hash, Search, Users, CheckCircle2, AlertTriangle, Clock3, MessageSquareQuote } from 'lucide-react';

type StandupEntry = {
  agentId: string;
  name: string;
  role: string;
  department: string;
  emoji?: string;
  reportsTo: string | null;
  yesterday: string[];
  today: string[];
  blockers: string[];
  status: 'ready' | 'in_progress' | 'blocked' | 'awaiting_update';
  priority: 'high' | 'medium' | 'low';
};

type StandupsPayload = {
  generatedAt: string;
  schedule: {
    cadence: string;
    nextStandupAt: string;
    format: string;
  };
  ceoKickoff: {
    leader: string;
    title: string;
    priorities: string[];
  };
  stats: {
    totalParticipants: number;
    blocked: number;
    inProgress: number;
    awaitingUpdate: number;
  };
  entries: StandupEntry[];
};

type StandupChannel = {
  id: string;
  label: string;
  dateLabel: string;
  isToday: boolean;
  isHistorical: boolean;
};

type MessageRow = {
  id: string;
  speaker: string;
  role: string;
  avatar: string;
  tone: 'kickoff' | 'update' | 'followup' | 'system';
  body: string[];
  meta?: string;
};

export default function Standups() {
  const [payload, setPayload] = useState<StandupsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await fetch('/api/standups');
        const data = await response.json();
        if (mounted) {
          setPayload(data);
          const todayChannel = buildChannels(data.generatedAt)[0]?.id ?? '';
          setSelectedChannel((current) => current || todayChannel);
        }
      } catch (error) {
        console.error('Failed to fetch standups:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const channels = useMemo(() => {
    if (!payload) return [];
    const all = buildChannels(payload.generatedAt);
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return all;
    return all.filter((channel) =>
      `${channel.label} ${channel.dateLabel}`.toLowerCase().includes(normalizedQuery)
    );
  }, [payload, query]);

  const activeChannel = useMemo(() => {
    return channels.find((channel) => channel.id === selectedChannel) ?? channels[0] ?? null;
  }, [channels, selectedChannel]);

  const transcript = useMemo(() => {
    if (!payload || !activeChannel) return [];
    return buildTranscript(payload, activeChannel);
  }, [payload, activeChannel]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Standups
        </p>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-white">Standups</h1>
        <p className="text-sm text-zinc-500 mt-1">
          A daily standup channel where Rick calls the company in, everyone reports, blockers surface, and next actions get assigned in one thread.
        </p>
      </div>

      {loading && !payload ? (
        <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6 text-sm text-zinc-400">
          Loading standup channels…
        </div>
      ) : null}

      {payload ? (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            <MetricCard icon={<Users className="w-5 h-5 text-blue-300" />} label="Participants" value={payload.stats.totalParticipants} />
            <MetricCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-300" />} label="In Motion" value={payload.stats.inProgress} />
            <MetricCard icon={<AlertTriangle className="w-5 h-5 text-red-300" />} label="Blocked" value={payload.stats.blocked} />
            <MetricCard icon={<Clock3 className="w-5 h-5 text-amber-300" />} label="Awaiting Update" value={payload.stats.awaitingUpdate} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-4 md:gap-6">
            <aside className="rounded-2xl border border-[#27272a] bg-[#18181b] overflow-hidden">
              <div className="px-4 py-4 border-b border-[#27272a]">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Hash className="w-4 h-4 text-zinc-400" />
                  Standup Channels
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Search previous daily standups by date, like Slack channels.
                </p>
              </div>

              <div className="px-4 py-3 border-b border-[#27272a]">
                <div className="flex items-center gap-2 px-3 h-10 rounded-lg border border-[#27272a] bg-[#101014]">
                  <Search className="w-4 h-4 text-zinc-500" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search standup channels…"
                    className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-2 space-y-1 max-h-[720px] overflow-y-auto">
                {channels.map((channel) => {
                  const active = activeChannel?.id === channel.id;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={`w-full text-left rounded-xl px-3 py-3 transition-colors ${
                        active ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-white">
                        <Hash className={`w-4 h-4 ${active ? 'text-blue-300' : 'text-zinc-500'}`} />
                        <span>{channel.label}</span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-1 ml-6">
                        {channel.dateLabel}
                        {channel.isToday ? ' · Live' : ''}
                        {channel.isHistorical ? ' · Archive view' : ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="rounded-2xl border border-[#27272a] bg-[#18181b] overflow-hidden">
              {activeChannel ? (
                <>
                  <div className="px-5 py-4 border-b border-[#27272a] bg-[#15151a]">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-white font-semibold">
                          <Hash className="w-4 h-4 text-zinc-400" />
                          {activeChannel.label}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          {activeChannel.dateLabel} · {payload.schedule.cadence}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1.5">
                          <CalendarClock className="w-3.5 h-3.5" />
                          Next standup {formatTimestamp(payload.schedule.nextStandupAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 border-b border-[#27272a] bg-[#101014]">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-lg">
                        🧪
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Rick Sanchez</div>
                        <div className="text-xs text-zinc-500">CEO kickoff</div>
                        <div className="mt-2 space-y-2 text-sm text-zinc-300">
                          <p>
                            <span className="font-semibold text-white">@channel</span> standup 7am. Let&apos;s go. Report yesterday, today, blockers, and asks. I’ll respond with priorities and assignments.
                          </p>
                          {(payload.ceoKickoff.priorities.length > 0 ? payload.ceoKickoff.priorities : ['No CEO priorities are written yet. Add them to CEO_DAILY_PRIORITIES.md.']).map((item) => (
                            <p key={item}>• {item}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[720px] overflow-y-auto px-5 py-5 space-y-6 bg-[#0f0f12]">
                    {transcript.map((message) => (
                      <SlackMessage key={message.id} message={message} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-6 text-sm text-zinc-400">No standup channel found.</div>
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
          <p className="text-xl font-semibold text-white mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SlackMessage({ message }: { message: MessageRow }) {
  return (
    <article className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-[#27272a] flex items-center justify-center text-lg flex-shrink-0">
        {message.avatar}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white">{message.speaker}</span>
          <span className="text-xs text-zinc-500">{message.role}</span>
          {message.meta ? <span className="text-[11px] text-zinc-600">• {message.meta}</span> : null}
        </div>
        <div className="mt-1.5 space-y-2">
          {message.body.map((line) => (
            <p
              key={`${message.id}-${line}`}
              className={`text-sm leading-relaxed ${
                message.tone === 'followup'
                  ? 'text-blue-200'
                  : message.tone === 'kickoff'
                    ? 'text-zinc-200'
                    : 'text-zinc-300'
              }`}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}

function buildChannels(generatedAt: string): StandupChannel[] {
  const base = new Date(generatedAt);
  const channels: StandupChannel[] = [];
  let cursor = new Date(base);

  while (channels.length < 7) {
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) {
      const key = cursor.toISOString().slice(0, 10);
      channels.push({
        id: key,
        label: `standup-${formatChannelKey(cursor)}`,
        dateLabel: formatDateLabel(cursor),
        isToday: channels.length === 0,
        isHistorical: channels.length > 0,
      });
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return channels;
}

function buildTranscript(payload: StandupsPayload, channel: StandupChannel): MessageRow[] {
  if (channel.isHistorical) {
    return [
      {
        id: `${channel.id}-history`,
        speaker: 'Mission Control',
        role: 'Standup Archive',
        avatar: '🗂️',
        tone: 'system',
        body: [
          `This channel represents the ${channel.dateLabel} standup.`,
          'Historical message capture is the next step. Today, the standup system is live for the current day and uses real roster/work data for the active channel.',
        ],
      },
    ];
  }

  const rows: MessageRow[] = [];

  rows.push({
    id: 'kickoff',
    speaker: payload.ceoKickoff.leader,
    role: 'CEO',
    avatar: '🧪',
    tone: 'kickoff',
    body: [
      '@channel standup 7am. Let’s fucking go.',
      ...(payload.ceoKickoff.priorities.length > 0
        ? payload.ceoKickoff.priorities.map((item) => `Priority: ${item}`)
        : ['Priority: Set today’s CEO priorities in CEO_DAILY_PRIORITIES.md.']),
    ],
    meta: payload.schedule.format,
  });

  for (const entry of payload.entries) {
    rows.push({
      id: `update-${entry.agentId}`,
      speaker: entry.name,
      role: entry.role,
      avatar: entry.emoji ?? '•',
      tone: 'update',
      body: [
        `Yesterday: ${entry.yesterday.join(' | ')}`,
        `Today: ${entry.today.join(' | ')}`,
        `Blockers: ${entry.blockers.join(' | ')}`,
      ],
      meta: `${entry.department} · ${entry.status.replace('_', ' ')}`,
    });

    const followup = buildRickFollowup(entry);
    rows.push({
      id: `followup-${entry.agentId}`,
      speaker: 'Rick Sanchez',
      role: 'CEO reply',
      avatar: '🧪',
      tone: 'followup',
      body: [followup],
      meta: entry.priority === 'high' ? 'High-priority response' : 'Executive acknowledgement',
    });
  }

  return rows;
}

function buildRickFollowup(entry: StandupEntry) {
  if (entry.status === 'blocked') {
    return `${entry.name}, blocker acknowledged. Escalate through ${entry.reportsTo ?? 'Rick'} immediately, narrow scope, and return with an unblock plan plus next checkpoint.`;
  }

  if (entry.status === 'in_progress') {
    return `${entry.name}, keep moving. Lock the next checkpoint, update your owner file, and post back only if scope changes or you hit a blocker.`;
  }

  if (entry.status === 'awaiting_update') {
    return `${entry.name}, you are light on motion. Pull the next ready task from your department queue or ask your manager for assignment before the standup closes.`;
  }

  return `${entry.name}, acknowledged. Stay in lane, keep the queue warm, and surface blockers early.`;
}

function formatChannelKey(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
  })
    .format(date)
    .replace(',', '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatTimestamp(value: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}
