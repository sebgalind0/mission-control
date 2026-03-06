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
    const { approvedBy } = body;

    if (!approvedBy) {
      return NextResponse.json(
        { error: 'approvedBy is required' },
        { status: 400 }
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

    return NextResponse.json({ 
      success: true, 
      task,
      message: 'Task approved and moved to Done'
    });
  } catch (error: any) {
    console.error('[APPROVE_TASK_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve task' },
      { status: 500 }
    );
  }
}
