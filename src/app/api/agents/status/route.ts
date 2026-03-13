import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { getAgentMeta, loadActiveAgentIds } from '@/lib/openclawRoster';

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'offline';
  lastActivity: string;
  currentTask: string | null;
  sessionKey: string | null;
  role: string;
  department: string;
  emoji?: string;
  color?: string;
  initial?: string;
}

export async function GET() {
  try {
    const homeDir = os.homedir();
    const agentsRoot = path.join(homeDir, '.openclaw/agents');
    const agentDirs = await fs.readdir(agentsRoot, { withFileTypes: true });
    let activeAgents: Set<string> | null = null;

    try {
      activeAgents = new Set(await loadActiveAgentIds());
    } catch {
      activeAgents = null;
    }

    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    const latestByAgent = new Map<string, AgentStatus>();

    for (const entry of agentDirs) {
      if (!entry.isDirectory()) continue;
      const agentId = entry.name;
      if (activeAgents && !activeAgents.has(agentId)) continue;
      const sessionsPath = path.join(agentsRoot, agentId, 'sessions', 'sessions.json');

      let sessionsRaw: string;
      try {
        sessionsRaw = await fs.readFile(sessionsPath, 'utf-8');
      } catch {
        continue;
      }

      let sessions: Record<string, any>;
      try {
        sessions = JSON.parse(sessionsRaw);
      } catch {
        continue;
      }

      for (const [sessionKey, data] of Object.entries(sessions)) {
        const sessionData = data as any;
        const updatedAt = new Date(sessionData.updatedAt).getTime();
        if (!Number.isFinite(updatedAt)) continue;

        const existing = latestByAgent.get(agentId);
        if (existing && new Date(existing.lastActivity).getTime() >= updatedAt) {
          continue;
        }

        const meta = getAgentMeta(agentId);
        latestByAgent.set(agentId, {
          id: agentId,
          name: meta.name,
          status: updatedAt > fiveMinutesAgo ? 'active' : 'idle',
          lastActivity: sessionData.updatedAt,
          currentTask: sessionData.label || null,
          sessionKey,
          role: meta.role,
          department: meta.department,
          emoji: meta.emoji,
          color: meta.color,
          initial: meta.initial,
        });
      }
    }

    const agentStatuses = Array.from(latestByAgent.values()).sort((a, b) =>
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );

    return NextResponse.json({ agents: agentStatuses });
  } catch (error) {
    console.error('Failed to fetch agent status:', error);
    // Return empty array instead of error to prevent UI breakage
    return NextResponse.json({ agents: [] });
  }
}
