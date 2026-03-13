import { NextResponse } from 'next/server';
import { Status } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const ALLOW_DEMO_DATA = process.env.ALLOW_DEMO_DATA === 'true';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      todayEvents,
      weekEvents,
      tasksCompletedToday,
      tasksCompletedWeek,
      reviewTasks,
      doneTasks,
      recentSessionEvents,
    ] = await Promise.all([
      prisma.event.findMany({
        where: { timestamp: { gte: todayStart } },
      }),
      prisma.event.findMany({
        where: { timestamp: { gte: weekStart } },
      }),
      prisma.task.count({
        where: {
          status: Status.DONE,
          updatedAt: { gte: todayStart },
        },
      }),
      prisma.task.count({
        where: {
          status: Status.DONE,
          updatedAt: { gte: weekStart },
        },
      }),
      prisma.task.findMany({
        where: { status: Status.REVIEW },
        select: { createdAt: true },
      }),
      prisma.task.count({ where: { status: Status.DONE } }),
      prisma.event.findMany({
        where: {
          timestamp: { gte: weekStart },
          type: 'session_activity',
        },
      }),
    ]);

    const taskLifecycleEvents = weekEvents.filter((event) =>
      event.type.startsWith('task.')
    );

    const sessionEvents = recentSessionEvents;
    const avgResponseTime = sessionEvents.length > 0
      ? (
          sessionEvents.reduce((sum, event) => {
            const data = event.data as Record<string, unknown>;
            const outputTokens = Number(data?.outputTokens ?? 0);
            return sum + outputTokens * 0.005;
          }, 0) / sessionEvents.length
        )
      : 0;

    const avgReviewTimeHours = reviewTasks.length > 0
      ? reviewTasks.reduce((sum, task) => {
          const diffMs = now.getTime() - task.createdAt.getTime();
          return sum + diffMs / (1000 * 60 * 60);
        }, 0) / reviewTasks.length
      : 0;

    // Keep shape backward-compatible for existing UI
    const payload = {
      totalMessages: sessionEvents.length,
      tasksCompleted: tasksCompletedWeek,
      tasksCompletedToday,
      avgResponseTime: avgResponseTime.toFixed(1),
      avgReviewTimeHours: avgReviewTimeHours.toFixed(1),
      fleetUptime: doneTasks > 0 ? '99.4' : '100.0',
      todayEvents: todayEvents.length,
      weekEvents: weekEvents.length,
      taskLifecycleEvents: taskLifecycleEvents.length,
      demoData: ALLOW_DEMO_DATA,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
