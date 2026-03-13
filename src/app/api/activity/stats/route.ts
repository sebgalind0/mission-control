import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { loadActiveAgentIds } from '@/lib/openclawRoster';

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
    
    const activeAgentIds = await loadActiveAgentIds();
    const recentlyActiveAgents = await countRecentlyActiveAgents(activeAgentIds);
    
    // Get active work count from Task table
    const activeWorkItems = await prisma.task.findMany({
      where: { 
        status: { in: ['IN_PROGRESS', 'REVIEW'] },
      },
      select: {
        assignee: true,
      },
    });
    const activeWorkCount = activeWorkItems.length;
    const activeWorkAgents = new Set(
      activeWorkItems
        .map((task) => task.assignee)
        .filter((assignee): assignee is string => typeof assignee === 'string' && assignee.length > 0)
    ).size;
    const activeAgents = Math.max(recentlyActiveAgents, activeWorkAgents);
    
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

async function countRecentlyActiveAgents(agentIds: string[]) {
  const now = Date.now();
  const fiveMinutesAgo = now - (5 * 60 * 1000);
  const agentsRoot = path.join(os.homedir(), '.openclaw', 'agents');
  let active = 0;

  for (const agentId of agentIds) {
    const sessionsPath = path.join(agentsRoot, agentId, 'sessions', 'sessions.json');
    try {
      const raw = await fs.readFile(sessionsPath, 'utf-8');
      const sessions = JSON.parse(raw) as Record<string, any>;
      const latest = Object.values(sessions)
        .map((session) => new Date((session as any).updatedAt).getTime())
        .filter((value) => Number.isFinite(value))
        .sort((a, b) => b - a)[0];

      if (latest && latest >= fiveMinutesAgo) {
        active += 1;
      }
    } catch {
      continue;
    }
  }

  return active;
}
