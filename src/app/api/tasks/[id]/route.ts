import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';
import { publishDomainEvent } from '@/lib/events/publisher';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, priority, status, tag, deadline, requiresApproval } = body;

    // Get current task to compare status
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (tag !== undefined) updateData.tag = tag;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
    if (requiresApproval !== undefined) updateData.requiresApproval = requiresApproval;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        comments: true,
      },
    });

    const previousStatus = existingTask.status;
    const newStatus = updatedTask.status;

    // Emit status change event if status changed
    if (previousStatus !== newStatus) {
      await publishDomainEvent({
        type: 'task.status_changed',
        data: {
          taskId: updatedTask.id,
          title: updatedTask.title,
          assignee: updatedTask.assignee,
          status: newStatus,
          previousStatus: previousStatus,
          priority: updatedTask.priority,
          tag: updatedTask.tag,
          actor: 'system',
        },
      });

      // Emit completion event if task was completed
      if (newStatus === Status.DONE) {
        await publishDomainEvent({
          type: 'task.completed',
          data: {
            taskId: updatedTask.id,
            title: updatedTask.title,
            assignee: updatedTask.assignee,
            status: newStatus,
            priority: updatedTask.priority,
            tag: updatedTask.tag,
          },
        });
      }

      // Emit approval/rejection events if applicable
      if (newStatus === Status.REVIEW && previousStatus !== Status.REVIEW) {
        await publishDomainEvent({
          type: 'task.review_requested',
          data: {
            taskId: updatedTask.id,
            title: updatedTask.title,
            assignee: updatedTask.assignee,
            status: newStatus,
            priority: updatedTask.priority,
            tag: updatedTask.tag,
            reason: 'Status changed to review',
          },
        });
      }

      if (newStatus === Status.IN_PROGRESS && previousStatus === Status.REVIEW) {
        await publishDomainEvent({
          type: 'task.approved',
          data: {
            taskId: updatedTask.id,
            title: updatedTask.title,
            assignee: updatedTask.assignee,
            status: newStatus,
            priority: updatedTask.priority,
            tag: updatedTask.tag,
            actor: 'system',
          },
        });
      }

      if (newStatus === Status.REVIEW && previousStatus === Status.IN_PROGRESS && !updatedTask.requiresApproval) {
        await publishDomainEvent({
          type: 'task.rejected',
          data: {
            taskId: updatedTask.id,
            title: updatedTask.title,
            assignee: updatedTask.assignee,
            status: newStatus,
            priority: updatedTask.priority,
            tag: updatedTask.tag,
            reason: 'Self-submitted for review',
          },
        });
      }
    }

    // Emit generic updated event for any change
    await publishDomainEvent({
      type: 'task.updated',
      data: {
        taskId: updatedTask.id,
        title: updatedTask.title,
        assignee: updatedTask.assignee,
        status: newStatus,
        priority: updatedTask.priority,
        tag: updatedTask.tag,
        actor: 'system',
        metadata: {
          fieldsChanged: Object.keys(updateData),
        },
      },
    });

    return NextResponse.json({
      success: true,
      task: updatedTask,
      eventsEmitted: previousStatus !== newStatus,
    });
  } catch (error: unknown) {
    console.error('[UPDATE_TASK_ERROR]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update task' },
      { status: 500 }
    );
  }
}

// GET single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ task });
  } catch (error: unknown) {
    console.error('[GET_TASK_ERROR]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get task' },
      { status: 500 }
    );
  }
}

// DELETE task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.task.delete({
      where: { id },
    });

    await publishDomainEvent({
      type: 'task.updated',
      data: {
        taskId: task.id,
        title: task.title,
        assignee: task.assignee,
        status: task.status,
        priority: task.priority,
        tag: task.tag,
        actor: 'system',
        metadata: { action: 'deleted' },
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: unknown) {
    console.error('[DELETE_TASK_ERROR]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete task' },
      { status: 500 }
    );
  }
}
