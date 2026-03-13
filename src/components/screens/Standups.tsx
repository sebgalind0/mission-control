'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, AlertTriangle, Clock3, Users, MessageSquareQuote } from 'lucide-react';

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

const DEPARTMENTS = ['All', 'Leadership', 'Engineering', 'Marketing', 'Operations'];

const statusStyles: Record<StandupEntry['status'], string> = {
  ready: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  in_progress: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  blocked: 'bg-red-500/10 text-red-300 border-red-500/20',
  awaiting_update: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
};

export default function Standups() {
  const [payload, setPayload] = useState<StandupsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('All');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await fetch('/api/standups');
        const data = await response.json();
        if (mounted) {
          setPayload(data);
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

  const entries = useMemo(() => {
    if (!payload) return [];
    if (department === 'All') return payload.entries;
    return payload.entries.filter((entry) => entry.department === department);
  }, [payload, department]);

  const grouped = useMemo(() => {
    return entries.reduce<Record<string, StandupEntry[]>>((acc, entry) => {
      acc[entry.department] ??= [];
      acc[entry.department].push(entry);
      return acc;
    }, {});
  }, [entries]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
            Mission Control › Standups
          </p>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-white">Standups</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Daily executive meeting flow for the live company. Rick kicks off, the team reports, blockers surface, and the next actions are obvious.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-[#27272a] bg-[#18181b] p-1">
          {DEPARTMENTS.map((item) => (
            <button
              key={item}
              onClick={() => setDepartment(item)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                department === item ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading && !payload ? (
        <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6 text-sm text-zinc-400">
          Loading standup state…
        </div>
      ) : null}

      {payload ? (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            <MetricCard
              icon={<Users className="w-5 h-5 text-blue-300" />}
              label="Participants"
              value={payload.stats.totalParticipants}
            />
            <MetricCard
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-300" />}
              label="In Motion"
              value={payload.stats.inProgress}
            />
            <MetricCard
              icon={<AlertTriangle className="w-5 h-5 text-red-300" />}
              label="Blocked"
              value={payload.stats.blocked}
            />
            <MetricCard
              icon={<Clock3 className="w-5 h-5 text-amber-300" />}
              label="Awaiting Update"
              value={payload.stats.awaitingUpdate}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_1.95fr] gap-4 md:gap-6">
            <div className="space-y-4">
              <section className="rounded-2xl border border-[#27272a] bg-[#18181b] p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <CalendarClock className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">Standup Cadence</h2>
                    <p className="text-sm text-zinc-400 mt-1">{payload.schedule.cadence}</p>
                    <p className="text-xs text-zinc-500 mt-2">
                      Next standup: {formatTimestamp(payload.schedule.nextStandupAt)}
                    </p>
                    <p className="text-xs text-zinc-500 mt-2">
                      Format: {payload.schedule.format}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[#27272a] bg-[#18181b] p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquareQuote className="w-5 h-5 text-violet-300" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-zinc-500">CEO Kickoff</p>
                      <h2 className="text-sm font-semibold text-white mt-1">{payload.ceoKickoff.title}</h2>
                      <p className="text-sm text-zinc-400 mt-1">Led by {payload.ceoKickoff.leader}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Current Priorities</p>
                      <ul className="space-y-2">
                        {(payload.ceoKickoff.priorities.length > 0 ? payload.ceoKickoff.priorities : ['No CEO priorities are written yet. Use CEO_DAILY_PRIORITIES.md to set the day.']).map((item) => (
                          <li key={item} className="text-sm text-zinc-300 leading-relaxed">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-[#27272a] bg-[#18181b] p-5">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500">Standup Queue</p>
                  <h2 className="text-sm font-semibold text-white mt-1">Who speaks, what they did, what moves next</h2>
                </div>
                <p className="text-xs text-zinc-500">
                  Refreshed {formatTimestamp(payload.generatedAt)}
                </p>
              </div>

              <div className="space-y-6">
                {Object.entries(grouped).map(([dept, deptEntries]) => (
                  <div key={dept} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <h3 className="text-xs uppercase tracking-widest text-zinc-500">{dept}</h3>
                    </div>
                    <div className="space-y-3">
                      {deptEntries.map((entry, index) => (
                        <StandupCard key={entry.agentId} entry={entry} index={index + 1} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
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

function StandupCard({ entry, index }: { entry: StandupEntry; index: number }) {
  return (
    <article className="rounded-xl border border-[#27272a] bg-[#111114] p-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-lg flex-shrink-0">
            {entry.emoji ?? '•'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-widest text-zinc-500">#{index}</span>
              <h4 className="text-sm font-semibold text-white">{entry.name}</h4>
              <span className={`px-2 py-1 rounded-full border text-[11px] ${statusStyles[entry.status]}`}>
                {entry.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {entry.role} · {entry.department}{entry.reportsTo ? ` · reports to ${entry.reportsTo}` : ''}
            </p>
          </div>
        </div>
        <div className="text-xs text-zinc-500 uppercase tracking-widest">
          priority: {entry.priority}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-4">
        <StandupList title="Yesterday" items={entry.yesterday} tone="text-zinc-300" />
        <StandupList title="Today" items={entry.today} tone="text-blue-200" />
        <StandupList title="Blockers / Asks" items={entry.blockers} tone={entry.blockers[0] === 'No blockers recorded.' ? 'text-zinc-400' : 'text-red-200'} />
      </div>
    </article>
  );
}

function StandupList({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div className="rounded-lg border border-[#202025] bg-[#0d0d10] p-3">
      <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-2">{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={`${title}-${item}`} className={`text-sm leading-relaxed ${tone}`}>
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
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
