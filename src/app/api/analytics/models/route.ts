import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export async function GET() {
  try {
    const homeDir = os.homedir();
    const sessionsPath = path.join(homeDir, '.openclaw/agents/larry/sessions/sessions.json');
    
    // Read OpenClaw sessions file to get accurate model info
    const sessionsData = await fs.readFile(sessionsPath, 'utf-8');
    const sessions = JSON.parse(sessionsData);
    
    // Aggregate by agent and model
    const usage: Record<string, { agent: string; model: string; tokens: number; cost: number }> = {};

    for (const [sessionKey, sessionData] of Object.entries(sessions)) {
      const data = sessionData as any;
      
      // Extract agent name
      const agent = extractAgentName(sessionKey);
      
      // Get model - prefer friendly name over raw model ID
      const rawModel = data.model || data.modelProvider || 'unknown';
      const model = formatModelName(rawModel);
      
      // Get token usage
      const tokens = (data.inputTokens || 0) + (data.outputTokens || 0);
      
      // Calculate cost (Claude Sonnet 4.5: $3/M input, $15/M output)
      const cost = ((data.inputTokens || 0) * 0.000003) + ((data.outputTokens || 0) * 0.000015);

      const key = `${agent}-${model}`;
      if (!usage[key]) {
        usage[key] = { agent, model, tokens: 0, cost: 0 };
      }
      usage[key].tokens += tokens;
      usage[key].cost += cost;
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

function extractAgentName(sessionKey: string): string {
  const match = sessionKey.match(/agent:([^:]+)/);
  if (match) {
    const name = match[1];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return 'Unknown';
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
