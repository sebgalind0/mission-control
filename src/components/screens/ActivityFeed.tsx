'use client';

import { useEffect, useState } from 'react';

interface Event {
  id: string;
  type: string;
  sessionKey: string | null;
  timestamp: string;
  data: any;
}

interface Activity {
  id: string;
  agent: string;
  agentName: string;
  action: string;
  type: string;
  time: string;
  color: string;
  initial: string;
}

const typeConfig: Record<string, { bg: string; text: string }> = {
  session_created: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  session_activity: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  tool_call: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  commit: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  task_completion: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
};

const agentColors: Record<string, { color: string; initial: string; name: string }> = {
  'agent:larry:main': { color: '#3b82f6', initial: 'L', name: 'Larry' },
  'agent:neo:main': { color: '#22c55e', initial: 'N', name: 'Neo' },
  'agent:bolt:main': { color: '#f59e0b', initial: 'B', name: 'Bolt' },
  'agent:main:main': { color: '#ef4444', initial: 'R', name: 'Rick' },
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function formatEventAction(event: Event): string {
  switch (event.type) {
    case 'session_created':
      return `Started new session (${event.data.model || 'unknown model'})`;
    case 'session_activity':
      return `Active session (${event.data.totalTokens || 0} tokens)`;
    case 'tool_call':
      return `Called tool: ${event.data.toolName}`;
    case 'commit':
      return `Committed: ${event.data.message}`;
    case 'task_completion':
      return `Completed: ${event.data.taskName}`;
    default:
      return 'Unknown activity';
  }
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        
        const formatted = (data.events || []).map((event: Event) => {
          const agentInfo = agentColors[event.sessionKey || ''] || {
            color: '#6b7280',
            initial: '?',
            name: 'Unknown',
          };
          
          return {
            id: event.id,
            agent: event.sessionKey || 'unknown',
            agentName: agentInfo.name,
            action: formatEventAction(event),
            type: event.type,
            time: formatTimeAgo(event.timestamp),
            color: agentInfo.color,
            initial: agentInfo.initial,
          };
        });
        
        setActivities(formatted);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
    const interval = setInterval(fetchEvents, 10000); // Refresh every 10s
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
            Mission Control › Activity Feed
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Activity Feed</h1>
          <p className="text-sm text-zinc-500 mt-1">Real-time timeline of fleet actions</p>
        </div>
        <div className="text-center text-zinc-500 py-12">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Activity Feed
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Activity Feed</h1>
        <p className="text-sm text-zinc-500 mt-1">Real-time timeline of fleet actions</p>
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        {activities.length === 0 ? (
          <div className="text-center text-zinc-500 py-12">No events yet</div>
        ) : (
          activities.map((activity) => {
            const typeStyle = typeConfig[activity.type] || { bg: 'bg-zinc-500/10', text: 'text-zinc-400' };
            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 py-4 px-5 rounded-xl hover:bg-[#18181b] transition-colors group"
              >
                {/* Avatar */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: activity.color }}
                  >
                    <span className="text-white text-xs font-semibold">{activity.initial}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        <span className="font-medium text-white">{activity.agentName}</span>{' '}
                        {activity.action}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                        {activity.type}
                      </span>
                      <span className="text-[11px] text-zinc-600 whitespace-nowrap">{activity.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
