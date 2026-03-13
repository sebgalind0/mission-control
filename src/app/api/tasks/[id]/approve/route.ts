import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';
import { emitNotification } from '@/lib/taskUtils';
import { publishDomainEvent } from '@/lib/events/publisher';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { approvedBy } = body;

    if (!approvedBy) {
      return NextResponse.json(
        { error: 'approvedBy is required' },
        { status: 400 }
      );
    }

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        status: Status.DONE,
        approvedBy,
        approvedAt: new Date(),
        rejectedBy: null,
        rejectionReason: null,
        rejectedAt: null,
      },
      include: {
        comments: true,
      },
    });

    // Notify agent
    emitNotification({
      type: 'task_approved',
      taskId: task.id,
      recipientId: task.assignee,
      message: `Task "${task.title}" has been approved by ${approvedBy}`,
      data: { task },
    });

    await publishDomainEvent({
      type: 'task.approved',
      data: {
        taskId: task.id,
        title: task.title,
        assignee: task.assignee,
        status: task.status,
        previousStatus: existingTask.status,
        priority: task.priority,
        tag: task.tag,
        actor: approvedBy,
      },
    });

    await publishDomainEvent({
      type: 'task.status_changed',
      data: {
        taskId: task.id,
        title: task.title,
        assignee: task.assignee,
        status: task.status,
        previousStatus: existingTask.status,
        priority: task.priority,
        tag: task.tag,
        actor: approvedBy,
      },
    });

    await publishDomainEvent({
      type: 'task.completed',
      data: {
        taskId: task.id,
        title: task.title,
        assignee: task.assignee,
        status: task.status,
        previousStatus: existingTask.status,
        priority: task.priority,
        tag: task.tag,
        actor: approvedBy,
      },
    });

    return NextResponse.json({ 
      success: true, 
      task,
      message: 'Task approved and moved to Done'
    });
  } catch (error: unknown) {
    console.error('[APPROVE_TASK_ERROR]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to approve task' },
      { status: 500 }
    );
  }
}
