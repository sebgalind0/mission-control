import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Priority, Status } from '@prisma/client';
import { emitNotification, shouldRequireApproval } from '@/lib/taskUtils';

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
  } catch (error: any) {
    console.error('[GET_TASK_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get task' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      title,
      description,
      priority,
      status,
      assignee,
      tag,
      deadline,
      requiresApproval,
    } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) {
      updateData.description = description;
      // Re-evaluate approval requirements if description changed
      const needsApproval = shouldRequireApproval(description, requiresApproval);
      updateData.requiresApproval = needsApproval;
      
      // Auto-route to review if needs approval
      if (needsApproval && status === undefined) {
        updateData.status = Status.REVIEW;
      }
    }
    if (priority !== undefined) updateData.priority = priority as Priority;
    if (status !== undefined) updateData.status = status as Status;
    if (assignee !== undefined) updateData.assignee = assignee;
    if (tag !== undefined) updateData.tag = tag;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
    if (requiresApproval !== undefined) updateData.requiresApproval = requiresApproval;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        comments: true,
      },
    });

    // Notify if reassigned or status changed
    if (assignee !== undefined || status !== undefined) {
      emitNotification({
        type: 'task_updated',
        taskId: task.id,
        recipientId: task.assignee,
        message: assignee ? 
          `Task "${task.title}" has been reassigned to you` :
          `Task "${task.title}" status changed to ${task.status}`,
        data: { task },
      });
    }

    return NextResponse.json({ 
      success: true, 
      task
    });
  } catch (error: any) {
    console.error('[UPDATE_TASK_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Task deleted'
    });
  } catch (error: any) {
    console.error('[DELETE_TASK_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}
