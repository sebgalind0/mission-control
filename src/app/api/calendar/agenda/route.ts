import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';

interface AgendaItem {
  id: string;
  type: 'task' | 'cron' | 'activity';
  title: string;
  agent: string | null;
  time: string;
  countdown: string;
  status: 'scheduled' | 'in_review' | 'completed';
  description: string;
}

interface GroupedAgenda {
  morning: AgendaItem[];
  afternoon: AgendaItem[];
  evening: AgendaItem[];
}

function getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function getCountdown(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff < 0) return 'overdue';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `in ${days}d`;
  }
  
  if (hours > 0) {
    return `in ${hours}h ${minutes}m`;
  }
  
  return `in ${minutes}m`;
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
    const dateParam = searchParams.get('date');
    
    // Default to today (UTC date string)
    const dateStr = dateParam || new Date().toISOString().split('T')[0];
    
    // Set to start and end of day in UTC
    const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
    const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

    // Validate date
    if (isNaN(startOfDay.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Fetch tasks for the day
    const tasks = await prisma.task.findMany({
      where: {
        deadline: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { deadline: 'asc' },
    });

    // Transform and group tasks
    const agenda: GroupedAgenda = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    tasks.forEach(task => {
      if (!task.deadline) return;
      
      const timeOfDay = getTimeOfDay(task.deadline);
      const item: AgendaItem = {
        id: task.id,
        type: 'task' as const,
        title: task.title,
        agent: task.assignee,
        time: task.deadline.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        countdown: getCountdown(task.deadline),
        status: mapTaskStatus(task.status),
        description: task.description,
      };
      
      agenda[timeOfDay].push(item);
    });

    // TODO: Add cron jobs integration
    // TODO: Add agent activity integration

    const totalItems = agenda.morning.length + agenda.afternoon.length + agenda.evening.length;

    return NextResponse.json({
      date: dateStr,
      agenda,
      summary: {
        total: totalItems,
        morning: agenda.morning.length,
        afternoon: agenda.afternoon.length,
        evening: agenda.evening.length,
      },
    });
  } catch (error: any) {
    console.error('[CALENDAR_AGENDA_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch agenda' },
      { status: 500 }
    );
  }
}
