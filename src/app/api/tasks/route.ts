import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { Priority, Status } from '@prisma/client';
import { determineInitialStatus, emitNotification } from '@/lib/taskUtils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter');
    const assignee = searchParams.get('agent');
    const department = searchParams.get('dept');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};
    
    if (assignee) where.assignee = assignee;
    if (priority) where.priority = priority.toUpperCase() as Priority;
    if (status) where.status = status.toUpperCase().replace('-', '_') as Status;

    // Apply filters
    if (filter === 'review') {
      where.status = Status.REVIEW;
    } else if (filter === 'overdue') {
      where.deadline = {
        lt: new Date(),
      };
      where.status = {
        notIn: [Status.DONE],
      };
    }

    // Department filtering (assuming agent names map to departments)
    // This would be enhanced with proper agent-to-dept mapping
    if (department) {
      // Placeholder: you'd map department to agent IDs
      where.assignee = {
        in: [], // Add agent IDs for department
      };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ tasks, count: tasks.length });
  } catch (error: any) {
    console.error('[GET_TASKS_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      priority = 'MEDIUM',
      assignee,
      tag,
      deadline,
      requiresApproval,
    } = body;

    if (!title || !description || !assignee) {
      return NextResponse.json(
        { error: 'title, description, and assignee are required' },
        { status: 400 }
      );
    }

    // Auto-routing logic
    const initialStatus = determineInitialStatus(description, requiresApproval);
    const needsApproval = requiresApproval ?? initialStatus === Status.REVIEW;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority as Priority,
        status: initialStatus,
        assignee,
        tag,
        deadline: deadline ? new Date(deadline) : null,
        requiresApproval: needsApproval,
      },
      include: {
        comments: true,
      },
    });

    // Notify assignee
    emitNotification({
      type: task.requiresApproval ? 'task_review' : 'task_updated',
      taskId: task.id,
      recipientId: assignee,
      message: task.requiresApproval ?
        `New task "${title}" needs your review before execution` :
        `New task "${title}" assigned to you`,
      data: { task },
    });

    // If auto-routed to review, notify Seb
    if (task.requiresApproval) {
      emitNotification({
        type: 'task_review',
        taskId: task.id,
        recipientId: 'seb', // Hardcoded for now
        message: `Task "${title}" requires approval from ${assignee}`,
        data: { task },
      });
    }

    return NextResponse.json({ 
      success: true, 
      task,
      message: task.requiresApproval ? 
        'Task created and routed to Review' : 
        'Task created successfully'
    });
  } catch (error: any) {
    console.error('[CREATE_TASK_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}
