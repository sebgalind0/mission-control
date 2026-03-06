'use client';

const agents = [
  { id: 'main', name: 'Rick Sanchez', color: '#3b82f6', initial: 'R' },
  { id: 'popeye', name: 'Cleopatra', color: '#22c55e', initial: 'C' },
  { id: 'nico', name: 'El Father', color: '#f59e0b', initial: 'E' },
  { id: 'together', name: 'Dr. Ashley', color: '#a855f7', initial: 'A' },
  { id: 'tesla', name: 'Tesla', color: '#06b6d4', initial: 'T' },
];

const activities = [
  { id: 1, agent: 'main', action: 'Completed email inbox check — 3 new, 1 urgent', type: 'task', time: '5 min ago' },
  { id: 2, agent: 'popeye', action: 'Synced WHOOP data — Recovery: 82%, HRV: 68ms', type: 'sync', time: '12 min ago' },
  { id: 3, agent: 'tesla', action: 'Nico completed inverse kinematics exercise 4/7', type: 'education', time: '25 min ago' },
  { id: 4, agent: 'main', action: 'Sent morning voice check-ins to Rodrigo, Jorge, Fabricio, Carlos, Nelson', type: 'message', time: '1h ago' },
  { id: 5, agent: 'main', action: 'LinkedIn post drafted — "Your AI agent is not an agent"', type: 'content', time: '1.5h ago' },
  { id: 6, agent: 'nico', action: 'Research digest compiled — 3 papers on multi-agent systems', type: 'research', time: '2h ago' },
  { id: 7, agent: 'main', action: 'Calendar sync completed — 4 events this week', type: 'sync', time: '2h ago' },
  { id: 8, agent: 'tesla', action: 'Hardware diagnostics passed — all servos operational', type: 'system', time: '3h ago' },
  { id: 9, agent: 'popeye', action: 'Weekly health report generated and filed', type: 'report', time: '3h ago' },
  { id: 10, agent: 'main', action: 'Email draft for Yitzhak sent to approval queue', type: 'approval', time: '4h ago' },
  { id: 11, agent: 'together', action: 'Session reminder scheduled for Saturday 3pm', type: 'task', time: '5h ago' },
  { id: 12, agent: 'main', action: 'Memory backup completed — MEMORY.md updated', type: 'system', time: '6h ago' },
  { id: 13, agent: 'tesla', action: 'Servo calibration module marked as complete', type: 'task', time: '8h ago' },
  { id: 14, agent: 'popeye', action: 'Sleep analysis: 91% performance, 7h 22m total', type: 'health', time: '10h ago' },
  { id: 15, agent: 'main', action: 'Weather update: 62°F, partly cloudy, no rain expected', type: 'info', time: '12h ago' },
];

const typeConfig: Record<string, { bg: string; text: string }> = {
  task: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  sync: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  education: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  message: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  content: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  research: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
  system: { bg: 'bg-zinc-500/10', text: 'text-zinc-400' },
  report: { bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
  approval: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  health: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  info: { bg: 'bg-zinc-500/10', text: 'text-zinc-400' },
};

export default function ActivityFeed() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Activity Feed
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Activity Feed</h1>
        <p className="text-sm text-zinc-500 mt-1">Real-time timeline of fleet actions</p>
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        {activities.map((activity) => {
          const agent = agents.find(a => a.id === activity.agent);
          const typeStyle = typeConfig[activity.type] || typeConfig.info;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 py-4 px-5 rounded-xl hover:bg-[#18181b] transition-colors group"
            >
              {/* Timeline line + avatar */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: agent?.color || '#6b7280' }}
                >
                  <span className="text-white text-xs font-semibold">{agent?.initial}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      <span className="font-medium text-white">{agent?.name}</span>{' '}
                      {activity.action}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                      {activity.type}
                    </span>
                    <span className="text-[11px] text-zinc-600 whitespace-nowrap">{activity.time}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
