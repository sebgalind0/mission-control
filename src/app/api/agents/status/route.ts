import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'offline';
  lastActivity: string;
  currentTask: string | null;
  sessionKey: string | null;
}

export async function GET() {
  try {
    const homeDir = os.homedir();
    const sessionsPath = path.join(homeDir, '.openclaw/agents/larry/sessions/sessions.json');
    
    // Read OpenClaw sessions file
    const sessionsData = await fs.readFile(sessionsPath, 'utf-8');
    const sessions = JSON.parse(sessionsData);
    
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    // Map sessions to agent status
    const agentStatuses: AgentStatus[] = [];
    
    for (const [sessionKey, data] of Object.entries(sessions)) {
      const sessionData = data as any;
      const updatedAt = new Date(sessionData.updatedAt).getTime();
      
      // Extract agent name from sessionKey (e.g., "agent:larry:main" → "Larry")
      const agentMatch = sessionKey.match(/agent:([^:]+)/);
      if (!agentMatch) continue;
      
      const agentId = agentMatch[1];
      const agentName = agentId.charAt(0).toUpperCase() + agentId.slice(1);
      
      // Determine status based on last activity
      const isActive = updatedAt > fiveMinutesAgo;
      const status = isActive ? 'active' : 'idle';
      
      // Try to extract current task from last message (simplified)
      const currentTask = sessionData.label || null;
      
      agentStatuses.push({
        id: agentId,
        name: agentName,
        status,
        lastActivity: sessionData.updatedAt,
        currentTask,
        sessionKey,
      });
    }
    
    return NextResponse.json({ agents: agentStatuses });
  } catch (error) {
    console.error('Failed to fetch agent status:', error);
    // Return empty array instead of error to prevent UI breakage
    return NextResponse.json({ agents: [] });
  }
}
