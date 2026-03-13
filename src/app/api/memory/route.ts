import { NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';
import { loadActiveRoster, workspacePathForAgent } from '@/lib/openclawRoster';

type MemoryType = 'core' | 'daily' | 'state';

interface MemoryRecord {
  key: string;
  name: string;
  agent: string;
  agentId: string;
  path: string;
  size: number;
  modified: string;
  type: MemoryType;
}

const DEFAULT_DAILY_WINDOW_DAYS = 21;
const DEFAULT_STATE_WINDOW_DAYS = 7;
const NOISY_MEMORY_PATTERNS = [/^archive/i, /history/i, /pre[-_]/i, /lessons-learned/i];

function daysAgo(days: number) {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

function isRecent(isoDate: string, windowDays: number) {
  return new Date(isoDate).getTime() >= daysAgo(windowDays);
}

function isImportantStateFile(filename: string) {
  return /(active|pending|snapshot|continuity|queue|project|task|backlog)/i.test(filename);
}

function isNoisyMemoryFile(filename: string) {
  return NOISY_MEMORY_PATTERNS.some((pattern) => pattern.test(filename));
}

async function safeStat(filePath: string) {
  try {
    return await stat(filePath);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('file');
  const scope = searchParams.get('scope') || 'curated';
  const agentFilter = searchParams.get('agent');

  try {
    const roster = await loadActiveRoster();
    const allRecords: MemoryRecord[] = [];

    for (const agent of roster) {
      if (agentFilter && agent.id !== agentFilter) continue;
      const workspaceDir = workspacePathForAgent(agent.id);
      const rootMemory = path.join(workspaceDir, 'MEMORY.md');
      const memoryDir = path.join(workspaceDir, 'memory');

      const rootStats = await safeStat(rootMemory);
      if (rootStats?.isFile()) {
        allRecords.push({
          key: `${agent.id}::MEMORY.md`,
          name: `${agent.name} / MEMORY.md`,
          agent: agent.name,
          agentId: agent.id,
          path: rootMemory,
          size: rootStats.size,
          modified: rootStats.mtime.toISOString(),
          type: 'core',
        });
      }

      const dirStats = await safeStat(memoryDir);
      if (!dirStats?.isDirectory()) continue;

      const files = await readdir(memoryDir);
      for (const filename of files) {
        if (!(filename.endsWith('.md') || filename.endsWith('.json'))) continue;
        const filePath = path.join(memoryDir, filename);
        const fileStats = await safeStat(filePath);
        if (!fileStats?.isFile()) continue;

        allRecords.push({
          key: `${agent.id}::memory/${filename}`,
          name: `${agent.name} / ${filename}`,
          agent: agent.name,
          agentId: agent.id,
          path: filePath,
          size: fileStats.size,
          modified: fileStats.mtime.toISOString(),
          type:
            filename.endsWith('.json')
              ? 'state'
              : /^\d{4}-\d{2}-\d{2}\.md$/.test(filename)
                ? 'daily'
                : 'core',
        });
      }
    }

    if (key) {
      const record = allRecords.find((item) => item.key === key);
      if (!record) {
        return NextResponse.json({ error: 'Memory file not found' }, { status: 404 });
      }

      const content = await readFile(record.path, 'utf-8');
      return NextResponse.json({
        content,
        agent: record.agent,
        agentId: record.agentId,
        name: record.name,
      });
    }

    const records =
      scope === 'all'
        ? allRecords
        : allRecords.filter((record) => {
            const filename = path.basename(record.path);
            if (isNoisyMemoryFile(filename)) return false;
            if (record.type === 'core') return true;
            if (record.type === 'daily') return isRecent(record.modified, DEFAULT_DAILY_WINDOW_DAYS);
            return (
              isRecent(record.modified, DEFAULT_STATE_WINDOW_DAYS) ||
              isImportantStateFile(record.name)
            );
          });

    records.sort((a, b) => {
      if (a.type !== b.type) {
        const order = { core: 0, daily: 1, state: 2 };
        return order[a.type] - order[b.type];
      }
      return b.modified.localeCompare(a.modified);
    });

    return NextResponse.json({
      scopeApplied: scope,
      files: records.map(({ path: _path, ...record }) => record),
    });
  } catch (error) {
    console.error('Memory API error:', error);
    return NextResponse.json({ error: 'Failed to read memory files' }, { status: 500 });
  }
}
