'use client';

import { useState, useEffect } from 'react';
import { DollarSign, ChevronDown, ChevronUp, X } from 'lucide-react';

interface AgentCost {
  agent: string;
  totalCost: number;
  calls: number;
  tokens: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
  };
}

interface LiveCosts {
  totalCost: number;
  hourlyCost: number;
  lastCallCost: number;
  agents: AgentCost[];
  timestamp: string;
}

export default function LiveCostTracker() {
  const [costs, setCosts] = useState<LiveCosts | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Initial fetch
    fetchCosts();
    
    // Poll every 5 seconds
    const interval = setInterval(fetchCosts, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  async function fetchCosts() {
    try {
      const res = await fetch('/api/costs/live');
      if (res.ok) {
        const data = await res.json();
        setCosts(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch costs:', error);
      setLoading(false);
    }
  }
  
  function formatCost(cost: number): string {
    if (cost === 0) return '$0.00';
    if (cost < 0.01) return `$${cost.toFixed(4)}`;
    return `$${cost.toFixed(2)}`;
  }
  
  function formatTokens(count: number): string {
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(2)}M`;
    }
    if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1)}K`;
    }
    return count.toString();
  }
  
  function getBarWidth(cost: number, maxCost: number): number {
    if (maxCost === 0) return 0;
    return Math.max((cost / maxCost) * 100, 2); // Minimum 2% for visibility
  }
  
  if (!visible) return null;
  
  const maxAgentCost = costs?.agents[0]?.totalCost || 1;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl w-80 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#27272a] flex items-center justify-between bg-gradient-to-r from-green-600/10 to-emerald-600/10">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-green-400" />
            <h3 className="text-sm font-semibold text-white">Live Cost Tracker</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-white/5 rounded transition-colors"
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? (
                <ChevronDown size={16} className="text-zinc-400" />
              ) : (
                <ChevronUp size={16} className="text-zinc-400" />
              )}
            </button>
            <button
              onClick={() => setVisible(false)}
              className="p-1 hover:bg-white/5 rounded transition-colors"
              title="Close"
            >
              <X size={16} className="text-zinc-400" />
            </button>
          </div>
        </div>
        
        {expanded && (
          <>
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
                <p className="text-xs text-zinc-500 mt-2">Loading costs...</p>
              </div>
            ) : costs ? (
              <>
                {/* Summary */}
                <div className="p-4 space-y-3 border-b border-[#27272a]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-zinc-500">Today</span>
                    <span className="text-2xl font-bold text-green-400">
                      {formatCost(costs.totalCost)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-zinc-500">This hour</span>
                    <span className="text-lg font-semibold text-white">
                      {formatCost(costs.hourlyCost)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-zinc-500">Last call</span>
                    <span className="text-sm font-medium text-zinc-400">
                      +{formatCost(costs.lastCallCost)}
                    </span>
                  </div>
                </div>
                
                {/* Per-Agent Breakdown */}
                <div className="p-4">
                  <h4 className="text-xs font-semibold text-zinc-400 mb-3">By Agent</h4>
                  <div className="space-y-2.5">
                    {costs.agents.length === 0 ? (
                      <p className="text-xs text-zinc-600 text-center py-2">
                        No activity today
                      </p>
                    ) : (
                      costs.agents.map((agent) => (
                        <div key={agent.agent} className="space-y-1">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs font-medium text-white">
                              {agent.agent}
                            </span>
                            <span className="text-xs font-semibold text-green-400">
                              {formatCost(agent.totalCost)}
                            </span>
                          </div>
                          <div className="h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-600 to-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${getBarWidth(agent.totalCost, maxAgentCost)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-zinc-600">
                            <span>{agent.calls} calls</span>
                            <span>
                              {formatTokens(agent.tokens.input + agent.tokens.output)} tokens
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Footer */}
                <div className="px-4 py-2 border-t border-[#27272a] bg-black/20">
                  <p className="text-xs text-zinc-600 text-center">
                    Updates every 5s · Real-time costs
                  </p>
                </div>
              </>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-red-400">Failed to load costs</p>
              </div>
            )}
          </>
        )}
        
        {!expanded && costs && (
          <div className="px-4 py-2">
            <p className="text-lg font-bold text-green-400 text-center">
              {formatCost(costs.totalCost)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
