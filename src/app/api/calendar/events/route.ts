import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { CalendarEventType } from '@prisma/client';

interface CalendarEvent {
  id: string;
  type: 'task' | 'cron' | 'activity';
  title: string;
  agent: string | null;
  department: string | null;
  project: string | null;
  start: string;
  end: string | null;
  status: 'scheduled' | 'in_review' | 'completed';
  description: string;
}

function mapEventType(type: CalendarEventType): 'task' | 'cron' | 'activity' {
  switch (type) {
    case CalendarEventType.TASK_EVENT:
      return 'task';
    case CalendarEventType.MEETING:
      return 'activity';
    case CalendarEventType.RECURRING:
      return 'cron';
    default:
      return 'task';
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const agentFilter = searchParams.get('agents')?.split(',').filter(Boolean) || [];
    const projectFilter = searchParams.get('projects')?.split(',').filter(Boolean) || [];

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start and end date parameters are required (YYYY-MM-DD format)' },
        { status: 400 }
      );
    }

    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Fetch calendar events in the date range
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        startTime: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // Transform CalendarEvent to frontend format
    const events: CalendarEvent[] = calendarEvents.map(event => ({
      id: event.id,
      type: mapEventType(event.type),
      title: event.title,
      agent: null, // CalendarEvent doesn't have agent field yet
      department: null,
      project: null,
      start: event.startTime.toISOString(),
      end: event.endTime?.toISOString() || event.startTime.toISOString(),
      status: 'scheduled', // CalendarEvent doesn't have status field yet
      description: event.description || '',
    }));

    // Filter by agent if specified (when agent field is added to CalendarEvent)
    // Filter by project if specified (when project field is added to CalendarEvent)
    const filteredEvents = events;

    return NextResponse.json({
      events: filteredEvents,
      count: filteredEvents.length,
      range: { start: startDate, end: endDate },
    });
  } catch (error: any) {
    console.error('[CALENDAR_EVENTS_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
