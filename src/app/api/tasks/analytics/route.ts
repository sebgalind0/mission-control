import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const dayAgo = new Date(now);
    dayAgo.setHours(dayAgo.getHours() - 24);

    // Tasks created today
    const tasksToday = await prisma.task.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    // Tasks created this week
    const tasksThisWeek = await prisma.task.count({
      where: {
        createdAt: {
          gte: weekAgo,
        },
      },
    });

    // Total tasks
    const totalTasks = await prisma.task.count();

    // Completed tasks
    const completedTasks = await prisma.task.count({
      where: {
        status: Status.DONE,
      },
    });

    // Completion percentage
    const completionPercentage = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    // Tasks in review
    const tasksInReview = await prisma.task.findMany({
      where: {
        status: Status.REVIEW,
      },
      select: {
        id: true,
        title: true,
        assignee: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Average time in review (for approved/rejected tasks)
    const reviewedTasks = await prisma.task.findMany({
      where: {
        OR: [
          { approvedAt: { not: null } },
          { rejectedAt: { not: null } },
        ],
        requiresApproval: true,
      },
      select: {
        createdAt: true,
        approvedAt: true,
        rejectedAt: true,
      },
    });

    let totalReviewTimeMs = 0;
    let reviewedCount = 0;

    reviewedTasks.forEach(task => {
      const reviewEndTime = task.approvedAt || task.rejectedAt;
      if (reviewEndTime) {
        totalReviewTimeMs += reviewEndTime.getTime() - task.createdAt.getTime();
        reviewedCount++;
      }
    });

    const avgReviewTimeHours = reviewedCount > 0
      ? Math.round((totalReviewTimeMs / reviewedCount) / (1000 * 60 * 60) * 10) / 10
      : 0;

    // Blocked tasks (>24hrs in any non-Done status)
    const blockedTasks = await prisma.task.findMany({
      where: {
        updatedAt: {
          lt: dayAgo,
        },
        status: {
          not: Status.DONE,
        },
      },
      select: {
        id: true,
        title: true,
        assignee: true,
        status: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });

    return NextResponse.json({
      tasksToday,
      tasksThisWeek,
      totalTasks,
      completedTasks,
      completionPercentage,
      avgReviewTimeHours,
      tasksInReview,
      blockedTasks: blockedTasks.map(task => ({
        ...task,
        blockedForHours: Math.round((now.getTime() - task.updatedAt.getTime()) / (1000 * 60 * 60)),
      })),
    });
  } catch (error: any) {
    console.error('[ANALYTICS_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get analytics' },
      { status: 500 }
    );
  }
}
