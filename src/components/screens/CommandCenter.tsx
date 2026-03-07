'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Activity, Clock, AlertCircle, TrendingUp, Users, Zap } from 'lucide-react';

interface CommandCenterProps {
  onAgentClick?: (name: string, emoji: string) => void;
}

interface ActivityEvent {
  id: string;
  agent: string;
  action: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface ActiveWorkItem {
  id: string;
  agent: string;
  task: string;
  status: 'running' | 'blocked' | 'paused';
  progress?: number;
  startedAt: string;
  metadata?: Record<string, any>;
}

interface CommandResponse {
  status: string;
  targetAgents: string[];
  response: string;
  timestamp: string;
}

interface ActivityStats {
  totalEvents: number;
  eventsLastHour: number;
  eventsLast24h: number;
  activeAgents: number;
  activeWork: number;
}

// Format relative time
const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(timestamp).toLocaleDateString();
};

export default function CommandCenter({ onAgentClick }: CommandCenterProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [activeWork, setActiveWork] = useState<ActiveWorkItem[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalEvents: 0,
    eventsLastHour: 0,
    eventsLast24h: 0,
    activeAgents: 0,
    activeWork: 0,
  });
  const [commandInput, setCommandInput] = useState('');
  const [commandResponse, setCommandResponse] = useState<CommandResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const activityEndRef = useRef<HTMLDivElement>(null);

  // Fetch activity feed from new endpoint
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/activity/feed?limit=50');
        if (res.ok) {
          const data = await res.json();
          setActivities(data.events || []);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  // Fetch activity stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/activity/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  // Fetch active work
  useEffect(() => {
    const fetchActiveWork = async () => {
      try {
        const res = await fetch('/api/work/active');
        if (res.ok) {
          const data = await res.json();
          setActiveWork(data.tasks || []);
        }
      } catch (error) {
        console.error('Failed to fetch active work:', error);
      }
    };

    fetchActiveWork();
    const interval = setInterval(fetchActiveWork, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll activity feed to bottom
  useEffect(() => {
    activityEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activities]);

  // Submit command
  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setCommandResponse(null);

    try {
      const res = await fetch('/api/command/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandInput }),
      });

      if (res.ok) {
        const data = await res.json();
        setCommandResponse(data);
        setCommandInput('');
      }
    } catch (error) {
      console.error('Command execution failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Command Center
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Command Center</h1>
        <p className="text-sm text-zinc-500 mt-1">Real-time fleet activity and command execution</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 hover:border-[#3f3f46] transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <Activity size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Events</p>
              <p className="text-2xl font-semibold text-white">{stats.totalEvents}</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600">All-time activity</p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 hover:border-[#3f3f46] transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-600/10 border border-green-500/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Last Hour</p>
              <p className="text-2xl font-semibold text-white">{stats.eventsLastHour}</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600">Recent activity</p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 hover:border-[#3f3f46] transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
              <Users size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Active Agents</p>
              <p className="text-2xl font-semibold text-white">{stats.activeAgents}</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600">Currently working</p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 hover:border-[#3f3f46] transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-600/10 border border-orange-500/20 flex items-center justify-center">
              <Zap size={20} className="text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Active Work</p>
              <p className="text-2xl font-semibold text-white">{stats.activeWork}</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600">Tasks in progress</p>
        </div>
      </div>

      {/* Layout: Activity Feed (60%) + Command Bar + Active Work (30%) */}
      <div className="grid grid-rows-[60fr_auto_30fr] gap-4" style={{ height: 'calc(100vh - 420px)' }}>
        
        {/* 1. ACTIVITY FEED (Top 60%) */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-[#27272a] flex items-center gap-2">
            <Activity size={16} className="text-zinc-400" />
            <h2 className="text-sm font-semibold text-white">Activity Feed</h2>
            <span className="ml-auto text-xs text-zinc-500">{activities.length} events</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activities.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                No activity yet
              </div>
            ) : (
              <>
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-[#111113] border border-[#27272a] rounded-lg hover:border-[#3f3f46] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-blue-400">
                        {activity.agent.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-white">{activity.agent}</span>
                        <span className="text-xs text-zinc-500">·</span>
                        <span className="text-xs text-zinc-500">{formatRelativeTime(activity.timestamp)}</span>
                      </div>
                      <p className="text-sm text-zinc-400 mt-0.5">{activity.action}</p>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <pre className="text-xs text-zinc-600 mt-1 font-mono">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={activityEndRef} />
              </>
            )}
          </div>
        </div>

        {/* 2. COMMAND BAR (Middle) */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4">
          <form onSubmit={handleCommandSubmit} className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="What do you need?"
                disabled={isSubmitting}
                className="flex-1 bg-[#111113] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSubmitting || !commandInput.trim()}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Execute
                  </>
                )}
              </button>
            </div>
            
            {/* Inline Response */}
            {commandResponse && (
              <div className="bg-[#111113] border border-green-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-green-600/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-green-400">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-green-400 font-medium mb-1">Command received</p>
                    <p className="text-sm text-zinc-400">{commandResponse.response}</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      Routed to: {commandResponse.targetAgents.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* 3. ACTIVE WORK (Bottom 30%) */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-[#27272a] flex items-center gap-2">
            <Clock size={16} className="text-zinc-400" />
            <h2 className="text-sm font-semibold text-white">Active Work</h2>
            <span className="ml-auto text-xs text-zinc-500">{activeWork.length} tasks</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {activeWork.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                No active work
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {activeWork.map((work) => (
                  <div
                    key={work.id}
                    className="bg-[#111113] border border-[#27272a] rounded-lg p-4 hover:border-[#3f3f46] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
                          <span className="text-xs font-semibold text-purple-400">
                            {work.agent.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-white">{work.agent}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        work.status === 'running' 
                          ? 'bg-green-600/10 text-green-400' 
                          : work.status === 'blocked'
                          ? 'bg-red-600/10 text-red-400'
                          : 'bg-yellow-600/10 text-yellow-400'
                      }`}>
                        {work.status}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 mb-2">{work.task}</p>
                    
                    {/* Progress bar */}
                    {typeof work.progress === 'number' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-zinc-500">Progress</span>
                          <span className="text-xs text-zinc-400">{work.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${work.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
