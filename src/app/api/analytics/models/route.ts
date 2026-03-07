import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/analytics/models
 * Returns which agents use which models, token usage, and costs
 */
export async function GET(request: NextRequest) {
  try {
    // Get all tasks and activity events with metadata
    const tasks = await prisma.task.findMany({
      select: {
        assignee: true,
        createdAt: true,
      },
    });

    // Try to get activity events, gracefully handle if table doesn't exist yet
    let activities: any[] = [];
    try {
      activities = await prisma.activityEvent.findMany({
        select: {
          agent: true,
          metadata: true,
          timestamp: true,
        },
      });
    } catch (error: any) {
      console.warn('[ANALYTICS_MODELS] ActivityEvent table not available yet:', error.message);
    }

    // Aggregate model usage by agent
    // In a production system, this would come from actual model usage logs
    // For now, we'll extract from metadata where available and provide structure
    const modelUsageMap = new Map<string, {
      agent: string;
      model: string;
      tokensUsed: number;
      cost: number;
    }>();

    // Process activity metadata for model usage
    activities.forEach(activity => {
      const metadata = activity.metadata as any;
      if (metadata?.model) {
        const key = `${activity.agent}-${metadata.model}`;
        const existing = modelUsageMap.get(key);
        
        const tokens = metadata.tokensUsed || metadata.tokens || 0;
        const cost = metadata.cost || (tokens * 0.00001); // Rough estimate: $0.01 per 1K tokens
        
        if (existing) {
          existing.tokensUsed += tokens;
          existing.cost += cost;
        } else {
          modelUsageMap.set(key, {
            agent: activity.agent,
            model: metadata.model,
            tokensUsed: tokens,
            cost: cost,
          });
        }
      }
    });

    // Get unique agents from tasks
    const agentCounts = new Map<string, number>();
    tasks.forEach(task => {
      agentCounts.set(task.assignee, (agentCounts.get(task.assignee) || 0) + 1);
    });

    // Add default model assignments for agents without metadata
    // This provides structure even without tracking data
    const defaultModels: Record<string, string> = {
      'rick': 'anthropic/claude-sonnet-4-5',
      'larry': 'anthropic/claude-sonnet-4-5',
      'bolt': 'anthropic/claude-sonnet-4-5',
      'fuse': 'anthropic/claude-sonnet-4-5',
      'pixel': 'anthropic/claude-sonnet-4-5',
    };

    agentCounts.forEach((count, agent) => {
      const key = `${agent}-${defaultModels[agent] || 'anthropic/claude-sonnet-4-5'}`;
      if (!modelUsageMap.has(key)) {
        // Estimate: ~500 tokens per task, $0.005 per task
        modelUsageMap.set(key, {
          agent,
          model: defaultModels[agent] || 'anthropic/claude-sonnet-4-5',
          tokensUsed: count * 500,
          cost: count * 0.005,
        });
      }
    });

    const modelUsage = Array.from(modelUsageMap.values())
      .sort((a, b) => b.cost - a.cost);

    // Calculate totals
    const totalTokens = modelUsage.reduce((sum, item) => sum + item.tokensUsed, 0);
    const totalCost = modelUsage.reduce((sum, item) => sum + item.cost, 0);

    return NextResponse.json({
      modelUsage,
      summary: {
        totalTokens,
        totalCost: Math.round(totalCost * 100) / 100,
        uniqueModels: new Set(modelUsage.map(m => m.model)).size,
        uniqueAgents: new Set(modelUsage.map(m => m.agent)).size,
      },
    });
  } catch (error: any) {
    console.error('[ANALYTICS_MODELS_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get model analytics' },
      { status: 500 }
    );
  }
}
