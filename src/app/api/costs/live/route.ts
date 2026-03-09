import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCost } from '@/config/model-pricing';

interface AgentCost {
  agent: string;
  totalCost: number;
  calls: number;
  tokens: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
  };
}

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hourStart = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Get all session_activity events from today
    const todayEvents = await prisma.event.findMany({
      where: {
        type: 'session_activity',
        timestamp: { gte: todayStart },
      },
      orderBy: { timestamp: 'desc' },
    });
    
    // Get events from last hour
    const hourEvents = todayEvents.filter(
      e => new Date(e.timestamp).getTime() >= hourStart.getTime()
    );
    
    // Calculate costs by agent
    const agentCosts = new Map<string, AgentCost>();
    
    for (const event of todayEvents) {
      const data = event.data as any;
      const agent = extractAgentName(event.sessionKey || '');
      const model = data.model || 'claude-sonnet-4-5';
      
      const cost = calculateCost(model, {
        input: data.inputTokens || 0,
        output: data.outputTokens || 0,
        cacheRead: data.cacheRead || 0,
        cacheWrite: data.cacheWrite || 0,
      });
      
      if (!agentCosts.has(agent)) {
        agentCosts.set(agent, {
          agent,
          totalCost: 0,
          calls: 0,
          tokens: {
            input: 0,
            output: 0,
            cacheRead: 0,
            cacheWrite: 0,
          },
        });
      }
      
      const agentData = agentCosts.get(agent)!;
      agentData.totalCost += cost;
      agentData.calls++;
      agentData.tokens.input += data.inputTokens || 0;
      agentData.tokens.output += data.outputTokens || 0;
      agentData.tokens.cacheRead += data.cacheRead || 0;
      agentData.tokens.cacheWrite += data.cacheWrite || 0;
    }
    
    // Calculate hourly cost
    let hourlyCost = 0;
    for (const event of hourEvents) {
      const data = event.data as any;
      const model = data.model || 'claude-sonnet-4-5';
      hourlyCost += calculateCost(model, {
        input: data.inputTokens || 0,
        output: data.outputTokens || 0,
        cacheRead: data.cacheRead || 0,
        cacheWrite: data.cacheWrite || 0,
      });
    }
    
    // Get last event cost
    let lastCallCost = 0;
    if (todayEvents.length > 0) {
      const lastEvent = todayEvents[0];
      const data = lastEvent.data as any;
      const model = data.model || 'claude-sonnet-4-5';
      lastCallCost = calculateCost(model, {
        input: data.inputTokens || 0,
        output: data.outputTokens || 0,
        cacheRead: data.cacheRead || 0,
        cacheWrite: data.cacheWrite || 0,
      });
    }
    
    // Calculate total
    const totalCost = Array.from(agentCosts.values()).reduce(
      (sum, a) => sum + a.totalCost,
      0
    );
    
    // Sort agents by cost (descending)
    const agents = Array.from(agentCosts.values()).sort(
      (a, b) => b.totalCost - a.totalCost
    );
    
    return NextResponse.json({
      totalCost,
      hourlyCost,
      lastCallCost,
      agents,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Live costs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live costs' },
      { status: 500 }
    );
  }
}

function extractAgentName(sessionKey: string): string {
  const match = sessionKey.match(/agent:([^:]+)/);
  if (match) {
    const name = match[1];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return 'Unknown';
}
