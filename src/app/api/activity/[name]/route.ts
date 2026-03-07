/**
 * Command Center Activity APIs
 * Unified handler for: /api/activity/{live|agents|commits|work}
 */

import { NextRequest, NextResponse } from 'next/server';
import { Status } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  getActiveAgents,
  getGitHubCommits,
  getLocalGitCommits,
  getRecentFileChanges,
  getRecentBuilds,
} from '@/lib/integrations';

// ============================================================================
// GET /api/activity/live
// ============================================================================
async function getLiveActivity() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Fetch all data in parallel
    const [
      commits,
      agents,
      taskChanges,
      fileChanges,
      builds,
    ] = await Promise.all([
      // Try GitHub API first, fallback to local git
      getGitHubCommits(50).catch(() => getLocalGitCommits(50)),
      
      getActiveAgents(),
      
      // Task status changes in last hour
      prisma.task.findMany({
        where: {
          updatedAt: {
            gte: oneHourAgo,
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      }),
      
      getRecentFileChanges(),
      
      getRecentBuilds(),
    ]);

    // Combine into unified activity stream
    const activities = [
      // Commits
      ...commits.map((c) => ({
        id: `commit-${c.sha}`,
        type: 'commit',
        timestamp: c.timestamp,
        message: c.message,
        author: c.author,
        data: c,
      })),

      // Active agents
      ...agents.map((a) => ({
        id: `agent-${a.sessionId}`,
        type: 'agent',
        timestamp: a.startTime,
        message: `${a.label} - ${a.status}`,
        author: 'OpenClaw',
        data: a,
      })),

      // Task changes
      ...taskChanges.map((t) => ({
        id: `task-${t.id}`,
        type: 'task',
        timestamp: t.updatedAt.toISOString(),
        message: `${t.title} → ${t.status}`,
        author: t.assignee || 'Unassigned',
        data: t,
      })),

      // File changes
      ...fileChanges.map((f) => ({
        id: `file-${f.path}`,
        type: 'file',
        timestamp: f.timestamp,
        message: `${f.status}: ${f.path}`,
        author: 'Git',
        data: f,
      })),

      // Builds
      ...builds.map((b) => ({
        id: b.id,
        type: 'build',
        timestamp: b.timestamp,
        message: b.message,
        author: 'CI/CD',
        data: b,
      })),
    ];

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      activities: activities.slice(0, 100), // Limit to 100 items
      counts: {
        commits: commits.length,
        agents: agents.length,
        taskChanges: taskChanges.length,
        fileChanges: fileChanges.length,
        builds: builds.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching live activity:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch activity stream',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/activity/agents
// ============================================================================
async function getAgents() {
  try {
    const agents = await getActiveAgents();

    // Add computed fields
    const enrichedAgents = agents.map((agent) => ({
      ...agent,
      runtimeFormatted: formatDuration(agent.runtimeMs),
      building: agent.task,
    }));

    return NextResponse.json({
      agents: enrichedAgents,
      totalActive: agents.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch active agents',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/activity/commits
// ============================================================================
async function getCommits(searchParams: URLSearchParams) {
  try {
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (limit > 100 || limit < 1) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Try GitHub API first, fallback to local git
    let commits;
    let source = 'github';

    try {
      commits = await getGitHubCommits(limit);
      if (commits.length === 0) throw new Error('No commits from GitHub');
    } catch {
      commits = await getLocalGitCommits(limit);
      source = 'local';
    }

    return NextResponse.json({
      commits,
      count: commits.length,
      source,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching commits:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch commits',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/activity/work
// ============================================================================
async function getWork() {
  try {
    // Get all IN_PROGRESS tasks
    const inProgressTasks = await prisma.task.findMany({
      where: {
        status: Status.IN_PROGRESS,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Enrich with time-in-progress
    const workItems = inProgressTasks.map((task) => {
      const timeInProgress = Date.now() - task.updatedAt.getTime();

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        assignee: task.assignee || 'Unassigned',
        priority: task.priority,
        deadline: task.deadline,
        timeInProgress: formatDuration(timeInProgress),
        timeInProgressMs: timeInProgress,
        startedAt: task.updatedAt.toISOString(),
        createdAt: task.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      workItems,
      totalActive: workItems.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching active work:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch active work items',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Route Handler
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const { searchParams } = new URL(request.url);

  switch (name) {
    case 'live':
      return getLiveActivity();
    case 'agents':
      return getAgents();
    case 'commits':
      return getCommits(searchParams);
    case 'work':
      return getWork();
    default:
      return NextResponse.json(
        { error: 'Invalid endpoint. Use: live, agents, commits, or work' },
        { status: 404 }
      );
  }
}

// ============================================================================
// Utilities
// ============================================================================
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}
