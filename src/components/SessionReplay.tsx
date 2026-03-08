'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Brain, MessageSquare, Wrench, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'thinking' | 'text' | 'tool_call' | 'tool_result' | 'user_message';
  timestamp: string;
  elapsedMs: number;
  content: string;
  metadata?: any;
  toolName?: string;
  toolArgs?: any;
  toolResult?: any;
}

interface SessionReplayProps {
  sessionId: string;
  onClose: () => void;
}

export default function SessionReplay({ sessionId, onClose }: SessionReplayProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalDurationMs, setTotalDurationMs] = useState(0);
  const [sessionStart, setSessionStart] = useState('');
  
  const playbackInterval = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    fetchTimeline();
    
    return () => {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    };
  }, [sessionId]);
  
  async function fetchTimeline() {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/replay`);
      if (res.ok) {
        const data = await res.json();
        setTimeline(data.timeline || []);
        setTotalDurationMs(data.totalDurationMs || 0);
        setSessionStart(data.sessionStart || '');
        setLoading(false);
      } else {
        console.error('Failed to fetch timeline:', await res.text());
        setLoading(false);
      }
    } catch (error) {
      console.error('Timeline fetch error:', error);
      setLoading(false);
    }
  }
  
  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  function formatTimestamp(isoTimestamp: string): string {
    const date = new Date(isoTimestamp);
    return date.toLocaleTimeString();
  }
  
  function getEventIcon(type: string) {
    switch (type) {
      case 'thinking': return <Brain size={14} className="text-purple-400" />;
      case 'text': return <MessageSquare size={14} className="text-blue-400" />;
      case 'tool_call': return <Wrench size={14} className="text-orange-400" />;
      case 'tool_result': return <CheckCircle size={14} className="text-green-400" />;
      case 'user_message': return <MessageSquare size={14} className="text-zinc-400" />;
      default: return <Clock size={14} className="text-zinc-500" />;
    }
  }
  
  function handlePlayPause() {
    if (isPlaying) {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
        playbackInterval.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playbackInterval.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= timeline.length - 1) {
            if (playbackInterval.current) {
              clearInterval(playbackInterval.current);
              playbackInterval.current = null;
            }
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500); // Advance every 1.5s
    }
  }
  
  function handleSkipBack() {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  }
  
  function handleSkipForward() {
    setCurrentIndex(Math.min(timeline.length - 1, currentIndex + 1));
  }
  
  function handleScrubberClick(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.floor(percentage * timeline.length);
    setCurrentIndex(Math.max(0, Math.min(timeline.length - 1, newIndex)));
  }
  
  const currentEvent = timeline[currentIndex];
  const progress = timeline.length > 0 ? (currentIndex / (timeline.length - 1)) * 100 : 0;
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-8 max-w-md">
          <div className="text-center">
            <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
            <p className="text-white font-medium">Loading session replay...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (timeline.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-8 max-w-md">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">No timeline available</p>
            <p className="text-sm text-zinc-500">This session has no recorded events.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg text-sm text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Session Replay</h2>
            <p className="text-xs text-zinc-500 mt-1">
              {sessionStart && formatTimestamp(sessionStart)} · {formatDuration(totalDurationMs)} total
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>
        
        {/* Timeline scrubber */}
        <div className="px-6 py-4 border-b border-[#27272a]">
          <div className="flex items-center gap-4">
            {/* Playback controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSkipBack}
                className="w-8 h-8 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] flex items-center justify-center transition-colors"
                disabled={currentIndex === 0}
              >
                <SkipBack size={14} className="text-white" />
              </button>
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <Pause size={16} className="text-white" />
                ) : (
                  <Play size={16} className="text-white" />
                )}
              </button>
              <button
                onClick={handleSkipForward}
                className="w-8 h-8 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] flex items-center justify-center transition-colors"
                disabled={currentIndex >= timeline.length - 1}
              >
                <SkipForward size={14} className="text-white" />
              </button>
            </div>
            
            {/* Scrubber */}
            <div className="flex-1">
              <div
                className="h-2 bg-[#27272a] rounded-full overflow-hidden cursor-pointer"
                onClick={handleScrubberClick}
              >
                <div
                  className="h-full bg-blue-600 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-zinc-500">
                <span>{currentEvent && formatDuration(currentEvent.elapsedMs)}</span>
                <span>{currentIndex + 1} / {timeline.length}</span>
                <span>{formatDuration(totalDurationMs)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentEvent && (
            <div className="space-y-4">
              {/* Event header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center">
                  {getEventIcon(currentEvent.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white capitalize">
                    {currentEvent.type.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatTimestamp(currentEvent.timestamp)}
                    {currentEvent.toolName && ` · ${currentEvent.toolName}`}
                  </p>
                </div>
              </div>
              
              {/* Event content */}
              <div className="bg-[#111113] border border-[#27272a] rounded-lg p-4">
                {currentEvent.type === 'thinking' && (
                  <div>
                    <p className="text-xs text-purple-400 font-medium mb-2">🧠 Thinking...</p>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap">{currentEvent.content}</p>
                  </div>
                )}
                
                {currentEvent.type === 'text' && (
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">{currentEvent.content}</p>
                )}
                
                {currentEvent.type === 'user_message' && (
                  <div>
                    <p className="text-xs text-zinc-500 font-medium mb-2">User message:</p>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap">{currentEvent.content}</p>
                  </div>
                )}
                
                {currentEvent.type === 'tool_call' && (
                  <div>
                    <p className="text-xs text-orange-400 font-medium mb-2">
                      🔧 Tool: {currentEvent.toolName}
                    </p>
                    <pre className="text-xs text-zinc-400 bg-black/30 p-3 rounded overflow-x-auto">
                      {JSON.stringify(currentEvent.toolArgs, null, 2)}
                    </pre>
                  </div>
                )}
                
                {currentEvent.type === 'tool_result' && (
                  <div>
                    <p className="text-xs text-green-400 font-medium mb-2">
                      ✅ Result: {currentEvent.toolName}
                    </p>
                    <pre className="text-xs text-zinc-400 bg-black/30 p-3 rounded overflow-x-auto max-h-64">
                      {currentEvent.content}
                    </pre>
                    {currentEvent.metadata?.isError && (
                      <p className="text-xs text-red-400 mt-2">⚠️ Tool call failed</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
