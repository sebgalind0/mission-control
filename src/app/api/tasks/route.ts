import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { Priority, Status } from '@prisma/client';
import { determineInitialStatus, emitNotification } from '@/lib/taskUtils';
import { publishDomainEvent } from '@/lib/events/publisher';

const AGENT_DEPARTMENTS: Record<string, string> = {
  main: 'Leadership',
  larry: 'Engineering',
  neo: 'Engineering',
  bolt: 'Engineering',
  caesar: 'Marketing',
  elon: 'Marketing',
  vegeta: 'Marketing',
  achilles: 'Operations',
  olivia: 'Operations',
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter');
    const assignee = searchParams.get('agent');
    const department = searchParams.get('dept');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');

    // Build where clause
    const where: Record<string, unknown> = {};
    
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
      const agentIds = Object.entries(AGENT_DEPARTMENTS)
        .filter(([, dept]) => dept === department)
        .map(([id]) => id);
      if (agentIds.length > 0) {
        where.assignee = {
          in: agentIds,
        };
      }
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

    const tasksWithDepartment = tasks.map((task) => ({
      ...task,
      department: AGENT_DEPARTMENTS[task.assignee] ?? null,
    }));

    return NextResponse.json({ tasks: tasksWithDepartment, count: tasksWithDepartment.length });
  } catch (error: unknown) {
    console.error('[GET_TASKS_ERROR]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get tasks' },
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

      await publishDomainEvent({
        type: 'task.review_requested',
        data: {
          taskId: task.id,
          title: task.title,
          assignee: task.assignee,
          status: task.status,
          priority: task.priority,
          tag: task.tag,
          requiresApproval: task.requiresApproval,
        },
      });
    }

    await publishDomainEvent({
      type: 'task.created',
      data: {
        taskId: task.id,
        title: task.title,
        assignee: task.assignee,
        status: task.status,
        priority: task.priority,
        tag: task.tag,
        requiresApproval: task.requiresApproval,
      },
    });

    if (task.status === Status.DONE) {
      await publishDomainEvent({
        type: 'task.completed',
        data: {
          taskId: task.id,
          title: task.title,
          assignee: task.assignee,
          status: task.status,
          priority: task.priority,
          tag: task.tag,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      task,
      message: task.requiresApproval ? 
        'Task created and routed to Review' : 
        'Task created successfully'
    });
  } catch (error: unknown) {
    console.error('[CREATE_TASK_ERROR]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create task' },
      { status: 500 }
    );
  }
}
