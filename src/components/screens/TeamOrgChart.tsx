'use client';

interface TeamOrgChartProps {
  onAgentClick?: (name: string, emoji: string) => void;
}

const departments = [
  {
    name: 'Engineering',
    emoji: '💊',
    color: '#10b981',
    lead: { name: 'Larry', role: 'CTO', color: '#10b981', initial: 'L', status: 'online' },
    agents: [
      { name: 'Neo', role: 'Frontend', color: '#6366f1', initial: 'N', status: 'online' },
      { name: 'Bolt', role: 'Backend', color: '#eab308', initial: 'B', status: 'online' },
      { name: 'Roger', role: 'Infrastructure', color: '#f97316', initial: 'Ro', status: 'online' },
      { name: 'Kai', role: 'Mobile / iOS', color: '#ec4899', initial: 'K', status: 'online' },
    ],
  },
  {
    name: 'Marketing',
    emoji: '⚔️',
    color: '#ef4444',
    lead: { name: 'Julius Caesar', role: 'CMO', color: '#ef4444', initial: 'JC', status: 'online' },
    agents: [
      { name: 'Elon', role: 'X / Twitter', color: '#f97316', initial: 'E', status: 'online' },
      { name: 'Vegeta', role: 'LinkedIn', color: '#8b5cf6', initial: 'V', status: 'online' },
      { name: 'Thoth', role: 'Content / Blog', color: '#d97706', initial: 'T', status: 'online' },
    ],
  },
  {
    name: 'Operations',
    emoji: '🕶️',
    color: '#3b82f6',
    lead: { name: 'Achilles', role: 'COO', color: '#3b82f6', initial: 'A', status: 'online' },
    agents: [
      { name: 'Olivia', role: 'Exec Assistant', color: '#f472b6', initial: 'O', status: 'online' },
    ],
  },
  {
    name: 'Design',
    emoji: '🎨',
    color: '#f59e0b',
    lead: { name: 'George', role: 'Head of Design', color: '#f59e0b', initial: 'G', status: 'online' },
    agents: [
      { name: 'Steve Jobs', role: 'UI/UX Designer', color: '#a3a3a3', initial: 'SJ', status: 'online' },
    ],
  },
  {
    name: 'Contractors',
    emoji: '📋',
    color: '#6b7280',
    agents: [
      { name: 'Cleopatra', role: 'Health Coach', color: '#22c55e', initial: 'C', status: 'online' },
      { name: 'El Father', role: 'Academic (Nico)', color: '#f59e0b', initial: 'E', status: 'online' },
      { name: 'Dr. Ashley', role: 'Couples Therapy', color: '#a855f7', initial: 'A', status: 'idle' },
      { name: 'Tesla', role: 'Robotics Tutor', color: '#06b6d4', initial: 'T', status: 'online' },
    ],
  },
];

function AgentCard({ agent, small, onClick }: { agent: { name: string; role: string; color: string; initial: string; status: string }; small?: boolean; onClick?: () => void }) {
  const isOnline = agent.status === 'online';
  return (
    <div
      className={`bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition-colors text-center cursor-pointer ${small ? 'p-4 w-36' : 'p-5 w-44'}`}
      onClick={onClick}
    >
      <div
        className={`rounded-full flex items-center justify-center mx-auto ${small ? 'w-9 h-9 mb-2' : 'w-11 h-11 mb-3'}`}
        style={{ backgroundColor: agent.color }}
      >
        <span className={`text-white font-bold ${small ? 'text-[10px]' : 'text-xs'}`}>{agent.initial}</span>
      </div>
      <h3 className={`font-semibold text-white ${small ? 'text-xs' : 'text-sm'}`}>{agent.name}</h3>
      <p className={`text-zinc-500 mt-0.5 ${small ? 'text-[10px]' : 'text-xs'}`}>{agent.role}</p>
      <span className={`inline-flex items-center gap-1 mt-2 ${small ? 'text-[10px]' : 'text-xs'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
        <span className={isOnline ? 'text-emerald-400' : 'text-amber-400'}>{agent.status}</span>
      </span>
    </div>
  );
}

export default function TeamOrgChart({ onAgentClick }: TeamOrgChartProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Team
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Team Org Chart</h1>
        <p className="text-sm text-zinc-500 mt-1">18 agents · 5 departments</p>
      </div>

      {/* Rick - CEO */}
      <div className="flex flex-col items-center">
        <div
          className="bg-[#18181b] border-2 border-blue-500/30 rounded-xl p-6 w-56 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
          onClick={() => onAgentClick?.('Rick Sanchez', 'R')}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#3b82f6' }}>
            <span className="text-white text-base font-bold">R</span>
          </div>
          <h3 className="text-sm font-semibold text-white">Rick Sanchez 🧪</h3>
          <p className="text-xs text-zinc-500 mt-0.5">CEO · Opus 4.6</p>
          <span className="inline-flex items-center gap-1.5 text-xs mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-400">online</span>
          </span>
        </div>
        <div className="w-px h-6 bg-[#27272a]"></div>
      </div>

      {/* Departments */}
      <div className="space-y-8">
        {departments.map((dept) => (
          <div key={dept.name} className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xl">{dept.emoji}</span>
              <div>
                <h2 className="text-base font-semibold text-white">{dept.name}</h2>
                <p className="text-xs text-zinc-500">
                  {dept.lead ? `Led by ${dept.lead.name}` : `${dept.agents.length} agents`}
                  {' · '}{(dept.lead ? 1 : 0) + dept.agents.length} total
                </p>
              </div>
              <div className="ml-auto">
                <span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: `${dept.color}15`, color: dept.color }}>
                  {dept.name}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-6 flex-wrap justify-center">
              {dept.lead && (
                <>
                  <AgentCard agent={dept.lead} onClick={() => onAgentClick?.(dept.lead!.name, dept.lead!.initial)} />
                  <div className="flex items-center self-center text-zinc-600">→</div>
                </>
              )}
              {dept.agents.map((agent) => (
                <AgentCard key={agent.name} agent={agent} small={!!dept.lead} onClick={() => onAgentClick?.(agent.name, agent.initial)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {[
          { label: 'Total', value: '18' },
          { label: 'Engineering', value: '5' },
          { label: 'Marketing', value: '4' },
          { label: 'Operations', value: '2' },
          { label: 'Contractors', value: '4' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 text-center">
            <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
