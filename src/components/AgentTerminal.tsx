'use client';

import { useState, useEffect } from 'react';
import { Terminal, Circle, Play } from 'lucide-react';
import SessionReplay from './SessionReplay';

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'offline';
  lastActivity: string;
  currentTask: string | null;
  sessionKey: string | null;
}

export default function AgentTerminal() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchAgentStatus();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchAgentStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  async function fetchAgentStatus() {
    try {
      const res = await fetch('/api/agents/status');
      const data = await res.json();
      setAgents(data.agents || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch agent status:', error);
      setLoading(false);
    }
  }

  function formatLastActivity(timestamp: string): string {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'idle': return 'text-yellow-500';
      case 'offline': return 'text-zinc-600';
      default: return 'text-zinc-500';
    }
  }

  function getStatusBgColor(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-500/10';
      case 'idle': return 'bg-yellow-500/10';
      case 'offline': return 'bg-zinc-600/10';
      default: return 'bg-zinc-500/10';
    }
  }

  return (
    <>
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 md:px-5 py-3 border-b border-[#27272a] flex items-center gap-2">
          <Terminal size={16} className="text-zinc-400" />
          <h2 className="text-sm font-semibold text-white">Agent Terminal</h2>
          <span className="ml-auto text-xs text-zinc-500">
            {agents.length} agent{agents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Agent Status List */}
        <div className="divide-y divide-[#27272a]">
          {loading ? (
            <div className="p-6 text-center text-sm text-zinc-500">
              Loading agent status...
            </div>
          ) : agents.length === 0 ? (
            <div className="p-6 text-center">
              <Terminal size={32} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No agents online</p>
            </div>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                className="p-3 md:p-4 hover:bg-[#1f1f23] transition-colors group"
              >
                <div className="flex items-start gap-3">
                  {/* Status Indicator */}
                  <div className={`w-8 h-8 rounded-full ${getStatusBgColor(agent.status)} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Circle size={12} className={`${getStatusColor(agent.status)} fill-current`} />
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{agent.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBgColor(agent.status)} ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </div>
                    
                    {agent.currentTask && (
                      <p className="text-xs text-zinc-400 mb-1 truncate">
                        {agent.currentTask}
                      </p>
                    )}
                    
                    <p className="text-xs text-zinc-600">
                      Last activity: {formatLastActivity(agent.lastActivity)}
                    </p>
                  </div>
                  
                  {/* Replay button */}
                  {agent.sessionKey && (
                    <button
                      onClick={() => setSelectedSession(agent.sessionKey)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs text-white flex items-center gap-1.5"
                      title="View session replay"
                    >
                      <Play size={12} />
                      <span>Replay</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Session Replay Modal */}
      {selectedSession && (
        <SessionReplay
          sessionId={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  );
}
