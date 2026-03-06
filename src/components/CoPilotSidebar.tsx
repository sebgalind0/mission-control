'use client';

import { X, Send } from 'lucide-react';
import { useState } from 'react';

interface CoPilotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: string;
}

export default function CoPilotSidebar({ isOpen, onClose, currentScreen }: CoPilotSidebarProps) {
  const [message, setMessage] = useState('');

  const screenLabels: Record<string, string> = {
    fleet: 'Fleet Overview',
    command: 'Command Center',
    tasks: 'Task Board',
    projects: 'Projects',
    calendar: 'Calendar',
    crons: 'Cron Jobs',
    memory: 'Memory',
    docs: 'Docs',
    team: 'Team',
    analytics: 'Analytics',
    approvals: 'Approvals',
    activity: 'Activity',
    system: 'System',
  };

  const chatMessages = [
    {
      sender: 'copilot',
      text: "I notice Jorge has been MIA for 4 days. Want me to draft an escalation message?",
      timestamp: '10:15 AM',
    },
    {
      sender: 'copilot',
      text: "Your LinkedIn post hit 10K impressions yesterday. The 'Stop saying AI agents...' hook worked well.",
      timestamp: '11:30 AM',
    },
    {
      sender: 'copilot',
      text: "Reminder: Dubai decision day is April 1. I'm tracking hotel prices weekly.",
      timestamp: '2:45 PM',
    },
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <div className="w-80 h-screen bg-[#0f0f12] border-l border-[#27272a] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧪</span>
          <h2 className="text-white font-semibold">Co-Pilot</h2>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Context */}
      <div className="px-4 py-2 bg-[#09090b] border-b border-[#27272a]">
        <p className="text-xs text-zinc-500">
          Viewing: <span className="text-zinc-400">{screenLabels[currentScreen] || 'Unknown'}</span>
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-400">
                {msg.sender === 'copilot' ? '🧪 Co-Pilot' : 'You'}
              </span>
              <span className="text-xs text-zinc-500">{msg.timestamp}</span>
            </div>
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-3">
              <p className="text-sm text-zinc-200">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#27272a]">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 bg-[#18181b] border border-[#27272a] rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#3b82f6]"
          />
          <button className="px-3 py-2 bg-[#3b82f6] text-white rounded-md hover:bg-blue-700 transition-colors">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
