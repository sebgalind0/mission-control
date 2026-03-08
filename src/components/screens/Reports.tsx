'use client';

const agents = [
  { id: 'main', name: 'Rick Sanchez', color: '#3b82f6', initial: 'R' },
  { id: 'popeye', name: 'Cleopatra', color: '#22c55e', initial: 'C' },
  { id: 'nico', name: 'El Father', color: '#f59e0b', initial: 'E' },
  { id: 'together', name: 'Dr. Ashley', color: '#a855f7', initial: 'A' },
  { id: 'tesla', name: 'Tesla', color: '#06b6d4', initial: 'T' },
];

const weeklyMetrics = [
  { label: 'Messages Processed', value: '2,817', change: '+12%', positive: true },
  { label: 'Tasks Completed', value: '136', change: '+8%', positive: true },
  { label: 'Avg Response Time', value: '1.6s', change: '-0.3s', positive: true },
  { label: 'Error Rate', value: '0.4%', change: '+0.1%', positive: false },
];

const agentBreakdown = [
  { agent: 'main', messages: 1284, tasks: 42, errors: 2, satisfaction: 98 },
  { agent: 'tesla', messages: 678, tasks: 35, errors: 1, satisfaction: 97 },
  { agent: 'popeye', messages: 456, tasks: 28, errors: 3, satisfaction: 95 },
  { agent: 'nico', messages: 312, tasks: 19, errors: 0, satisfaction: 99 },
  { agent: 'together', messages: 87, tasks: 12, errors: 0, satisfaction: 100 },
];

const recentReports = [
  { id: 1, title: 'Weekly Fleet Report', date: 'Mar 3, 2026', type: 'weekly', status: 'delivered' },
  { id: 2, title: 'Health & Recovery Summary', date: 'Mar 3, 2026', type: 'health', status: 'delivered' },
  { id: 3, title: 'Robotics Curriculum Progress', date: 'Mar 2, 2026', type: 'education', status: 'delivered' },
  { id: 4, title: 'LinkedIn Analytics Digest', date: 'Mar 1, 2026', type: 'marketing', status: 'delivered' },
  { id: 5, title: 'Monthly Operations Review', date: 'Mar 1, 2026', type: 'monthly', status: 'delivered' },
];

const typeColors: Record<string, { bg: string; text: string }> = {
  weekly: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  health: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  education: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  marketing: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  monthly: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
};

export default function Reports() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Reports
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Reports</h1>
        <p className="text-sm text-zinc-500 mt-1">Weekly metrics and agent performance breakdown</p>
      </div>

      {/* Weekly Metrics */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">This Week — Mar 1–7, 2026</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {weeklyMetrics.map((metric) => (
            <div key={metric.label} className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
              <p className="text-xs text-zinc-500 font-medium mb-2">{metric.label}</p>
              <p className="text-3xl font-bold text-white tracking-tight">{metric.value}</p>
              <p className={`text-xs mt-1 ${metric.positive ? 'text-emerald-500' : 'text-red-400'}`}>
                {metric.change} vs last week
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Breakdown */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Agent Performance Breakdown</h2>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Agent</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Messages</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Tasks</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Errors</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Satisfaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/50">
              {agentBreakdown.map((row) => {
                const agent = agents.find(a => a.id === row.agent);
                return (
                  <tr key={row.agent} className="hover:bg-[#1f1f23] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: agent?.color || '#6b7280' }}
                        >
                          <span className="text-white text-xs font-semibold">{agent?.initial}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{agent?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300 text-right font-mono">{row.messages.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-zinc-300 text-right font-mono">{row.tasks}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-mono ${row.errors > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{row.errors}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-emerald-400 font-mono">{row.satisfaction}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Reports */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Recent Reports</h2>
        <div className="space-y-2">
          {recentReports.map((report) => {
            const typeStyle = typeColors[report.type] || typeColors.weekly;
            return (
              <div
                key={report.id}
                className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 hover:border-[#3f3f46] hover:bg-[#1f1f23] transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-medium text-white">{report.title}</h3>
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                    {report.type}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-500">{report.date}</span>
                  <span className="text-[11px] text-emerald-400">✓ {report.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
