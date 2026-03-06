'use client';

const agents = [
  { id: 'main', name: 'Rick Sanchez', color: '#3b82f6', initial: 'R', tasks: 42, messages: 1284, uptime: '99.8%', avgResponse: '1.2s' },
  { id: 'popeye', name: 'Cleopatra', color: '#22c55e', initial: 'C', tasks: 28, messages: 456, uptime: '99.5%', avgResponse: '1.8s' },
  { id: 'nico', name: 'El Father', color: '#f59e0b', initial: 'E', tasks: 19, messages: 312, uptime: '98.9%', avgResponse: '2.1s' },
  { id: 'together', name: 'Dr. Ashley', color: '#a855f7', initial: 'A', tasks: 12, messages: 87, uptime: '99.1%', avgResponse: '2.4s' },
  { id: 'tesla', name: 'Tesla', color: '#06b6d4', initial: 'T', tasks: 35, messages: 678, uptime: '99.7%', avgResponse: '1.5s' },
];

const totalMessages = agents.reduce((s, a) => s + a.messages, 0);
const totalTasks = agents.reduce((s, a) => s + a.tasks, 0);

export default function Analytics() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Analytics
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-1">Fleet performance metrics and insights</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
          <p className="text-xs text-zinc-500 font-medium mb-2">Total Messages</p>
          <p className="text-3xl font-bold text-white tracking-tight">{totalMessages.toLocaleString()}</p>
          <p className="text-xs text-emerald-500 mt-1">↑ 12% from last week</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
          <p className="text-xs text-zinc-500 font-medium mb-2">Tasks Completed</p>
          <p className="text-3xl font-bold text-white tracking-tight">{totalTasks}</p>
          <p className="text-xs text-emerald-500 mt-1">↑ 8% from last week</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
          <p className="text-xs text-zinc-500 font-medium mb-2">Avg Response Time</p>
          <p className="text-3xl font-bold text-white tracking-tight">1.6s</p>
          <p className="text-xs text-zinc-600 mt-1">Across all agents</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
          <p className="text-xs text-zinc-500 font-medium mb-2">Fleet Uptime</p>
          <p className="text-3xl font-bold text-white tracking-tight">99.4%</p>
          <p className="text-xs text-emerald-500 mt-1">Last 30 days</p>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Agent Performance</h2>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Agent</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Messages</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Tasks</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Uptime</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Avg Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/50">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-[#1f1f23] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: agent.color }}
                      >
                        <span className="text-white text-xs font-semibold">{agent.initial}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300 text-right font-mono">{agent.messages.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300 text-right font-mono">{agent.tasks}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-emerald-400 font-mono">{agent.uptime}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300 text-right font-mono">{agent.avgResponse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Chart Placeholder */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Activity (Last 7 Days)</h2>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
          <div className="flex items-end justify-between gap-2 h-40">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const heights = [65, 80, 72, 90, 85, 40, 30];
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center gap-1">
                    <div
                      className="w-full max-w-[40px] bg-blue-500/20 rounded-md hover:bg-blue-500/30 transition-colors"
                      style={{ height: `${heights[i]}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
