import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Sample data for when database is empty or unavailable
const getSampleData = () => {
  const now = new Date();
  return [
    {
      id: 'sample-1',
      agent: 'Neo',
      action: 'Implementing Phase 2 UX improvements',
      metadata: { phase: 2, progress: '65%' },
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'sample-2',
      agent: 'Bolt',
      action: 'Optimized API response times',
      metadata: { improvement: '40%', target: 'sub-100ms' },
      timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'sample-3',
      agent: 'Larry',
      action: 'Code review completed',
      metadata: { files: 3, status: 'approved' },
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    },
  ];
};

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
    
    // If no activities found, return sample data
    const events = activities.length > 0 ? activities : getSampleData();
    
    return NextResponse.json({
      events,
      count: events.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    // Return sample data on error
    const sampleData = getSampleData();
    return NextResponse.json({
      events: sampleData,
      count: sampleData.length,
      timestamp: new Date().toISOString(),
    });
  }
}
