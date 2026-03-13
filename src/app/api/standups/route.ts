import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { loadActiveRoster, type AgentMeta } from '@/lib/openclawRoster';

type StandupEntry = {
  agentId: string;
  name: string;
  role: string;
  department: string;
  emoji?: string;
  reportsTo: string | null;
  yesterday: string[];
  today: string[];
  blockers: string[];
  status: 'ready' | 'in_progress' | 'blocked' | 'awaiting_update';
  priority: 'high' | 'medium' | 'low';
};

const REPORTING_LINES: Record<string, string | null> = {
  main: null,
  larry: 'main',
  neo: 'larry',
  bolt: 'larry',
  caesar: 'main',
  elon: 'caesar',
  vegeta: 'caesar',
  achilles: 'main',
  olivia: 'achilles',
  kevin: 'main',
};

const STANDUP_ORDER = ['main', 'larry', 'neo', 'bolt', 'caesar', 'elon', 'vegeta', 'achilles', 'olivia', 'kevin'];

export async function GET() {
  try {
    const [roster, tasks, workItems, recentEvents, ceoPriorities] = await Promise.all([
      loadActiveRoster(),
      prisma.task.findMany({
        orderBy: [{ updatedAt: 'desc' }],
      }),
      prisma.activeWork.findMany({
        orderBy: [{ updatedAt: 'desc' }],
      }),
      prisma.activityEvent.findMany({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        orderBy: [{ timestamp: 'desc' }],
        take: 250,
      }),
      loadCeoPriorities(),
    ]);

    const entries = roster
      .map((agent) => buildEntry(agent, tasks, workItems, recentEvents))
      .sort((a, b) => sortEntries(a.agentId, b.agentId));

    const stats = {
      totalParticipants: entries.length,
      blocked: entries.filter((entry) => entry.status === 'blocked').length,
      inProgress: entries.filter((entry) => entry.status === 'in_progress').length,
      awaitingUpdate: entries.filter((entry) => entry.status === 'awaiting_update').length,
    };

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      schedule: getStandupSchedule(),
      ceoKickoff: {
        leader: 'Rick Sanchez',
        title: 'Daily Company Standup',
        priorities: ceoPriorities,
      },
      stats,
      entries,
    });
  } catch (error) {
    console.error('Standups API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to build standup view',
        generatedAt: new Date().toISOString(),
        schedule: getStandupSchedule(),
        ceoKickoff: {
          leader: 'Rick Sanchez',
          title: 'Daily Company Standup',
          priorities: [],
        },
        stats: {
          totalParticipants: 0,
          blocked: 0,
          inProgress: 0,
          awaitingUpdate: 0,
        },
        entries: [],
      },
      { status: 500 }
    );
  }
}

function buildEntry(
  agent: AgentMeta,
  tasks: Array<any>,
  workItems: Array<any>,
  recentEvents: Array<any>
): StandupEntry {
  const assignedTasks = tasks.filter((task) => task.assignee === agent.id);
  const activeTasks = assignedTasks.filter((task) => ['IN_PROGRESS', 'REVIEW'].includes(task.status));
  const recentDone = assignedTasks.filter(
    (task) =>
      task.status === 'DONE' &&
      task.updatedAt &&
      new Date(task.updatedAt).getTime() >= Date.now() - 24 * 60 * 60 * 1000
  );
  const blockedWork = workItems.filter((work) => work.agent === agent.id && work.status === 'blocked');
  const runningWork = workItems.filter((work) => work.agent === agent.id && work.status === 'running');
  const pausedWork = workItems.filter((work) => work.agent === agent.id && work.status === 'paused');
  const recentAgentEvents = recentEvents.filter((event) => event.agent === agent.id);

  const yesterday = [
    ...recentDone.slice(0, 2).map((task) => `Closed ${task.title}`),
    ...recentAgentEvents
      .slice(0, 2)
      .map((event) => formatEvent(event))
      .filter((line): line is string => Boolean(line)),
  ].slice(0, 3);

  const today = [
    ...runningWork.slice(0, 2).map((work) => `Continue ${work.task}`),
    ...activeTasks
      .slice(0, 2)
      .map((task) => `${task.status === 'REVIEW' ? 'Review' : 'Advance'} ${task.title}`),
  ].slice(0, 3);

  const blockers = [
    ...blockedWork.slice(0, 2).map((work) => `Blocked on ${work.task}`),
    ...pausedWork.slice(0, 1).map((work) => `Paused: ${work.task}`),
  ].slice(0, 3);

  const status = blockers.length > 0
    ? 'blocked'
    : today.length > 0
      ? 'in_progress'
      : yesterday.length > 0
        ? 'ready'
        : 'awaiting_update';

  const priority = blockers.length > 0
    ? 'high'
    : today.length > 0
      ? 'medium'
      : 'low';

  return {
    agentId: agent.id,
    name: agent.name,
    role: agent.role,
    department: agent.department,
    emoji: agent.emoji,
    reportsTo: REPORTING_LINES[agent.id] ?? null,
    yesterday: yesterday.length > 0 ? yesterday : ['No shipped work recorded in the last 24 hours.'],
    today: today.length > 0 ? today : ['No active mandate recorded. Pull from queue or request assignment.'],
    blockers: blockers.length > 0 ? blockers : ['No blockers recorded.'],
    status,
    priority,
  };
}

function formatEvent(event: any): string | null {
  switch (event.action) {
    case 'work_completed':
      return typeof event.metadata?.task === 'string' ? `Completed ${event.metadata.task}` : 'Completed recent work item';
    case 'work_started':
      return typeof event.metadata?.task === 'string' ? `Started ${event.metadata.task}` : 'Started new work item';
    case 'task_completed':
      return typeof event.metadata?.task === 'string' ? `Shipped ${event.metadata.task}` : 'Shipped a task';
    default:
      return null;
  }
}

function sortEntries(a: string, b: string) {
  const aIndex = STANDUP_ORDER.indexOf(a);
  const bIndex = STANDUP_ORDER.indexOf(b);
  return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
}

function getStandupSchedule() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(9, 30, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  while (next.getDay() === 0 || next.getDay() === 6) {
    next.setDate(next.getDate() + 1);
  }

  return {
    cadence: 'Weekdays at 9:30 AM ET',
    nextStandupAt: next.toISOString(),
    format: 'CEO kickoff -> executive updates -> worker updates -> approvals -> blockers',
  };
}

async function loadCeoPriorities() {
  try {
    const filePath = path.join(os.homedir(), '.openclaw', 'workspace', 'CEO_DAILY_PRIORITIES.md');
    const raw = await fs.readFile(filePath, 'utf-8');
    const bullets = raw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('- ') || line.startsWith('* '))
      .map((line) => line.slice(2).trim())
      .filter(Boolean);
    return bullets.slice(0, 5);
  } catch {
    return [];
  }
}
