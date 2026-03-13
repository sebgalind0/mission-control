import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

export interface AgentMeta {
  id: string;
  name: string;
  role: string;
  department: string;
  emoji?: string;
  color?: string;
  initial?: string;
}

const META: Record<string, Omit<AgentMeta, 'id'>> = {
  main: {
    name: 'Rick Sanchez',
    role: 'CEO',
    department: 'Leadership',
    emoji: '🧪',
    color: '#3b82f6',
    initial: 'R',
  },
  larry: {
    name: 'Larry',
    role: 'CTO',
    department: 'Engineering',
    emoji: '💊',
    color: '#10b981',
    initial: 'L',
  },
  neo: {
    name: 'Neo',
    role: 'Frontend + Product Design',
    department: 'Engineering',
    emoji: '🎨',
    color: '#6366f1',
    initial: 'N',
  },
  bolt: {
    name: 'Bolt',
    role: 'Backend + Infrastructure',
    department: 'Engineering',
    emoji: '⚙️',
    color: '#eab308',
    initial: 'B',
  },
  caesar: {
    name: 'Julius Caesar',
    role: 'CMO',
    department: 'Marketing',
    emoji: '⚔️',
    color: '#ef4444',
    initial: 'JC',
  },
  elon: {
    name: 'Elon',
    role: 'X / Twitter',
    department: 'Marketing',
    emoji: '𝕏',
    color: '#f97316',
    initial: 'E',
  },
  vegeta: {
    name: 'Vegeta',
    role: 'LinkedIn / Growth',
    department: 'Marketing',
    emoji: '📣',
    color: '#8b5cf6',
    initial: 'V',
  },
  achilles: {
    name: 'Achilles',
    role: 'COO',
    department: 'Operations',
    emoji: '🕶️',
    color: '#3b82f6',
    initial: 'A',
  },
  olivia: {
    name: 'Olivia',
    role: 'Operations Coordinator',
    department: 'Operations',
    emoji: '📋',
    color: '#f472b6',
    initial: 'O',
  },
};

export function getAgentMeta(agentId: string): AgentMeta {
  const meta = META[agentId];
  if (meta) {
    return { id: agentId, ...meta };
  }

  const label = agentId.charAt(0).toUpperCase() + agentId.slice(1);
  return {
    id: agentId,
    name: label,
    role: 'Agent',
    department: 'Unassigned',
    color: '#6b7280',
    initial: label.slice(0, 2).toUpperCase(),
  };
}

export async function loadActiveAgentIds(): Promise<string[]> {
  const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
  const raw = await fs.readFile(configPath, 'utf-8');
  const config = JSON.parse(raw);

  if (Array.isArray(config?.agents?.list)) {
    return config.agents.list
      .map((agent: any) => agent?.id)
      .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0);
  }

  if (config?.agents && typeof config.agents === 'object') {
    return Object.keys(config.agents);
  }

  return [];
}

export async function loadActiveRoster(): Promise<AgentMeta[]> {
  const ids = await loadActiveAgentIds();
  return ids.map(getAgentMeta);
}

export function workspacePathForAgent(agentId: string): string {
  const home = os.homedir();
  if (agentId === 'main') {
    return path.join(home, '.openclaw', 'workspace');
  }
  return path.join(home, '.openclaw', `workspace-${agentId}`);
}
