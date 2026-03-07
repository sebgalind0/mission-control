/**
 * Live integrations for Command Center
 * - OpenClaw sub-agents via CLI
 * - GitHub commits via API
 * - Git log via local repo
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'sebastiangalindo/workspace-bolt';

// ============================================================================
// OpenClaw Sub-Agents
// ============================================================================

export interface OpenClawAgent {
  sessionId: string;
  label: string;
  status: 'running' | 'idle' | 'blocked';
  task: string;
  runtimeMs: number;
  startTime: string;
}

/**
 * Get active OpenClaw sub-agents via CLI
 */
export async function getActiveAgents(): Promise<OpenClawAgent[]> {
  try {
    // Run: openclaw sessions list --json
    const { stdout } = await execAsync('openclaw sessions list --json', {
      timeout: 5000,
    });

    const sessions = JSON.parse(stdout);
    
    // Filter for sub-agents only
    const agents: OpenClawAgent[] = sessions
      .filter((s: any) => s.type === 'subagent')
      .map((s: any) => ({
        sessionId: s.id,
        label: s.label || 'Unnamed Task',
        status: s.status || 'running',
        task: s.label || 'Unknown',
        runtimeMs: Date.now() - new Date(s.startTime).getTime(),
        startTime: s.startTime,
      }));

    return agents;
  } catch (error) {
    console.error('Failed to fetch OpenClaw agents:', error);
    return [];
  }
}

// ============================================================================
// GitHub Commits
// ============================================================================

export interface GitCommit {
  sha: string;
  author: string;
  message: string;
  timestamp: string;
  url: string;
}

/**
 * Fetch recent commits from GitHub API
 */
export async function getGitHubCommits(limit = 20): Promise<GitCommit[]> {
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN not set, skipping GitHub API');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=${limit}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
        next: { revalidate: 60 }, // Cache for 60s
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const commits = await response.json();

    return commits.map((c: any) => ({
      sha: c.sha.substring(0, 7),
      author: c.commit.author.name,
      message: c.commit.message.split('\n')[0], // First line only
      timestamp: c.commit.author.date,
      url: c.html_url,
    }));
  } catch (error) {
    console.error('Failed to fetch GitHub commits:', error);
    return [];
  }
}

/**
 * Fallback: Get commits via local git log (if in git repo)
 */
export async function getLocalGitCommits(limit = 20): Promise<GitCommit[]> {
  try {
    const { stdout } = await execAsync(
      `git log -${limit} --pretty=format:'%h|%an|%s|%ai'`,
      {
        cwd: process.cwd(),
        timeout: 5000,
      }
    );

    const lines = stdout.trim().split('\n');
    
    return lines.map((line) => {
      const [sha, author, message, timestamp] = line.split('|');
      return {
        sha,
        author,
        message,
        timestamp,
        url: '', // No URL for local git
      };
    });
  } catch (error) {
    console.error('Failed to fetch local git commits:', error);
    return [];
  }
}

// ============================================================================
// File Changes (via git diff)
// ============================================================================

export interface FileChange {
  path: string;
  status: 'modified' | 'added' | 'deleted';
  timestamp: string;
}

/**
 * Get recent file changes via git status/diff
 */
export async function getRecentFileChanges(): Promise<FileChange[]> {
  try {
    // Get uncommitted changes
    const { stdout: status } = await execAsync('git status --porcelain', {
      cwd: process.cwd(),
      timeout: 3000,
    });

    const changes: FileChange[] = status
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const statusCode = line.substring(0, 2).trim();
        const path = line.substring(3);
        
        let status: 'modified' | 'added' | 'deleted' = 'modified';
        if (statusCode === 'A' || statusCode === '??') status = 'added';
        if (statusCode === 'D') status = 'deleted';

        return {
          path,
          status,
          timestamp: new Date().toISOString(),
        };
      });

    return changes;
  } catch (error) {
    console.error('Failed to fetch file changes:', error);
    return [];
  }
}

// ============================================================================
// Build/Deploy Events (placeholder - integrate with your CI/CD)
// ============================================================================

export interface BuildEvent {
  id: string;
  type: 'build' | 'deploy';
  status: 'success' | 'failed' | 'running';
  message: string;
  timestamp: string;
}

/**
 * Get recent builds/deploys
 * TODO: Integrate with Vercel API, GitHub Actions, etc.
 */
export async function getRecentBuilds(): Promise<BuildEvent[]> {
  // Placeholder - integrate with your CI/CD pipeline
  return [];
}
