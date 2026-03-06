import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitNotification } from '@/lib/taskUtils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, author } = body;

    if (!content || !author) {
      return NextResponse.json(
        { error: 'content and author are required' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        author,
        taskId: id,
      },
    });

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

    // Notify task assignee (if commenter is different)
    if (author !== task.assignee) {
      emitNotification({
        type: 'task_commented',
        taskId: task.id,
        recipientId: task.assignee,
        message: `${author} commented on "${task.title}": ${content.substring(0, 100)}`,
        data: { comment, task },
      });
    }

    return NextResponse.json({ 
      success: true, 
      comment,
      task
    });
  } catch (error: any) {
    console.error('[COMMENT_TASK_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add comment' },
      { status: 500 }
    );
  }
}
