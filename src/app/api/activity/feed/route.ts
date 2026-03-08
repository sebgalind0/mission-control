import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Sample data for when database is empty or unavailable
const getSampleData = () => {
  const now = new Date();
  return [
    {
      id: 'sample-1',
      agent: 'Neo',
      action: 'Implementing Phase 2 UX improvements',
      metadata: { phase: 2, progress: '65%' },
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'sample-2',
      agent: 'Bolt',
      action: 'Optimized API response times',
      metadata: { improvement: '40%', target: 'sub-100ms' },
      timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'sample-3',
      agent: 'Larry',
      action: 'Code review completed',
      metadata: { files: 3, status: 'approved' },
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    },
  ];
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const since = searchParams.get('since');
    
    const where = since 
      ? { timestamp: { gt: new Date(since) } }
      : {};
    
    // Fetch both ActivityEvent and Event (OpenClaw events)
    const [activityEvents, openclawEvents] = await Promise.all([
      prisma.activityEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
      }),
      prisma.event.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
      }),
    ]);
    
    // Transform OpenClaw events to match ActivityEvent structure
    const transformedOpenclawEvents = openclawEvents.map(event => ({
      id: event.id,
      agent: extractAgentName(event.sessionKey || ''),
      action: formatEventAction(event.type, event.data),
      metadata: event.data,
      timestamp: event.timestamp.toISOString(),
    }));
    
    // Merge and sort all events by timestamp
    const allEvents = [...activityEvents, ...transformedOpenclawEvents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    // If no events found, return sample data
    const events = allEvents.length > 0 ? allEvents : getSampleData();
    
    return NextResponse.json({
      events,
      count: events.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    // Return sample data on error
    const sampleData = getSampleData();
    return NextResponse.json({
      events: sampleData,
      count: sampleData.length,
      timestamp: new Date().toISOString(),
    });
  }
}

// Extract agent name from OpenClaw sessionKey (e.g., "agent:larry:main" → "Larry")
function extractAgentName(sessionKey: string): string {
  const match = sessionKey.match(/agent:([^:]+)/);
  if (match) {
    const name = match[1];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return 'System';
}

// Format OpenClaw event type + data into a readable action string
function formatEventAction(type: string, data: any): string {
  switch (type) {
    case 'session_created':
      return `Session started (${data.model || 'unknown model'})`;
    case 'session_activity':
      return `Active session (${data.outputTokens || 0} tokens generated)`;
    case 'test_event':
      return data.message || 'Test event';
    default:
      return type.replace(/_/g, ' ');
  }
}
