'use client';

import { X } from 'lucide-react';

interface ChatLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentEmoji: string;
}

export default function ChatLogModal({ isOpen, onClose, agentName, agentEmoji }: ChatLogModalProps) {
  if (!isOpen) return null;

  const messages = agentName === 'Rick' ? [
    { sender: 'User', text: 'Check my email inbox for anything urgent', timestamp: '8:15 AM' },
    { sender: 'Rick', text: 'Found 3 unread emails. One from Yitzhak (Fethr) about dev environment setup - marked as important.', timestamp: '8:15 AM' },
    { sender: 'User', text: 'Draft a follow-up response', timestamp: '8:16 AM' },
    { sender: 'Rick', text: 'Draft created. Sent to approval queue. Want me to send it now?', timestamp: '8:16 AM' },
    { sender: 'User', text: 'What\'s the latest on our LinkedIn analytics?', timestamp: '10:00 AM' },
    { sender: 'Rick', text: 'Yesterday\'s post hit 10K impressions. Engagement rate: 4.2%. The "Stop saying AI agents" hook performed well.', timestamp: '10:00 AM' },
    { sender: 'User', text: 'Remind me about Dubai trip deadlines', timestamp: '2:30 PM' },
    { sender: 'Rick', text: 'Dubai decision day: April 1. I\'m tracking hotel prices weekly. Current best: $180/night at JW Marriott.', timestamp: '2:30 PM' },
    { sender: 'User', text: 'How\'s Jorge doing this week?', timestamp: '3:45 PM' },
    { sender: 'Rick', text: 'Jorge has been MIA for 4 days. Last update: Monday morning. No responses to messages. Want me to escalate?', timestamp: '3:45 PM' },
  ] : [
    { sender: 'User', text: `Hey ${agentName}, what's your status?`, timestamp: '9:00 AM' },
    { sender: agentName, text: 'All systems operational. Standing by for tasks.', timestamp: '9:01 AM' },
    { sender: 'User', text: 'Check the latest reports', timestamp: '2:15 PM' },
    { sender: agentName, text: 'Reports reviewed. Everything looks good. No anomalies detected.', timestamp: '2:16 PM' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-3xl max-h-[80vh] bg-[#18181b] border border-[#27272a] rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{agentEmoji}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{agentName}</h2>
              <p className="text-sm text-zinc-500">Chat History</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-400">
                  {msg.sender === 'User' ? 'You' : `${agentEmoji} ${msg.sender}`}
                </span>
                <span className="text-xs text-zinc-500">{msg.timestamp}</span>
              </div>
              <div className={`${msg.sender === 'User' ? 'bg-[#1f1f23]' : 'bg-[#09090b]'} border border-[#27272a] rounded-lg p-4`}>
                <p className="text-sm text-zinc-200">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#27272a] bg-[#09090b]">
          <button className="text-sm text-blue-500 hover:underline">
            View full history →
          </button>
        </div>
      </div>
    </div>
  );
}
