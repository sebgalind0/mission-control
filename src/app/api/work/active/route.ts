import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Sample data for when database is empty or unavailable
const getSampleData = () => {
  const now = new Date();
  return [
    {
      id: 'work-sample-1',
      agent: 'Neo',
      task: 'Implementing Phase 2 UX improvements for Mission Control Dashboard',
      status: 'running',
      progress: 75,
      metadata: {
        phase: 2,
        tasks: ['hover states', 'port fix', 'empty states', 'seed data'],
        completed: ['hover states', 'port fix', 'empty states'],
      },
      startedAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
    },
  ];
};

export async function GET(request: NextRequest) {
  try {
    // Fetch all active work items
    const activeWork = await prisma.activeWork.findMany({
      orderBy: { startedAt: 'desc' },
    });

    const taskFallback = activeWork.length === 0
      ? await prisma.task.findMany({
          where: {
            status: { in: ['IN_PROGRESS', 'REVIEW'] },
          },
          orderBy: [{ updatedAt: 'desc' }],
        })
      : [];

    const taskDerivedWork = taskFallback.map((task) => ({
      id: `task-${task.id}`,
      agent: task.assignee || 'Unassigned',
      task: task.title,
      status: task.status === 'REVIEW' ? 'paused' : 'running',
      progress: task.status === 'REVIEW' ? 90 : 50,
      metadata: {
        source: 'task',
        priority: task.priority,
        tag: task.tag,
      },
      startedAt: task.updatedAt.toISOString(),
    }));

    const workItems = activeWork.length > 0 ? activeWork : taskDerivedWork;
    
    // Separate running vs blocked tasks
    const running = workItems.filter((w: any) => w.status === 'running');
    const blocked = workItems.filter((w: any) => w.status === 'blocked');
    const paused = workItems.filter((w: any) => w.status === 'paused');
    
    return NextResponse.json({
      tasks: running,
      blocked,
      paused,
      summary: {
        total: workItems.length,
        running: running.length,
        blocked: blocked.length,
        paused: paused.length,
      },
    });
  } catch (error) {
    console.error('Active work fetch error:', error);
    // Return empty arrays on error (no sample data)
    return NextResponse.json({
      tasks: [],
      blocked: [],
      paused: [],
      summary: {
        total: 0,
        running: 0,
        blocked: 0,
        paused: 0,
      },
    });
  }
}

// POST endpoint to create/update active work
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent, task, status, progress, metadata } = body;
    
    if (!agent || !task) {
      return NextResponse.json(
        { error: 'agent and task are required' },
        { status: 400 }
      );
    }
    
    const work = await prisma.activeWork.create({
      data: {
        agent,
        task,
        status: status || 'running',
        progress: progress || 0,
        metadata: metadata || {},
      },
    });
    
    // Log as activity event
    await prisma.activityEvent.create({
      data: {
        agent,
        action: 'work_started',
        metadata: {
          task,
          workId: work.id,
        },
      },
    });
    
    return NextResponse.json(work);
  } catch (error) {
    console.error('Active work creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create active work' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update work progress/status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, progress, metadata } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }
    
    const work = await prisma.activeWork.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(progress !== undefined && { progress }),
        ...(metadata && { metadata }),
      },
    });
    
    return NextResponse.json(work);
  } catch (error) {
    console.error('Active work update error:', error);
    return NextResponse.json(
      { error: 'Failed to update active work' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to complete/remove work
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }
    
    const work = await prisma.activeWork.delete({
      where: { id },
    });
    
    // Log completion
    await prisma.activityEvent.create({
      data: {
        agent: work.agent,
        action: 'work_completed',
        metadata: {
          task: work.task,
          progress: work.progress,
        },
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Active work deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete active work' },
      { status: 500 }
    );
  }
}
