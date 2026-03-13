import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { getAgentMeta, loadActiveAgentIds } from '@/lib/openclawRoster';

export async function GET() {
  try {
    const homeDir = os.homedir();
    const activeAgentIds = await loadActiveAgentIds();
    const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Aggregate by agent and model
    const usage: Record<string, { agent: string; model: string; tokens: number; cost: number }> = {};

    for (const agentId of activeAgentIds) {
      const sessionsPath = path.join(homeDir, '.openclaw/agents', agentId, 'sessions', 'sessions.json');

      let sessions: Record<string, any>;
      try {
        const sessionsData = await fs.readFile(sessionsPath, 'utf-8');
        sessions = JSON.parse(sessionsData);
      } catch {
        continue;
      }

      for (const sessionData of Object.values(sessions)) {
        const data = sessionData as any;
        const updatedAt = new Date(data.updatedAt || 0).getTime();
        if (!Number.isFinite(updatedAt) || updatedAt < weekStart) continue;
        const agent = getAgentMeta(agentId).name;
        const rawModel = data.model || data.modelProvider || 'unknown';
        const model = formatModelName(rawModel);
        const tokens = (data.inputTokens || 0) + (data.outputTokens || 0);
        const cost = estimateCost(rawModel, data.inputTokens || 0, data.outputTokens || 0);

        const key = `${agent}-${model}`;
        if (!usage[key]) {
          usage[key] = { agent, model, tokens: 0, cost: 0 };
        }
        usage[key].tokens += tokens;
        usage[key].cost += cost;
      }
    }

    const modelUsage = Object.values(usage)
      .filter(u => u.tokens > 0) // Only show sessions with actual usage
      .map(u => ({
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

function formatModelName(rawModel: string): string {
  // Convert technical model IDs to friendly names
  const modelMap: Record<string, string> = {
    'claude-sonnet-4-5': 'Sonnet 4.5',
    'claude-sonnet-4': 'Sonnet 4',
    'claude-3-5-sonnet-20241022': 'Sonnet 3.5',
    'gpt-4': 'GPT-4',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-3.5-turbo': 'GPT-3.5',
  };
  
  return modelMap[rawModel] || rawModel;
}

function estimateCost(rawModel: string, inputTokens: number, outputTokens: number): number {
  if (rawModel.includes('claude-sonnet-4-5')) {
    return inputTokens * 0.000003 + outputTokens * 0.000015;
  }
  if (rawModel.includes('claude-opus-4-6')) {
    return inputTokens * 0.000015 + outputTokens * 0.000075;
  }
  return 0;
}
