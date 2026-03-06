'use client';

import { Mail, MessageCircle, Mic, Activity, Github, Slack, Globe, Cloud } from 'lucide-react';

const integrations = [
  {
    id: 1,
    name: 'Microsoft Outlook',
    description: 'Email access via Microsoft Graph API. Read, search, and draft emails.',
    icon: Mail,
    status: 'connected',
    color: '#3b82f6',
    lastSync: '5 min ago',
  },
  {
    id: 2,
    name: 'Telegram',
    description: 'Direct messaging channel for notifications, approvals, and voice notes.',
    icon: MessageCircle,
    status: 'connected',
    color: '#22c55e',
    lastSync: '2 min ago',
  },
  {
    id: 3,
    name: 'WhatsApp',
    description: 'Team communication for voice notes and check-ins with team members.',
    icon: MessageCircle,
    status: 'connected',
    color: '#22c55e',
    lastSync: '10 min ago',
  },
  {
    id: 4,
    name: 'ElevenLabs',
    description: 'Text-to-speech voice generation with custom Kuya voice profile.',
    icon: Mic,
    status: 'connected',
    color: '#a855f7',
    lastSync: '1h ago',
  },
  {
    id: 5,
    name: 'WHOOP',
    description: 'Health and fitness tracking — sleep, recovery, HRV, and strain data.',
    icon: Activity,
    status: 'connected',
    color: '#22c55e',
    lastSync: '30 min ago',
  },
  {
    id: 6,
    name: 'Slack',
    description: 'Workspace communication with #alerts, #updates, and #general channels.',
    icon: Slack,
    status: 'connected',
    color: '#22c55e',
    lastSync: '1 min ago',
  },
  {
    id: 7,
    name: 'GitHub',
    description: 'Repository access for code review, deployments, and CI/CD triggers.',
    icon: Github,
    status: 'disconnected',
    color: '#6b7280',
    lastSync: 'Never',
  },
  {
    id: 8,
    name: 'LinkedIn',
    description: 'Content publishing and analytics tracking for profile growth.',
    icon: Globe,
    status: 'limited',
    color: '#f59e0b',
    lastSync: '2h ago',
  },
  {
    id: 9,
    name: 'AWS',
    description: 'Cloud infrastructure monitoring and deployment management.',
    icon: Cloud,
    status: 'connected',
    color: '#22c55e',
    lastSync: '15 min ago',
  },
];

const statusConfig: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  connected: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Connected', dot: 'bg-emerald-500' },
  disconnected: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', label: 'Disconnected', dot: 'bg-zinc-500' },
  limited: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Limited', dot: 'bg-amber-500' },
};

export default function Integrations() {
  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Integrations
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Integrations</h1>
        <p className="text-sm text-zinc-500 mt-1">{connectedCount} of {integrations.length} connected</p>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const status = statusConfig[integration.status];
          return (
            <div
              key={integration.id}
              className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 hover:border-[#3f3f46] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#27272a] flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{integration.name}</h3>
                    <span className="inline-flex items-center gap-1.5 text-xs mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                      <span className={status.text}>{status.label}</span>
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{integration.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-600">Last sync: {integration.lastSync}</span>
                <button className={`text-[11px] px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  integration.status === 'connected'
                    ? 'border border-[#27272a] text-zinc-400 hover:text-red-400 hover:border-red-500/30'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}>
                  {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
