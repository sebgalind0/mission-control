import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { CalendarEventType, Status } from '@prisma/client';
import { getAgentMeta } from '@/lib/openclawRoster';

const ALLOW_DEMO_DATA = process.env.ALLOW_DEMO_DATA === 'true';

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

function mapTaskStatus(status: Status): 'scheduled' | 'in_review' | 'completed' {
  switch (status) {
    case Status.DONE:
      return 'completed';
    case Status.REVIEW:
      return 'in_review';
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

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        startTime: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const taskWhere: {
      assignee?: { in: string[] };
      tag?: { in: string[] };
      OR: Array<{
        deadline?: { gte: Date; lte: Date };
        createdAt?: { gte: Date; lte: Date };
      }>;
    } = {
      OR: [
        { deadline: { gte: start, lte: end } },
        { createdAt: { gte: start, lte: end } },
      ],
    };

    if (agentFilter.length > 0) {
      taskWhere.assignee = { in: agentFilter };
    }

    if (projectFilter.length > 0) {
      taskWhere.tag = { in: projectFilter };
    }

    const tasks = await prisma.task.findMany({
      where: taskWhere,
      orderBy: [{ deadline: 'asc' }, { createdAt: 'asc' }],
    });

    const taskEvents: CalendarEvent[] = tasks.map((task) => {
      const eventStart = task.deadline ?? task.createdAt;
      const meta = task.assignee ? getAgentMeta(task.assignee) : null;

      return {
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        agent: task.assignee,
        department: meta?.department ?? null,
        project: task.tag ?? null,
        start: eventStart.toISOString(),
        end: null,
        status: mapTaskStatus(task.status),
        description: task.description,
      };
    });

    const mappedCalendarEvents: CalendarEvent[] = calendarEvents.map((event) => ({
      id: event.id,
      type: mapEventType(event.type),
      title: event.title,
      agent: null,
      department: null,
      project: null,
      start: event.startTime.toISOString(),
      end: event.endTime?.toISOString() || event.startTime.toISOString(),
      status: 'scheduled',
      description: event.description || '',
    }));

    const mergedEvents = [...mappedCalendarEvents, ...taskEvents].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    if (!ALLOW_DEMO_DATA && mergedEvents.length === 0) {
      return NextResponse.json({
        events: [],
        count: 0,
        range: { start: startDate, end: endDate },
      });
    }

    return NextResponse.json({
      events: mergedEvents,
      count: mergedEvents.length,
      range: { start: startDate, end: endDate },
    });
  } catch (error: unknown) {
    console.error('[CALENDAR_EVENTS_ERROR]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
