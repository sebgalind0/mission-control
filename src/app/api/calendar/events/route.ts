import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';

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

function mapTaskStatus(status: Status): 'scheduled' | 'in_review' | 'completed' {
  switch (status) {
    case Status.REVIEW:
      return 'in_review';
    case Status.DONE:
      return 'completed';
    case Status.BACKLOG:
    case Status.IN_PROGRESS:
    default:
      return 'scheduled';
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

    // Build where clause for tasks
    const where: any = {
      deadline: {
        gte: start,
        lte: end,
      },
    };

    if (agentFilter.length > 0) {
      where.assignee = { in: agentFilter };
    }

    // Fetch tasks with deadlines in range
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { deadline: 'asc' },
    });

    // Transform tasks to calendar events
    const events: CalendarEvent[] = tasks.map(task => ({
      id: task.id,
      type: 'task' as const,
      title: task.title,
      agent: task.assignee,
      department: null, // TODO: Map agent to department
      project: task.tag || null,
      start: task.deadline!.toISOString(),
      end: task.deadline!.toISOString(), // Tasks are point-in-time
      status: mapTaskStatus(task.status),
      description: task.description,
    }));

    // TODO: Add cron jobs integration
    // TODO: Add agent activity integration

    // Filter by project if specified
    const filteredEvents = projectFilter.length > 0
      ? events.filter(e => e.project && projectFilter.includes(e.project))
      : events;

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
