import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Total events
    const totalEvents = await prisma.activityEvent.count();
    
    // Events in last hour
    const eventsLastHour = await prisma.activityEvent.count({
      where: { timestamp: { gte: oneHourAgo } },
    });
    
    // Events in last 24 hours
    const eventsLast24h = await prisma.activityEvent.count({
      where: { timestamp: { gte: oneDayAgo } },
    });
    
    // Active agents (agents with activity in last hour)
    const activeAgentsData = await prisma.activityEvent.groupBy({
      by: ['agent'],
      where: { timestamp: { gte: oneHourAgo } },
      _count: { agent: true },
    });
    
    const activeAgents = activeAgentsData.length;
    
    // Get active work count from Task table
    const activeWorkCount = await prisma.task.count({
      where: { 
        status: { in: ['IN_PROGRESS', 'REVIEW'] },
      },
    });
    
    return NextResponse.json({
      totalEvents,
      eventsLastHour,
      eventsLast24h,
      activeAgents,
      activeWork: activeWorkCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Activity stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch activity stats',
        totalEvents: 0,
        eventsLastHour: 0,
        eventsLast24h: 0,
        activeAgents: 0,
        activeWork: 0,
      },
      { status: 500 }
    );
  }
}
