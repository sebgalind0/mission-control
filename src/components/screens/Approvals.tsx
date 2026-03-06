'use client';

const agents = [
  { id: 'main', name: 'Rick Sanchez', color: '#3b82f6', initial: 'R' },
  { id: 'popeye', name: 'Cleopatra', color: '#22c55e', initial: 'C' },
  { id: 'tesla', name: 'Tesla', color: '#06b6d4', initial: 'T' },
];

const approvals = [
  {
    id: 1,
    title: 'Send follow-up email to Yitzhak (Fethr)',
    description: 'Re: Dev environment setup. Draft reviewed and ready to send via Outlook.',
    requester: 'main',
    type: 'email',
    urgency: 'high',
    created: '15 min ago',
  },
  {
    id: 2,
    title: 'Post LinkedIn update on AI agents',
    description: 'Scheduled post about multi-agent orchestration patterns. Hook: "Your AI agent is not an agent."',
    requester: 'main',
    type: 'social',
    urgency: 'medium',
    created: '1h ago',
  },
  {
    id: 3,
    title: 'Send escalation message to Jorge',
    description: 'Jorge has been MIA for 4 days. Proposed escalation via WhatsApp with firm but supportive tone.',
    requester: 'main',
    type: 'message',
    urgency: 'high',
    created: '2h ago',
  },
  {
    id: 4,
    title: 'Purchase WHOOP battery replacement',
    description: 'WHOOP 4.0 battery at 62% health. Replacement available on Amazon for $49.',
    requester: 'popeye',
    type: 'purchase',
    urgency: 'low',
    created: '4h ago',
  },
  {
    id: 5,
    title: 'Deploy servo calibration firmware',
    description: 'Updated firmware for robotic arm servo. Tested in simulation. Ready for hardware flash.',
    requester: 'tesla',
    type: 'deploy',
    urgency: 'medium',
    created: '6h ago',
  },
];

const typeColors: Record<string, { bg: string; text: string }> = {
  email: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  social: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  message: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  purchase: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  deploy: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
};

const urgencyDots: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-zinc-500',
};

export default function Approvals() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Approvals
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Approvals</h1>
        <p className="text-sm text-zinc-500 mt-1">{approvals.length} items awaiting your review</p>
      </div>

      {/* Approval Cards */}
      <div className="space-y-4">
        {approvals.map((item) => {
          const agent = agents.find(a => a.id === item.requester);
          const typeStyle = typeColors[item.type] || typeColors.email;
          return (
            <div
              key={item.id}
              className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 hover:border-[#3f3f46] transition-colors"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  {/* Urgency dot */}
                  <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${urgencyDots[item.urgency]}`}></span>

                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white mb-1.5">{item.title}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-3">{item.description}</p>

                    <div className="flex items-center gap-3">
                      {/* Requester */}
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: agent?.color || '#6b7280' }}
                        >
                          <span className="text-white text-[9px] font-semibold">{agent?.initial}</span>
                        </div>
                        <span className="text-[11px] text-zinc-500">{agent?.name}</span>
                      </div>

                      <span className="text-zinc-700">·</span>

                      {/* Type badge */}
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                        {item.type}
                      </span>

                      <span className="text-zinc-700">·</span>

                      {/* Time */}
                      <span className="text-[11px] text-zinc-600">{item.created}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="px-4 py-2 text-xs font-medium rounded-lg border border-[#27272a] text-zinc-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-colors">
                    Reject
                  </button>
                  <button className="px-4 py-2 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
                    Approve
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
