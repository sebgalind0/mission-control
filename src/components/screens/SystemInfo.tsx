'use client';

const systemCards = [
  { label: 'Hostname', value: "Seb's Mac Ultra", subtitle: 'Primary workstation' },
  { label: 'OS', value: 'macOS 15.3', subtitle: 'Darwin 25.3.0 (arm64)' },
  { label: 'Node.js', value: 'v22.22.0', subtitle: 'Runtime environment' },
  { label: 'OpenClaw', value: 'v2.4.1', subtitle: 'Agent orchestration' },
];

const resources = [
  { label: 'CPU', usage: 23, total: '24 cores (M2 Ultra)', color: '#3b82f6' },
  { label: 'Memory', usage: 58, total: '64 GB (37.1 GB used)', color: '#22c55e' },
  { label: 'Disk', usage: 42, total: '2 TB (840 GB used)', color: '#f59e0b' },
];

const envVars = [
  { key: 'SHELL', value: '/bin/zsh' },
  { key: 'LANG', value: 'en_US.UTF-8' },
  { key: 'TERM', value: 'xterm-256color' },
  { key: 'HOME', value: '/Users/sebastiangalindo' },
  { key: 'NODE_ENV', value: 'production' },
  { key: 'OPENCLAW_MODEL', value: 'anthropic/claude-opus-4-6' },
  { key: 'OPENCLAW_CHANNEL', value: 'webchat' },
  { key: 'TZ', value: 'America/New_York' },
];

// Dynamic port based on environment
const isDev = process.env.NODE_ENV === 'development';
const missionControlPort = isDev ? '3000' : '3333';

const services = [
  { name: 'OpenClaw Gateway', status: 'running', port: '3210', pid: '48291' },
  { name: 'Mission Control', status: 'running', port: missionControlPort, pid: '52104' },
  { name: 'Heartbeat Worker', status: 'running', port: '—', pid: '48295' },
  { name: 'Cron Scheduler', status: 'running', port: '—', pid: '48299' },
];

export default function SystemInfo() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › System
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">System Information</h1>
        <p className="text-sm text-zinc-500 mt-1">Host machine details and resource usage</p>
      </div>

      {/* System Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {systemCards.map((card) => (
          <div key={card.label} className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
            <p className="text-xs text-zinc-500 font-medium mb-2">{card.label}</p>
            <p className="text-lg font-semibold text-white tracking-tight">{card.value}</p>
            <p className="text-xs text-zinc-600 mt-1">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Resources */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Resources</h2>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 space-y-6">
          {resources.map((res) => (
            <div key={res.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-300 font-medium">{res.label}</span>
                <span className="text-xs text-zinc-500">{res.total}</span>
              </div>
              <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${res.usage}%`, backgroundColor: res.color }}
                />
              </div>
              <p className="text-[11px] text-zinc-600 mt-1">{res.usage}% used</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Services</h2>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Service</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Status</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Port</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">PID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/50">
              {services.map((svc) => (
                <tr key={svc.name} className="hover:bg-[#1f1f23] transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-300 font-medium">{svc.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className="text-emerald-400">{svc.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500 text-right font-mono">{svc.port}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500 text-right font-mono">{svc.pid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Environment Variables */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Environment</h2>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Variable</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/50">
              {envVars.map((env) => (
                <tr key={env.key} className="hover:bg-[#1f1f23] transition-colors">
                  <td className="px-6 py-3.5 text-sm text-blue-400 font-mono">{env.key}</td>
                  <td className="px-6 py-3.5 text-sm text-zinc-400 font-mono">{env.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
