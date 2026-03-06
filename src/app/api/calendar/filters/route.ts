import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';

interface FiltersResponse {
  agents: Array<{ id: string; name: string; department: string | null }>;
  departments: string[];
  projects: string[];
  cached: boolean;
  cacheExpiry: string;
}

// In-memory cache (5 min TTL)
let cachedFilters: FiltersResponse | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Agent to department mapping (expand as needed)
const AGENT_DEPARTMENTS: Record<string, string> = {
  'rick': 'Executive',
  'larry': 'Engineering',
  'fuse': 'Engineering',
  'bolt': 'Engineering',
  'lumen': 'Engineering',
  'eva': 'Operations',
  'nova': 'Operations',
  'ada': 'Analytics',
  'sage': 'Strategy',
};

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true';
    
    // Check cache
    if (!forceRefresh && cachedFilters && (now - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json({
        ...cachedFilters,
        cached: true,
      });
    }

    // Fetch unique agents from tasks
    const tasks = await prisma.task.findMany({
      select: {
        assignee: true,
        tag: true,
      },
    });

    // Extract unique agents
    const uniqueAgents = Array.from(new Set(tasks.map(t => t.assignee)))
      .filter(Boolean)
      .sort();

    // Map agents to departments
    const agents = uniqueAgents.map(agentId => ({
      id: agentId,
      name: agentId.charAt(0).toUpperCase() + agentId.slice(1),
      department: AGENT_DEPARTMENTS[agentId.toLowerCase()] || null,
    }));

    // Extract unique departments
    const departments = Array.from(
      new Set(agents.map(a => a.department).filter(Boolean) as string[])
    ).sort();

    // Extract unique projects (from tags)
    const projects = Array.from(
      new Set(tasks.map(t => t.tag).filter(Boolean) as string[])
    ).sort();

    // Cache the result
    const cacheExpiry = new Date(now + CACHE_TTL).toISOString();
    cachedFilters = {
      agents,
      departments,
      projects,
      cached: false,
      cacheExpiry,
    };
    cacheTimestamp = now;

    return NextResponse.json(cachedFilters);
  } catch (error: any) {
    console.error('[CALENDAR_FILTERS_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}
