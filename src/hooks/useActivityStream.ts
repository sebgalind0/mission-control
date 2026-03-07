import { useEffect, useRef, useState } from 'react';

interface ActivityEvent {
  id: string;
  agent: string;
  action: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export function useActivityStream(enabled: boolean = true) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Connect to SSE endpoint
    const eventSource = new EventSource('/api/activity/live');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[ActivityStream] Connected');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected' || data.type === 'ping') {
          // Ignore connection/ping events
          return;
        }
        
        if (data.type === 'activity') {
          // New activity event
          setEvents(prev => [data, ...prev].slice(0, 100)); // Keep last 100
        }
      } catch (error) {
        console.error('[ActivityStream] Parse error:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[ActivityStream] Error:', error);
      setIsConnected(false);
      
      // EventSource will auto-reconnect, but we can handle it here if needed
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('[ActivityStream] Connection closed, will retry');
      }
    };

    // Cleanup on unmount
    return () => {
      console.log('[ActivityStream] Disconnecting');
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [enabled]);

  return {
    events,
    isConnected,
    disconnect: () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
    }
  };
}
