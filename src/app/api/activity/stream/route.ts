import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    
    // Build query with optional timestamp filter
    const where = since 
      ? { timestamp: { gt: new Date(since) } }
      : {};
    
    const activities = await prisma.activityEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100, // Limit to last 100 events
    });
    
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Activity stream error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity stream' },
      { status: 500 }
    );
  }
}

// POST endpoint to add new activity events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent, action, metadata } = body;
    
    if (!agent || !action) {
      return NextResponse.json(
        { error: 'agent and action are required' },
        { status: 400 }
      );
    }
    
    const activity = await prisma.activityEvent.create({
      data: {
        agent,
        action,
        metadata: metadata || {},
      },
    });
    
    return NextResponse.json(activity);
  } catch (error) {
    console.error('Activity creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create activity event' },
      { status: 500 }
    );
  }
}
