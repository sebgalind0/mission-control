import { NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';
import { loadActiveRoster, workspacePathForAgent } from '@/lib/openclawRoster';

type DocType = 'markdown' | 'code' | 'config' | 'media' | 'file';

interface DocRecord {
  key: string;
  name: string;
  agent: string;
  agentId: string;
  relativePath: string;
  size: number;
  modified: string;
  type: DocType;
  fullPath: string;
}

const MAX_FILES = 300;
const DEFAULT_CURATED_LIMIT = 120;
const SKIP_DIRS = new Set(['memory', 'node_modules', '.next', '.git', '.vercel']);
const HIGH_SIGNAL_FILENAMES = new Set([
  'AGENTS.md',
  'SOUL.md',
  'USER.md',
  'IDENTITY.md',
  'OPERATING_SYSTEM.md',
  'ENGINEERING_OS.md',
  'MARKETING_OS.md',
  'OPS_OS.md',
  'engineering-queue.md',
  'marketing-backlog.md',
  'ops-backlog.md',
  'content-pipeline.md',
  'ops-watch.md',
  'CEO_DAILY_PRIORITIES.md',
  'ACTIVE.md',
  'README.md',
]);
const NOISY_PATTERNS = [
  /^QA-/i,
  /_SUMMARY/i,
  /TEST/i,
  /^BOLT_/i,
  /^CALENDAR_API/i,
  /^COMMAND_CENTER_/i,
  /^LIVE-/i,
  /MOBILE/i,
  /^P0-/i,
  /^API-ENDPOINTS/i,
];

function inferType(filename: string): DocType {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['md', 'markdown'].includes(ext)) return 'markdown';
  if (['js', 'ts', 'tsx', 'jsx', 'sh', 'py'].includes(ext)) return 'code';
  if (['json', 'yaml', 'yml', 'toml', 'env'].includes(ext)) return 'config';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'media';
  return 'file';
}

async function collectDocs(rootDir: string, prefix = '', depth = 0): Promise<string[]> {
  if (depth > 2) return [];

  let entries;
  try {
    entries = await readdir(rootDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') && !entry.name.endsWith('.md')) continue;
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      if (entry.name !== 'projects' && depth >= 1) continue;
      files.push(...(await collectDocs(path.join(rootDir, entry.name), relativePath, depth + 1)));
      continue;
    }

    files.push(relativePath);
    if (files.length >= MAX_FILES) break;
  }

  return files;
}

function scoreDoc(relativePath: string) {
  const filename = path.basename(relativePath);
  let score = 0;

  if (HIGH_SIGNAL_FILENAMES.has(filename)) score += 100;
  if (relativePath.startsWith('projects/')) score += 50;
  if (relativePath.includes('/ACTIVE.md')) score += 40;
  if (relativePath.includes('queue') || relativePath.includes('backlog')) score += 30;
  if (relativePath.endsWith('.md')) score += 10;
  if (NOISY_PATTERNS.some((pattern) => pattern.test(filename))) score -= 100;

  return score;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('file');
  const scope = searchParams.get('scope') || 'curated';
  const agentFilter = searchParams.get('agent');

  try {
    const roster = await loadActiveRoster();
    const allRecords: DocRecord[] = [];

    for (const agent of roster) {
      if (agentFilter && agent.id !== agentFilter) continue;
      const workspaceDir = workspacePathForAgent(agent.id);
      const relativeFiles = await collectDocs(workspaceDir);

      for (const relativePath of relativeFiles.slice(0, MAX_FILES)) {
        const fullPath = path.join(workspaceDir, relativePath);
        let fileStats;
        try {
          fileStats = await stat(fullPath);
        } catch {
          continue;
        }
        if (!fileStats.isFile()) continue;

        allRecords.push({
          key: `${agent.id}::${relativePath}`,
          name: `${agent.name} / ${relativePath}`,
          agent: agent.name,
          agentId: agent.id,
          relativePath,
          size: fileStats.size,
          modified: fileStats.mtime.toISOString(),
          type: inferType(relativePath),
          fullPath,
        });
      }
    }

    if (key) {
      const record = allRecords.find((item) => item.key === key);
      if (!record) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }

      const content = await readFile(record.fullPath, 'utf-8');
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
        : allRecords
            .filter((record) => scoreDoc(record.relativePath) > 0)
            .sort((a, b) => {
              const scoreDiff = scoreDoc(b.relativePath) - scoreDoc(a.relativePath);
              if (scoreDiff !== 0) return scoreDiff;
              return b.modified.localeCompare(a.modified);
            })
            .slice(0, DEFAULT_CURATED_LIMIT);

    if (scope === 'all') {
      records.sort((a, b) => {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        return a.name.localeCompare(b.name);
      });
    }

    return NextResponse.json({
      scopeApplied: scope,
      files: records.map(({ fullPath: _fullPath, ...record }) => record),
    });
  } catch (error) {
    console.error('Docs API error:', error);
    return NextResponse.json({ error: 'Failed to read workspace documents' }, { status: 500 });
  }
}
