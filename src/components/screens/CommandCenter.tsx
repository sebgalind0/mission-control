'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Activity, Clock, AlertCircle, TrendingUp, Users, Zap, GitCommit, Bot, CheckCircle, XCircle, Play, Pause } from 'lucide-react';

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

interface ActiveAgent {
  name: string;
  currentWork: string;
  startedAt: string;
  status: 'running' | 'idle' | 'blocked';
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

// Format duration
const formatDuration = (startTime: string) => {
  const now = new Date();
  const start = new Date(startTime);
  const diffMs = now.getTime() - start.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHr = Math.floor(diffMin / 60);
  
  if (diffMin < 60) return `${diffMin}m`;
  return `${diffHr}h ${diffMin % 60}m`;
};

// Get icon for activity type
const getActivityIcon = (action: string) => {
  if (action.includes('commit') || action.includes('git')) return <GitCommit size={14} className="text-blue-400" />;
  if (action.includes('agent') || action.includes('started') || action.includes('stopped')) return <Bot size={14} className="text-purple-400" />;
  if (action.includes('deploy') || action.includes('build')) return <Zap size={14} className="text-orange-400" />;
  if (action.includes('completed') || action.includes('done')) return <CheckCircle size={14} className="text-green-400" />;
  if (action.includes('failed') || action.includes('error')) return <XCircle size={14} className="text-red-400" />;
  return <Activity size={14} className="text-zinc-400" />;
};

export default function CommandCenter({ onAgentClick }: CommandCenterProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [activeWork, setActiveWork] = useState<ActiveWorkItem[]>([]);
  const [activeAgents, setActiveAgents] = useState<ActiveAgent[]>([]);
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
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const activityEndRef = useRef<HTMLDivElement>(null);

  // Fetch activity feed - LIVE data
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Get today's start time
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const res = await fetch(`/api/activity/feed?limit=100&since=${todayStart.toISOString()}`);
        if (res.ok) {
          const data = await res.json();
          setActivities(data.events || []);
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Fetch activity stats - TODAY's data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/activity/stats');
        if (res.ok) {
          const data = await res.json();
          
          // Calculate TODAY's events from the activity feed
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayEvents = activities.filter(a => new Date(a.timestamp) >= todayStart).length;
          
          setStats({
            ...data,
            totalEvents: todayEvents, // TODAY's events, not all-time
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [activities]);

  // Fetch active work - only IN_PROGRESS
  useEffect(() => {
    const fetchActiveWork = async () => {
      try {
        const res = await fetch('/api/work/active');
        if (res.ok) {
          const data = await res.json();
          // Only show running tasks (IN_PROGRESS)
          setActiveWork((data.tasks || []).filter((t: ActiveWorkItem) => t.status === 'running'));
        }
      } catch (error) {
        console.error('Failed to fetch active work:', error);
      }
    };

    fetchActiveWork();
    const interval = setInterval(fetchActiveWork, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Derive active agents from recent activity and active work
  useEffect(() => {
    const deriveActiveAgents = () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      // Get agents with recent activity
      const recentAgents = activities
        .filter(a => new Date(a.timestamp) >= fiveMinutesAgo)
        .map(a => a.agent);
      
      // Get agents with active work
      const workingAgents = activeWork.map(w => w.agent);
      
      // Combine and deduplicate
      const allActiveAgents = [...new Set([...recentAgents, ...workingAgents])];
      
      // Build agent details
      const agents: ActiveAgent[] = allActiveAgents.map(agentName => {
        const work = activeWork.find(w => w.agent === agentName);
        const recentActivity = activities
          .filter(a => a.agent === agentName)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        return {
          name: agentName,
          currentWork: work?.task || recentActivity?.action || 'Idle',
          startedAt: work?.startedAt || recentActivity?.timestamp || now.toISOString(),
          status: work ? (work.status as 'running' | 'idle' | 'blocked') : 'idle',
        };
      });
      
      setActiveAgents(agents);
    };
    
    deriveActiveAgents();
  }, [activities, activeWork]);

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
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Command Center</h1>
            <p className="text-sm text-zinc-500 mt-1">Live mission control nerve center</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-zinc-500">Live · Updated {formatRelativeTime(lastUpdate.toISOString())}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards - TODAY's data */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 hover:border-[#3f3f46] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <Activity size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Events Today</p>
              <p className="text-2xl font-semibold text-white">{stats.totalEvents}</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600">Since midnight</p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 hover:border-[#3f3f46] hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-600/10 border border-green-500/20 flex items-center justify-center">
              <GitCommit size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Commits (1h)</p>
              <p className="text-2xl font-semibold text-white">
                {activities.filter(a => 
                  (a.action.includes('commit') || a.action.includes('git')) &&
                  new Date(a.timestamp).getTime() > Date.now() - 60 * 60 * 1000
                ).length}
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-600">Last hour</p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 hover:border-[#3f3f46] hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
              <Users size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Active Agents</p>
              <p className="text-2xl font-semibold text-white">{activeAgents.length}</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600">Right now</p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 hover:border-[#3f3f46] hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-600/10 border border-orange-500/20 flex items-center justify-center">
              <Zap size={20} className="text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">In Progress</p>
              <p className="text-2xl font-semibold text-white">{activeWork.length}</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600">Tasks running</p>
        </div>
      </div>

      {/* Main Grid: Activity Feed + Active Agents + Active Work */}
      <div className="grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 500px)' }}>
        
        {/* LEFT: Activity Feed (60%) */}
        <div className="col-span-7 bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-[#27272a] flex items-center gap-2">
            <Activity size={16} className="text-zinc-400" />
            <h2 className="text-sm font-semibold text-white">Activity Feed</h2>
            <span className="ml-auto text-xs text-zinc-500">{activities.length} events today</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Activity size={32} className="text-zinc-700" />
                <p className="text-sm text-zinc-500">All quiet. Your agents are standing by.</p>
              </div>
            ) : (
              <>
                {activities.slice().reverse().map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-[#111113] border border-[#27272a] rounded-lg hover:border-[#3f3f46] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-white">{activity.agent}</span>
                        <span className="text-xs text-zinc-500">·</span>
                        <span className="text-xs text-zinc-500">{formatRelativeTime(activity.timestamp)}</span>
                      </div>
                      <p className="text-sm text-zinc-400 mt-0.5">{activity.action}</p>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-2 text-xs text-zinc-600 font-mono bg-black/30 rounded px-2 py-1">
                          {JSON.stringify(activity.metadata, null, 2).slice(0, 200)}
                          {JSON.stringify(activity.metadata).length > 200 && '...'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={activityEndRef} />
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Agents + Active Work */}
        <div className="col-span-5 flex flex-col gap-4">
          
          {/* Active Agents Panel */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden flex flex-col" style={{ height: '45%' }}>
            <div className="px-5 py-3 border-b border-[#27272a] flex items-center gap-2">
              <Bot size={16} className="text-zinc-400" />
              <h2 className="text-sm font-semibold text-white">Active Agents</h2>
              <span className="ml-auto text-xs text-zinc-500">{activeAgents.length} online</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeAgents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Bot size={32} className="text-zinc-700" />
                  <p className="text-sm text-zinc-500">No agents deployed. Ready when you are.</p>
                </div>
              ) : (
                activeAgents.map((agent, idx) => (
                  <div
                    key={idx}
                    className="bg-[#111113] border border-[#27272a] rounded-lg p-3 hover:border-[#3f3f46] transition-colors cursor-pointer"
                    onClick={() => onAgentClick?.(agent.name, '🤖')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
                          {agent.status === 'running' ? (
                            <Play size={12} className="text-purple-400" />
                          ) : agent.status === 'blocked' ? (
                            <AlertCircle size={12} className="text-red-400" />
                          ) : (
                            <Pause size={12} className="text-yellow-400" />
                          )}
                        </div>
                        <span className="text-xs font-medium text-white">{agent.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        agent.status === 'running' 
                          ? 'bg-green-600/10 text-green-400' 
                          : agent.status === 'blocked'
                          ? 'bg-red-600/10 text-red-400'
                          : 'bg-yellow-600/10 text-yellow-400'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mb-1">{agent.currentWork}</p>
                    <p className="text-xs text-zinc-600">Runtime: {formatDuration(agent.startedAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Work Panel */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden flex flex-col" style={{ height: '55%' }}>
            <div className="px-5 py-3 border-b border-[#27272a] flex items-center gap-2">
              <Clock size={16} className="text-zinc-400" />
              <h2 className="text-sm font-semibold text-white">Active Work</h2>
              <span className="ml-auto text-xs text-zinc-500">{activeWork.length} in progress</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeWork.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Clock size={32} className="text-zinc-700" />
                  <p className="text-sm text-zinc-500">All caught up. No tasks running.</p>
                </div>
              ) : (
                activeWork.map((work) => (
                  <div
                    key={work.id}
                    className="bg-[#111113] border border-[#27272a] rounded-lg p-4 hover:border-[#3f3f46] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-400">
                            {work.agent.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-white">{work.agent}</span>
                          <p className="text-xs text-zinc-600">{formatDuration(work.startedAt)} elapsed</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-300 mb-3">{work.task}</p>
                    
                    {/* Progress bar */}
                    {typeof work.progress === 'number' && (
                      <div>
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Command Bar */}
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
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 active:scale-95 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
    </div>
  );
}
