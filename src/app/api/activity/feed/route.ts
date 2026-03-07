import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const since = searchParams.get('since');
    
    const where = since 
      ? { timestamp: { gt: new Date(since) } }
      : {};
    
    const activities = await prisma.activityEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    
    return NextResponse.json({
      events: activities,
      count: activities.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity feed', events: [], count: 0 },
      { status: 500 }
    );
  }
}
