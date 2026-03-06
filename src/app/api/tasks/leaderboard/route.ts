import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Get all unique assignees
    const allTasks = await prisma.task.findMany({
      select: {
        assignee: true,
        status: true,
        createdAt: true,
        approvedAt: true,
        rejectedAt: true,
      },
    });

    // Group by assignee
    const agentStats: Record<string, {
      assignee: string;
      totalTasks: number;
      completedTasks: number;
      tasksInReview: number;
      approvedTasks: number;
      rejectedTasks: number;
      completionRate: number;
      avgApprovalTimeHours: number;
      approvalCount: number;
    }> = {};

    allTasks.forEach(task => {
      if (!agentStats[task.assignee]) {
        agentStats[task.assignee] = {
          assignee: task.assignee,
          totalTasks: 0,
          completedTasks: 0,
          tasksInReview: 0,
          approvedTasks: 0,
          rejectedTasks: 0,
          completionRate: 0,
          avgApprovalTimeHours: 0,
          approvalCount: 0,
        };
      }

      const stats = agentStats[task.assignee];
      stats.totalTasks++;

      if (task.status === Status.DONE) {
        stats.completedTasks++;
      }

      if (task.status === Status.REVIEW) {
        stats.tasksInReview++;
      }

      if (task.approvedAt) {
        stats.approvedTasks++;
        const approvalTime = task.approvedAt.getTime() - task.createdAt.getTime();
        stats.avgApprovalTimeHours += approvalTime / (1000 * 60 * 60);
        stats.approvalCount++;
      }

      if (task.rejectedAt) {
        stats.rejectedTasks++;
      }
    });

    // Calculate rates and averages
    const leaderboard = Object.values(agentStats).map(stats => ({
      ...stats,
      completionRate: stats.totalTasks > 0
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
        : 0,
      avgApprovalTimeHours: stats.approvalCount > 0
        ? Math.round((stats.avgApprovalTimeHours / stats.approvalCount) * 10) / 10
        : 0,
    }));

    // Sort by completion rate (descending)
    leaderboard.sort((a, b) => {
      if (b.completionRate !== a.completionRate) {
        return b.completionRate - a.completionRate;
      }
      // Tie-breaker: faster approval time
      return a.avgApprovalTimeHours - b.avgApprovalTimeHours;
    });

    return NextResponse.json({
      leaderboard,
      topPerformer: leaderboard[0] || null,
    });
  } catch (error: any) {
    console.error('[LEADERBOARD_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get leaderboard' },
      { status: 500 }
    );
  }
}
