'use client';

import { useEffect, useMemo, useState } from 'react';

interface TeamOrgChartProps {
  onAgentClick?: (name: string, emoji: string) => void;
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'offline';
  role?: string;
  department?: string;
  emoji?: string;
  color?: string;
  initial?: string;
}

function AgentCard({
  agent,
  small,
  onClick,
}: {
  agent: AgentStatus;
  small?: boolean;
  onClick?: () => void;
}) {
  const isOnline = agent.status === 'active';
  return (
    <div
      className={`bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition-colors text-center cursor-pointer ${small ? 'p-4 w-36' : 'p-5 w-44'}`}
      onClick={onClick}
    >
      <div
        className={`rounded-full flex items-center justify-center mx-auto ${small ? 'w-9 h-9 mb-2' : 'w-11 h-11 mb-3'}`}
        style={{ backgroundColor: agent.color || '#6b7280' }}
      >
        <span className={`text-white font-bold ${small ? 'text-[10px]' : 'text-xs'}`}>{agent.initial || agent.name.slice(0, 1)}</span>
      </div>
      <h3 className={`font-semibold text-white ${small ? 'text-xs' : 'text-sm'}`}>{agent.name}</h3>
      <p className={`text-zinc-500 mt-0.5 ${small ? 'text-[10px]' : 'text-xs'}`}>{agent.role || 'Agent'}</p>
      <span className={`inline-flex items-center gap-1 mt-2 ${small ? 'text-[10px]' : 'text-xs'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
        <span className={isOnline ? 'text-emerald-400' : 'text-amber-400'}>{agent.status}</span>
      </span>
    </div>
  );
}

export default function TeamOrgChart({ onAgentClick }: TeamOrgChartProps) {
  const [agents, setAgents] = useState<AgentStatus[]>([]);

  useEffect(() => {
    fetch('/api/agents/status')
      .then((res) => res.json())
      .then((data) => setAgents(data.agents || []))
      .catch((error) => console.error('Failed to fetch org chart roster:', error));
  }, []);

  const ceo = agents.find((agent) => agent.id === 'main');
  const departments = useMemo(() => {
    const grouped = new Map<string, AgentStatus[]>();
    for (const agent of agents.filter((entry) => entry.id !== 'main')) {
      const department = agent.department || 'Unassigned';
      const current = grouped.get(department) || [];
      current.push(agent);
      grouped.set(department, current);
    }

    return Array.from(grouped.entries()).map(([name, members]) => {
      const lead = members.find((member) => /C[TOOM]/.test(member.role || '') || member.role?.includes('CMO') || member.role?.includes('COO'));
      return {
        name,
        lead,
        members: members.filter((member) => member.id !== lead?.id),
      };
    });
  }, [agents]);

  const totalAgents = agents.length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Team
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Team Org Chart</h1>
        <p className="text-sm text-zinc-500 mt-1">{totalAgents} active agents · live roster from OpenClaw</p>
      </div>

      {ceo && (
        <div className="flex flex-col items-center">
          <div
            className="bg-[#18181b] border-2 border-blue-500/30 rounded-xl p-6 w-56 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => onAgentClick?.(ceo.name, ceo.initial || 'R')}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: ceo.color || '#3b82f6' }}>
              <span className="text-white text-base font-bold">{ceo.initial || 'R'}</span>
            </div>
            <h3 className="text-sm font-semibold text-white">{ceo.name} {ceo.emoji || ''}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{ceo.role || 'CEO'}</p>
            <span className="inline-flex items-center gap-1.5 text-xs mt-2">
              <span className={`w-1.5 h-1.5 rounded-full ${ceo.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className={ceo.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}>{ceo.status}</span>
            </span>
          </div>
          <div className="w-px h-6 bg-[#27272a]"></div>
        </div>
      )}

      <div className="space-y-8">
        {departments.map((department) => (
          <div key={department.name} className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h2 className="text-base font-semibold text-white">{department.name}</h2>
                <p className="text-xs text-zinc-500">
                  {(department.lead ? 1 : 0) + department.members.length} total
                </p>
              </div>
            </div>
            <div className="flex items-start gap-6 flex-wrap justify-center">
              {department.lead && (
                <>
                  <AgentCard
                    agent={department.lead}
                    onClick={() => onAgentClick?.(department.lead!.name, department.lead!.initial || department.lead!.name.slice(0, 1))}
                  />
                  {department.members.length > 0 && <div className="flex items-center self-center text-zinc-600">→</div>}
                </>
              )}
              {department.members.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  small={!!department.lead}
                  onClick={() => onAgentClick?.(agent.name, agent.initial || agent.name.slice(0, 1))}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Leadership" value={(ceo ? 1 : 0).toString()} />
        <SummaryCard label="Departments" value={departments.length.toString()} />
        <SummaryCard label="Active Now" value={agents.filter((agent) => agent.status === 'active').length.toString()} />
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 text-center">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
