'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface CommandCenterProps {
  onAgentClick?: (name: string, emoji: string) => void;
}

const agents = [
  { id: 'main', name: 'Rick Sanchez', color: '#3b82f6', initial: 'R' },
  { id: 'popeye', name: 'Cleopatra', color: '#22c55e', initial: 'C' },
  { id: 'nico', name: 'El Father', color: '#f59e0b', initial: 'E' },
  { id: 'together', name: 'Dr. Ashley', color: '#a855f7', initial: 'A' },
  { id: 'tesla', name: 'Tesla', color: '#06b6d4', initial: 'T' },
];

const initialMessages = [
  { id: 1, sender: 'user', text: 'Check my email inbox for anything urgent', timestamp: '8:15 AM' },
  { id: 2, sender: 'Rick Sanchez', agentId: 'main', text: 'Found 3 unread emails. One from Yitzhak (Fethr) about dev environment setup — marked as important. Two newsletters archived.', timestamp: '8:15 AM' },
  { id: 3, sender: 'user', text: 'What\'s the team status today?', timestamp: '9:30 AM' },
  { id: 4, sender: 'Rick Sanchez', agentId: 'main', text: 'All 5 agents online. 19 cron jobs active. Cleopatra ran morning health check. Tesla completed 2 tutoring sessions. El Father submitted a research summary. Dr. Ashley is idle — no sessions scheduled today.', timestamp: '9:30 AM' },
  { id: 5, sender: 'user', text: 'Have Cleopatra pull my WHOOP data', timestamp: '10:00 AM' },
  { id: 6, sender: 'Cleopatra', agentId: 'popeye', text: 'WHOOP data pulled. Recovery: 82% (green). HRV: 68ms. Sleep performance: 91%. Strain yesterday: 14.2. You\'re cleared for a hard workout today.', timestamp: '10:01 AM' },
  { id: 7, sender: 'user', text: 'Tesla, how\'s Nico doing with the robotics project?', timestamp: '11:15 AM' },
  { id: 8, sender: 'Tesla', agentId: 'tesla', text: 'Nico completed the servo calibration module yesterday. Currently working on inverse kinematics basics. He\'s 68% through the curriculum. Ahead of schedule by 2 days.', timestamp: '11:15 AM' },
];

export default function CommandCenter({ onAgentClick }: CommandCenterProps) {
  const [messages] = useState(initialMessages);
  const [input, setInput] = useState('');

  const getAgent = (agentId: string) => agents.find(a => a.id === agentId);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Command Center
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Command Center</h1>
        <p className="text-sm text-zinc-500 mt-1">Communicate with your agent fleet</p>
      </div>

      {/* Chat Interface */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            if (msg.sender === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[70%]">
                    <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl px-4 py-3">
                      <p className="text-sm text-zinc-200">{msg.text}</p>
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-1 text-right">{msg.timestamp}</p>
                  </div>
                </div>
              );
            }

            const agent = getAgent(msg.agentId || 'main');
            return (
              <div key={msg.id} className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  style={{ backgroundColor: agent?.color || '#6b7280' }}
                  onClick={() => onAgentClick?.(msg.sender, agent?.initial || '?')}
                >
                  <span className="text-white text-xs font-semibold">{agent?.initial || '?'}</span>
                </div>
                <div className="max-w-[70%]">
                  <p className="text-[11px] text-zinc-500 mb-1 font-medium">{msg.sender}</p>
                  <div className="bg-[#111113] border border-[#27272a] rounded-xl px-4 py-3">
                    <p className="text-sm text-zinc-300">{msg.text}</p>
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="border-t border-[#27272a] p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a command to your fleet..."
              className="flex-1 bg-[#111113] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <button className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2 text-sm font-medium">
              <Send size={14} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
