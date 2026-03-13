'use client';

import { useEffect, useMemo, useState } from 'react';
import { Network } from 'lucide-react';
import OrgChartModal from '../OrgChartModal';
import FleetActionButtons from '../FleetActionButtons';

interface FleetOverviewProps {
  onAgentClick?: (name: string, emoji: string) => void;
}

interface LiveAgent {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'idle' | 'offline';
  currentTask: string | null;
  lastActivity: string | number;
  color?: string;
  initial?: string;
  emoji?: string;
}

export default function FleetOverview({ onAgentClick }: FleetOverviewProps) {
  const [agents, setAgents] = useState<LiveAgent[]>([]);
  const [isOrgChartOpen, setIsOrgChartOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await fetch('/api/agents/status');
        const data = await response.json();
        if (mounted) {
          setAgents(Array.isArray(data?.agents) ? data.agents : []);
        }
      } catch (error) {
        console.error('Failed to load fleet overview:', error);
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const grouped = useMemo(() => {
    return agents.reduce<Record<string, LiveAgent[]>>((acc, agent) => {
      acc[agent.department] ??= [];
      acc[agent.department].push(agent);
      return acc;
    }, {});
  }, [agents]);

  const departments = Object.keys(grouped);
  const onlineCount = agents.filter((agent) => agent.status === 'active').length;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
            Mission Control › Fleet Overview
          </p>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-white">Fleet Overview</h1>
          <p className="text-sm text-zinc-500 mt-1">{agents.length} agents across {departments.length} departments</p>
        </div>
        <button
          onClick={() => setIsOrgChartOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 md:py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-white hover:border-[#3f3f46] hover:bg-[#1f1f23] active:scale-95 transition-all cursor-pointer w-full md:w-auto justify-center md:justify-start"
        >
          <Network size={16} />
          View Org Chart
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Agents', value: agents.length.toString(), desc: 'Current live roster' },
          { label: 'Active Now', value: onlineCount.toString(), desc: 'Recently active sessions' },
          { label: 'Departments', value: departments.length.toString(), desc: departments.join(' · ') || 'No departments loaded' },
          { label: 'Idle Agents', value: (agents.length - onlineCount).toString(), desc: 'Available to pick up work' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 md:p-5">
            <p className="text-xs text-zinc-500 font-medium mb-2">{stat.label}</p>
            <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">{stat.value}</p>
            <p className="text-xs text-zinc-600 mt-1 line-clamp-1">{stat.desc}</p>
          </div>
        ))}
      </div>

      <FleetActionButtons />

      {departments.map((department) => (
        <div key={department}>
          <h2 className="text-xs md:text-[13px] font-medium uppercase tracking-widest text-zinc-500/70 mb-3 md:mb-4">
            {department}
          </h2>
          <div className="space-y-2">
            {grouped[department].map((agent) => (
              <button
                key={agent.id}
                type="button"
                className="w-full text-left bg-[#18181b] border border-[#27272a] rounded-xl p-4 md:p-5 hover:border-[#3f3f46] hover:bg-[#1f1f23] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                onClick={() => onAgentClick?.(agent.name, agent.emoji || agent.initial || agent.name.slice(0, 1))}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
                      style={{ backgroundColor: agent.color || '#3f3f46' }}
                    >
                      {agent.initial || agent.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate">{agent.name}</span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          agent.status === 'active' ? 'text-emerald-400' : 'text-zinc-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            agent.status === 'active' ? 'bg-emerald-400' : 'bg-zinc-500'
                          }`} />
                          {agent.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{agent.role}</p>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-400 md:text-right md:w-72">
                    <p className="truncate">{agent.currentTask || 'No active task recorded'}</p>
                    <p className="text-zinc-600 mt-1">Last active {formatLastActive(agent.lastActivity)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      <OrgChartModal isOpen={isOrgChartOpen} onClose={() => setIsOrgChartOpen(false)} />
    </div>
  );
}

function formatLastActive(value: string | number) {
  const timestamp = typeof value === 'number' ? value : Date.parse(value);
  if (!Number.isFinite(timestamp)) return 'unknown';
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}
