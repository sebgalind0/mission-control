import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function formatICSDate(date: Date): string {
  // Format: YYYYMMDDTHHMMSSZ
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function generateICS(tasks: any[]): string {
  const now = new Date();
  
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mission Control//Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Mission Control Tasks',
    'X-WR-TIMEZONE:America/New_York',
  ];

  tasks.forEach(task => {
    if (!task.deadline) return;
    
    const status = task.status === Status.DONE ? 'COMPLETED' :
                   task.status === Status.REVIEW ? 'TENTATIVE' :
                   'CONFIRMED';
    
    ics.push(
      'BEGIN:VEVENT',
      `UID:${task.id}@mission-control`,
      `DTSTAMP:${formatICSDate(now)}`,
      `DTSTART:${formatICSDate(task.deadline)}`,
      `DTEND:${formatICSDate(task.deadline)}`,
      `SUMMARY:${escapeICS(task.title)}`,
      `DESCRIPTION:${escapeICS(task.description)}`,
      `STATUS:${status}`,
      `PRIORITY:${task.priority === 'HIGH' ? '1' : task.priority === 'MEDIUM' ? '5' : '9'}`,
      `ORGANIZER;CN=${escapeICS(task.assignee)}:noreply@mission-control.app`,
      `CREATED:${formatICSDate(task.createdAt)}`,
      `LAST-MODIFIED:${formatICSDate(task.updatedAt)}`,
    );
    
    if (task.tag) {
      ics.push(`CATEGORIES:${escapeICS(task.tag)}`);
    }
    
    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');
  
  return ics.join('\r\n');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    const format = searchParams.get('format') || 'ics';

    if (format !== 'ics') {
      return NextResponse.json(
        { error: 'Only ICS format is supported' },
        { status: 400 }
      );
    }

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

    // Fetch tasks for the day (or month if no specific date)
    let queryEndDate = endOfDay;
    if (!dateParam) {
      const nextMonth = new Date(startOfDay);
      nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
      queryEndDate = nextMonth;
    }
    
    const tasks = await prisma.task.findMany({
      where: {
        deadline: {
          gte: startOfDay,
          lte: queryEndDate,
        },
      },
      orderBy: { deadline: 'asc' },
    });

    // Generate ICS file
    const icsContent = generateICS(tasks);
    const filename = dateParam 
      ? `mission-control-${dateParam}.ics`
      : `mission-control-${startOfDay.toISOString().split('T')[0]}.ics`;

    // Return as downloadable file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('[CALENDAR_EXPORT_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export calendar' },
      { status: 500 }
    );
  }
}
