'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const agents = [
  { id: 'main', name: 'Rick Sanchez', color: '#3b82f6', initial: 'R', tasks: 42, messages: 1284, uptime: '99.8%', avgResponse: '1.2s' },
  { id: 'popeye', name: 'Cleopatra', color: '#22c55e', initial: 'C', tasks: 28, messages: 456, uptime: '99.5%', avgResponse: '1.8s' },
  { id: 'nico', name: 'El Father', color: '#f59e0b', initial: 'E', tasks: 19, messages: 312, uptime: '98.9%', avgResponse: '2.1s' },
  { id: 'together', name: 'Dr. Ashley', color: '#a855f7', initial: 'A', tasks: 12, messages: 87, uptime: '99.1%', avgResponse: '2.4s' },
  { id: 'tesla', name: 'Tesla', color: '#06b6d4', initial: 'T', tasks: 35, messages: 678, uptime: '99.7%', avgResponse: '1.5s' },
];

const totalMessages = agents.reduce((s, a) => s + a.messages, 0);
const totalTasks = agents.reduce((s, a) => s + a.tasks, 0);

interface ModelUsage {
  agent: string;
  model: string;
  tokens: number;
  cost: number;
}

interface EmbeddingUsage {
  provider: string;
  tokens: number;
  cost: number;
}

interface AgentDetail {
  completionRate: number;
  avgTaskTime: string;
  cost: number;
}

export default function Analytics() {
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  const [embeddings, setEmbeddings] = useState<EmbeddingUsage[]>([]);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [agentDetails, setAgentDetails] = useState<Record<string, AgentDetail>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch model usage
    fetch('/api/analytics/models')
      .then(res => res.json())
      .then(data => setModelUsage(data))
      .catch(err => console.error('Failed to fetch model usage:', err));

    // Fetch embeddings
    fetch('/api/analytics/embeddings')
      .then(res => res.json())
      .then(data => setEmbeddings(data))
      .catch(err => console.error('Failed to fetch embeddings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleAgentClick = async (agentId: string) => {
    if (expandedAgent === agentId) {
      setExpandedAgent(null);
      return;
    }

    setExpandedAgent(agentId);
    
    if (!agentDetails[agentId]) {
      try {
        const res = await fetch(`/api/analytics/agents/${agentId}`);
        const data = await res.json();
        setAgentDetails(prev => ({ ...prev, [agentId]: data }));
      } catch (err) {
        console.error(`Failed to fetch details for agent ${agentId}:`, err);
      }
    }
  };

  const totalModelCost = modelUsage.reduce((sum, m) => sum + m.cost, 0);

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

      {/* Model Usage by Agent */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Model Usage by Agent</h2>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Agent</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Model</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Tokens</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-500">Loading...</td>
                </tr>
              ) : modelUsage.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-500">No model usage data available</td>
                </tr>
              ) : (
                <>
                  {modelUsage.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#1f1f23] transition-colors">
                      <td className="px-6 py-4 text-sm text-white">{item.agent}</td>
                      <td className="px-6 py-4 text-sm text-zinc-400 font-mono">{item.model}</td>
                      <td className="px-6 py-4 text-sm text-zinc-300 text-right font-mono">{item.tokens.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-zinc-300 text-right font-mono">${item.cost.toFixed(4)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[#27272a] bg-[#1f1f23]">
                    <td colSpan={3} className="px-6 py-4 text-sm font-semibold text-white">Total Cost</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-400 text-right font-mono">
                      ${totalModelCost.toFixed(4)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embeddings Usage */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Embeddings Usage</h2>
        <div className="grid grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 bg-[#18181b] border border-[#27272a] rounded-xl p-6 text-center text-sm text-zinc-500">
              Loading...
            </div>
          ) : embeddings.length === 0 ? (
            <div className="col-span-2 bg-[#18181b] border border-[#27272a] rounded-xl p-6 text-center text-sm text-zinc-500">
              No embeddings data available
            </div>
          ) : (
            embeddings.map((emb, idx) => (
              <div key={idx} className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 hover:bg-[#1f1f23] hover:border-[#3f3f46] transition-all">
                <p className="text-xs text-zinc-500 font-medium mb-3">{emb.provider}</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-zinc-400">Tokens</span>
                    <span className="text-xl font-bold text-white font-mono">{emb.tokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-zinc-400">Cost</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">${emb.cost.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Agent Performance (Expandable) */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Agent Performance (Detailed)</h2>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#27272a]/50">
            {agents.map((agent) => (
              <div key={agent.id}>
                <button
                  onClick={() => handleAgentClick(agent.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#1f1f23] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedAgent === agent.id ? (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    )}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: agent.color }}
                    >
                      <span className="text-white text-xs font-semibold">{agent.initial}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{agent.name}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-zinc-400 font-mono">
                    <span>{agent.messages.toLocaleString()} msgs</span>
                    <span>{agent.tasks} tasks</span>
                  </div>
                </button>
                
                {expandedAgent === agent.id && (
                  <div className="px-6 pb-6 pt-2 bg-[#0d0d0f] border-t border-[#27272a]/50">
                    {agentDetails[agent.id] ? (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                          <p className="text-xs text-zinc-500 font-medium mb-2">Completion Rate</p>
                          <p className="text-2xl font-bold text-white">{agentDetails[agent.id].completionRate}%</p>
                        </div>
                        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                          <p className="text-xs text-zinc-500 font-medium mb-2">Avg Task Time</p>
                          <p className="text-2xl font-bold text-white font-mono">{agentDetails[agent.id].avgTaskTime}</p>
                        </div>
                        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                          <p className="text-xs text-zinc-500 font-medium mb-2">Total Cost</p>
                          <p className="text-2xl font-bold text-emerald-400 font-mono">${agentDetails[agent.id].cost.toFixed(2)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-sm text-zinc-500 py-4">Loading details...</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Performance Table (Original) */}
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
