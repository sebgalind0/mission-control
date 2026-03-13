import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    
    return NextResponse.json({
      events: allEvents,
      count: allEvents.length,
      degraded: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    return NextResponse.json({
      events: [],
      count: 0,
      degraded: true,
      error: 'Activity feed unavailable',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
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
