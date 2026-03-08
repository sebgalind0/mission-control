import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all session events from last 7 days
    const events = await prisma.event.findMany({
      where: {
        timestamp: { gte: weekStart },
        type: 'session_activity',
      },
    });

    // Aggregate by agent and model
    const usage: Record<string, { agent: string; model: string; tokens: number; cost: number }> = {};

    events.forEach((event: any) => {
      const data = event.data as any;
      const sessionKey = event.sessionKey as string || 'unknown';
      const agent = extractAgentName(sessionKey);
      const model = data.model || 'unknown';
      const tokens = (data.inputTokens || 0) + (data.outputTokens || 0);
      
      // Rough cost estimate (Claude Sonnet 4.5: $3/M input, $15/M output)
      const cost = ((data.inputTokens || 0) * 0.000003) + ((data.outputTokens || 0) * 0.000015);

      const key = `${agent}-${model}`;
      if (!usage[key]) {
        usage[key] = { agent, model, tokens: 0, cost: 0 };
      }
      usage[key].tokens += tokens;
      usage[key].cost += cost;
    });

    const modelUsage = Object.values(usage).map(u => ({
      agent: u.agent,
      model: u.model,
      tokensUsed: u.tokens,
      cost: parseFloat(u.cost.toFixed(4)),
    }));

    return NextResponse.json({ modelUsage });
  } catch (error) {
    console.error('Model usage API error:', error);
    return NextResponse.json({ modelUsage: [] });
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
