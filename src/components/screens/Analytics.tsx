'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ModelUsage {
  agent: string;
  model: string;
  tokensUsed: number;
  cost: number;
}

interface EmbeddingUsage {
  service: string;
  requests: number;
  tokens: number;
  cost: number;
}

interface AgentDetail {
  completionRate: number;
  avgTaskTime: string;
  cost: number;
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'offline';
  lastActivity: string;
  currentTask: string | null;
  role?: string;
  department?: string;
  color?: string;
  initial?: string;
}

export default function Analytics() {
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  const [embeddings, setEmbeddings] = useState<EmbeddingUsage[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [agentDetails, setAgentDetails] = useState<Record<string, AgentDetail>>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMessages: 0,
    tasksCompleted: 0,
    avgResponseTime: '0.0',
    fleetUptime: '0.0',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then((res) => res.json()),
      fetch('/api/analytics/models').then((res) => res.json()),
      fetch('/api/analytics/embeddings').then((res) => res.json()),
      fetch('/api/agents/status').then((res) => res.json()),
    ])
      .then(([analytics, models, embeddingsData, agents]) => {
        setStats({
          totalMessages: analytics.totalMessages || 0,
          tasksCompleted: analytics.tasksCompleted || 0,
          avgResponseTime: analytics.avgResponseTime || '0.0',
          fleetUptime: analytics.fleetUptime || '0.0',
        });
        setModelUsage(models.modelUsage || []);
        setEmbeddings(embeddingsData.embeddingsUsage || []);
        setAgentStatuses(agents.agents || []);
      })
      .catch((error) => console.error('Failed to fetch analytics:', error))
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
        setAgentDetails((prev) => ({
          ...prev,
          [agentId]: {
            completionRate: data.performance?.completionRate || 0,
            avgTaskTime: data.performance?.avgTaskTimeHours ? `${data.performance.avgTaskTimeHours}h` : '0h',
            cost: data.performance?.cost || 0,
          },
        }));
      } catch (error) {
        console.error(`Failed to fetch details for ${agentId}:`, error);
      }
    }
  };

  const agentRows = agentStatuses.map((agent) => {
    const usage = modelUsage.filter((entry) => entry.agent === agent.name);
    return {
      ...agent,
      tokens: usage.reduce((sum, entry) => sum + entry.tokensUsed, 0),
      estCost: usage.reduce((sum, entry) => sum + entry.cost, 0),
    };
  });

  const totalModelCost = modelUsage.reduce((sum, entry) => sum + entry.cost, 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Analytics
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-1">Current-week view of the live roster, tuned for operating decisions instead of raw instrumentation.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Current Week Messages" value={stats.totalMessages.toLocaleString()} sublabel="Session events from the live roster" />
        <StatCard label="Current Week Deliveries" value={stats.tasksCompleted.toString()} sublabel="Mission Control tasks marked done" />
        <StatCard label="Avg Response Time" value={`${stats.avgResponseTime}s`} sublabel="Recent session activity only" />
        <StatCard label="Fleet Uptime" value={`${stats.fleetUptime}%`} sublabel="Operational estimate across current roster" />
      </div>

      <section>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Model Usage by Agent · Current Week</h2>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Agent</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Model</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Tokens</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Est. Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-500">Loading...</td></tr>
              ) : modelUsage.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-500">No model usage data recorded yet</td></tr>
              ) : (
                <>
                  {modelUsage.map((entry, index) => (
                    <tr key={`${entry.agent}-${entry.model}-${index}`} className="hover:bg-[#1f1f23] transition-colors">
                      <td className="px-6 py-4 text-sm text-white">{entry.agent}</td>
                      <td className="px-6 py-4 text-sm text-zinc-400 font-mono">{entry.model}</td>
                      <td className="px-6 py-4 text-sm text-zinc-300 text-right font-mono">{entry.tokensUsed.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-zinc-300 text-right font-mono">${entry.cost.toFixed(4)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[#27272a] bg-[#1f1f23]">
                    <td colSpan={3} className="px-6 py-4 text-sm font-semibold text-white">Total Estimated Cost</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-400 text-right font-mono">${totalModelCost.toFixed(4)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Embeddings Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 bg-[#18181b] border border-[#27272a] rounded-xl p-6 text-center text-sm text-zinc-500">Loading...</div>
          ) : embeddings.length === 0 ? (
            <div className="col-span-2 bg-[#18181b] border border-[#27272a] rounded-xl p-6 text-center text-sm text-zinc-500">
              Embeddings usage is not tracked in the current stack
            </div>
          ) : (
            embeddings.map((embedding) => (
              <div key={embedding.service} className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
                <div className="text-xs text-zinc-500 font-medium mb-3">{embedding.service}</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-zinc-400">Tokens</span>
                    <span className="text-xl font-bold text-white font-mono">{embedding.tokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-zinc-400">Cost</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">${embedding.cost.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Agent Performance</h2>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#27272a]/50">
            {agentRows.map((agent) => (
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
                      style={{ backgroundColor: agent.color || '#6b7280' }}
                    >
                      <span className="text-white text-xs font-semibold">{agent.initial || agent.name.slice(0, 1)}</span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-white">{agent.name}</div>
                      <div className="text-[11px] text-zinc-500">{agent.role || agent.department || 'Agent'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-zinc-400 font-mono">
                    <span>{agent.tokens.toLocaleString()} tokens</span>
                    <span className={agent.status === 'active' ? 'text-emerald-400' : 'text-zinc-500'}>{agent.status}</span>
                  </div>
                </button>
                {expandedAgent === agent.id && (
                  <div className="px-6 pb-6 pt-2 bg-[#0d0d0f] border-t border-[#27272a]/50">
                    {agentDetails[agent.id] ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailCard label="Completion Rate" value={`${agentDetails[agent.id].completionRate}%`} />
                        <DetailCard label="Avg Task Time" value={agentDetails[agent.id].avgTaskTime} />
                        <DetailCard label="Task Cost (Est.)" value={`$${agentDetails[agent.id].cost.toFixed(2)}`} />
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
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Current Roster Summary</h2>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <DetailCard label="Active Agents" value={agentStatuses.filter((agent) => agent.status === 'active').length.toString()} />
            <DetailCard label="Tracked Roster" value={agentStatuses.length.toString()} />
            <DetailCard label="Model Usage Rows" value={modelUsage.length.toString()} />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
      <p className="text-xs text-zinc-500 font-medium mb-2">{label}</p>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-zinc-600 mt-1">{sublabel}</p>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
      <p className="text-xs text-zinc-500 font-medium mb-2">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
