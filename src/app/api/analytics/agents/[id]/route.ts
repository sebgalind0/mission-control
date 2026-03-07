import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/analytics/agents/:id
 * Detailed agent performance metrics
 * Returns: { completionRate, avgTaskTime, tokensUsed, cost }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    // Get all tasks for this agent
    const allTasks = await prisma.task.findMany({
      where: {
        assignee: agentId,
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        deadline: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate completion metrics
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === Status.DONE).length;
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    // Calculate average task time (for completed tasks)
    const completedTasksWithTime = allTasks.filter(t => t.status === Status.DONE);
    let totalTimeMs = 0;
    
    completedTasksWithTime.forEach(task => {
      totalTimeMs += task.updatedAt.getTime() - task.createdAt.getTime();
    });

    const avgTaskTimeHours = completedTasksWithTime.length > 0
      ? Math.round((totalTimeMs / completedTasksWithTime.length) / (1000 * 60 * 60) * 10) / 10
      : 0;

    // Try to get activity events, gracefully handle if table doesn't exist yet
    let activities: any[] = [];
    try {
      activities = await prisma.activityEvent.findMany({
        where: {
          agent: agentId,
        },
        select: {
          action: true,
          metadata: true,
          timestamp: true,
        },
      });
    } catch (error: any) {
      console.warn('[ANALYTICS_AGENT] ActivityEvent table not available yet:', error.message);
    }

    // Calculate token usage and cost from metadata
    let tokensUsed = 0;
    let cost = 0;

    activities.forEach(activity => {
      const metadata = activity.metadata as any;
      if (metadata?.tokens || metadata?.tokensUsed) {
        const tokens = metadata.tokens || metadata.tokensUsed || 0;
        tokensUsed += tokens;
        cost += metadata.cost || (tokens * 0.00001); // Estimate if no cost in metadata
      }
    });

    // If no metadata, estimate based on task count
    if (tokensUsed === 0 && totalTasks > 0) {
      tokensUsed = totalTasks * 500; // ~500 tokens per task estimate
      cost = totalTasks * 0.005; // ~$0.005 per task
    }

    // Try to get active work, gracefully handle if table doesn't exist yet
    let activeWork: any[] = [];
    try {
      activeWork = await prisma.activeWork.findMany({
        where: {
          agent: agentId,
          status: 'running',
        },
        select: {
          task: true,
          progress: true,
          startedAt: true,
        },
      });
    } catch (error: any) {
      console.warn('[ANALYTICS_AGENT] ActiveWork table not available yet:', error.message);
    }

    // Calculate status breakdown
    const statusBreakdown = {
      backlog: allTasks.filter(t => t.status === Status.BACKLOG).length,
      inProgress: allTasks.filter(t => t.status === Status.IN_PROGRESS).length,
      review: allTasks.filter(t => t.status === Status.REVIEW).length,
      done: completedTasks,
    };

    // Calculate recent performance (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentTasks = allTasks.filter(t => t.createdAt >= weekAgo);
    const recentCompleted = recentTasks.filter(t => t.status === Status.DONE).length;
    const recentCompletionRate = recentTasks.length > 0
      ? Math.round((recentCompleted / recentTasks.length) * 100)
      : 0;

    // Deadline performance
    const tasksWithDeadlines = allTasks.filter(t => t.deadline !== null);
    const onTimeCompletions = tasksWithDeadlines.filter(t => 
      t.status === Status.DONE && 
      t.deadline && 
      t.updatedAt <= t.deadline
    ).length;
    const deadlinePerformance = tasksWithDeadlines.length > 0
      ? Math.round((onTimeCompletions / tasksWithDeadlines.length) * 100)
      : 0;

    return NextResponse.json({
      agent: agentId,
      performance: {
        completionRate,
        avgTaskTimeHours,
        tokensUsed,
        cost: Math.round(cost * 100) / 100,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        active: activeWork.length,
        statusBreakdown,
      },
      recentPerformance: {
        tasksThisWeek: recentTasks.length,
        completedThisWeek: recentCompleted,
        completionRateThisWeek: recentCompletionRate,
      },
      deadlines: {
        totalWithDeadlines: tasksWithDeadlines.length,
        onTime: onTimeCompletions,
        onTimeRate: deadlinePerformance,
      },
      activeWork: activeWork.map(work => ({
        task: work.task,
        progress: work.progress,
        duration: Math.round((Date.now() - work.startedAt.getTime()) / (1000 * 60)), // minutes
      })),
    });
  } catch (error: any) {
    console.error('[ANALYTICS_AGENT_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get agent analytics' },
      { status: 500 }
    );
  }
}
