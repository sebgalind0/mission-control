import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';
import { emitNotification } from '@/lib/taskUtils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rejectedBy, rejectionReason } = body;

    if (!rejectedBy) {
      return NextResponse.json(
        { error: 'rejectedBy is required' },
        { status: 400 }
      );
    }

    if (!rejectionReason) {
      return NextResponse.json(
        { error: 'rejectionReason is required' },
        { status: 400 }
      );
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        status: Status.IN_PROGRESS,
        rejectedBy,
        rejectionReason,
        rejectedAt: new Date(),
        approvedBy: null,
        approvedAt: null,
      },
      include: {
        comments: true,
      },
    });

    // Notify agent
    emitNotification({
      type: 'task_rejected',
      taskId: task.id,
      recipientId: task.assignee,
      message: `Task "${task.title}" needs revision: ${rejectionReason}`,
      data: { task },
    });

    return NextResponse.json({ 
      success: true, 
      task,
      message: 'Task rejected and moved to In Progress'
    });
  } catch (error: any) {
    console.error('[REJECT_TASK_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reject task' },
      { status: 500 }
    );
  }
}
