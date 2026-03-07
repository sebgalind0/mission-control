import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding activity events...');

  const now = new Date();
  
  // Helper to create timestamps at specific hours/minutes ago
  const hoursAgo = (h: number, m: number = 0) => 
    new Date(now.getTime() - (h * 60 + m) * 60 * 1000);

  const activities = [
    // Last 2 hours - Most recent activity
    {
      agent: 'Bolt',
      action: 'database_seeded',
      metadata: { tables: ['ActivityEvent', 'ActiveWork'], count: 30 },
      timestamp: hoursAgo(0, 5),
    },
    {
      agent: 'Larry',
      action: 'code_review_completed',
      metadata: { file: 'src/app/api/activity/live/route.ts', result: 'approved' },
      timestamp: hoursAgo(0, 15),
    },
    {
      agent: 'Neo',
      action: 'task_completed',
      metadata: { task: 'Add hover states to Fleet Overview', duration: '45m' },
      timestamp: hoursAgo(0, 30),
    },
    {
      agent: 'Bolt',
      action: 'deployment_completed',
      metadata: { project: 'mission-control', environment: 'production', commit: '5319b57' },
      timestamp: hoursAgo(1, 0),
    },
    {
      agent: 'Roger',
      action: 'infrastructure_check',
      metadata: { service: 'OpenClaw Gateway', status: 'healthy', uptime: '99.8%' },
      timestamp: hoursAgo(1, 20),
    },
    {
      agent: 'Neo',
      action: 'commit_pushed',
      metadata: { repo: 'mission-control', branch: 'main', message: 'Fix: Update Calendar API routing' },
      timestamp: hoursAgo(1, 45),
    },

    // 2-6 hours ago - Mid-day activity
    {
      agent: 'Bolt',
      action: 'api_endpoint_created',
      metadata: { endpoint: '/api/calendar/events', method: 'GET', responseTime: '87ms' },
      timestamp: hoursAgo(2, 10),
    },
    {
      agent: 'Julius Caesar',
      action: 'analytics_report_generated',
      metadata: { type: 'weekly', metrics: ['engagement', 'reach', 'conversions'], trend: '+12%' },
      timestamp: hoursAgo(2, 40),
    },
    {
      agent: 'Achilles',
      action: 'research_completed',
      metadata: { topic: 'Competitor Analysis - Dashboard UX', sources: 12, insights: 8 },
      timestamp: hoursAgo(3, 5),
    },
    {
      agent: 'George',
      action: 'design_review',
      metadata: { component: 'Agent Card', feedback: 'Approved with minor spacing adjustments' },
      timestamp: hoursAgo(3, 30),
    },
    {
      agent: 'Steve Jobs',
      action: 'ui_component_updated',
      metadata: { component: 'Button', changes: ['hover state', 'active state', 'disabled state'] },
      timestamp: hoursAgo(4, 0),
    },
    {
      agent: 'Larry',
      action: 'architecture_review',
      metadata: { topic: 'Real-time activity feed', decision: 'WebSocket + polling fallback' },
      timestamp: hoursAgo(4, 30),
    },
    {
      agent: 'Roger',
      action: 'database_optimization',
      metadata: { operation: 'index creation', tables: ['ActivityEvent', 'Task'], improvement: '3.2x faster' },
      timestamp: hoursAgo(5, 10),
    },
    {
      agent: 'Neo',
      action: 'bug_fixed',
      metadata: { issue: 'Calendar events not rendering in Safari', solution: 'CSS Grid polyfill' },
      timestamp: hoursAgo(5, 45),
    },

    // 6-12 hours ago - Earlier in the day
    {
      agent: 'Bolt',
      action: 'api_performance_test',
      metadata: { endpoint: '/api/tasks', requests: 1000, avgResponseTime: '42ms', p95: '89ms' },
      timestamp: hoursAgo(6, 20),
    },
    {
      agent: 'Achilles',
      action: 'documentation_updated',
      metadata: { pages: ['API Reference', 'Database Schema', 'Deployment Guide'], additions: '+2400 words' },
      timestamp: hoursAgo(7, 0),
    },
    {
      agent: 'Julius Caesar',
      action: 'strategy_meeting_completed',
      metadata: { topic: 'Q2 Roadmap', attendees: ['Larry', 'Neo', 'Bolt'], decisions: 5 },
      timestamp: hoursAgo(8, 15),
    },
    {
      agent: 'Roger',
      action: 'backup_completed',
      metadata: { databases: ['mission-control', 'don-ai', 'baba'], size: '4.2GB', duration: '3m12s' },
      timestamp: hoursAgo(9, 0),
    },
    {
      agent: 'Larry',
      action: 'sprint_planning',
      metadata: { sprint: 'Week 10', stories: 12, points: 34, focus: 'Dashboard Polish' },
      timestamp: hoursAgo(10, 30),
    },
    {
      agent: 'Neo',
      action: 'component_library_updated',
      metadata: { components: ['Card', 'Badge', 'Avatar'], version: '2.1.0' },
      timestamp: hoursAgo(11, 15),
    },

    // 12-24 hours ago - Previous day activity
    {
      agent: 'Bolt',
      action: 'migration_executed',
      metadata: { version: '20260306_calendar_events', tablesAffected: 2, success: true },
      timestamp: hoursAgo(12, 30),
    },
    {
      agent: 'George',
      action: 'wireframes_completed',
      metadata: { feature: 'Memory Browser', screens: 8, iterations: 3 },
      timestamp: hoursAgo(14, 0),
    },
    {
      agent: 'Achilles',
      action: 'competitive_analysis',
      metadata: { competitors: ['Linear', 'Height', 'Asana'], focus: 'AI features', findings: 14 },
      timestamp: hoursAgo(15, 30),
    },
    {
      agent: 'Roger',
      action: 'security_audit',
      metadata: { scope: 'API endpoints', vulnerabilities: 0, recommendations: 3 },
      timestamp: hoursAgo(17, 0),
    },
    {
      agent: 'Julius Caesar',
      action: 'metrics_dashboard_reviewed',
      metadata: { kpis: ['DAU', 'retention', 'feature adoption'], status: 'on-track' },
      timestamp: hoursAgo(18, 45),
    },
    {
      agent: 'Larry',
      action: 'team_standup',
      metadata: { participants: 8, blockers: 1, wins: 5, duration: '15m' },
      timestamp: hoursAgo(20, 0),
    },
    {
      agent: 'Neo',
      action: 'prototype_deployed',
      metadata: { feature: 'Live Activity Feed', url: 'staging.missioncontrol.dev', feedback: 'positive' },
      timestamp: hoursAgo(21, 30),
    },
    {
      agent: 'Bolt',
      action: 'database_health_check',
      metadata: { connections: 12, slowQueries: 0, tableSize: '248MB', status: 'optimal' },
      timestamp: hoursAgo(23, 0),
    },
  ];

  // Clear existing activity and active work
  await prisma.activityEvent.deleteMany({});
  await prisma.activeWork.deleteMany({});
  console.log('🗑️  Cleared existing activity events and active work');

  // Seed activities
  for (const activity of activities) {
    await prisma.activityEvent.create({
      data: activity,
    });
  }

  console.log(`✅ Created ${activities.length} activity events spanning 24 hours`);
  
  // Seed active work
  console.log('🌱 Seeding active work...');
  
  const activeWorkItems = [
    {
      agent: 'Neo',
      task: 'Phase 2 UX improvements for Mission Control Dashboard',
      status: 'running',
      progress: 85,
      metadata: {
        phase: 2,
        tasks: ['hover states', 'port fix', 'empty states', 'seed data'],
        completed: ['hover states', 'port fix', 'empty states', 'seed data'],
        remaining: ['final polish'],
      },
      startedAt: hoursAgo(1, 30),
    },
    {
      agent: 'Bolt',
      task: 'Database seeding & real-time activity feed',
      status: 'running',
      progress: 95,
      metadata: {
        tasks: ['activity events', 'memory files', 'workspace docs'],
        completed: ['activity events'],
        current: 'testing',
      },
      startedAt: hoursAgo(0, 25),
    },
    {
      agent: 'Roger',
      task: 'Infrastructure monitoring & optimization',
      status: 'running',
      progress: 60,
      metadata: {
        focus: 'database performance',
        metrics: 'improving',
        nextCheck: hoursAgo(-1, 0).toISOString(), // 1 hour from now
      },
      startedAt: hoursAgo(2, 0),
    },
  ];
  
  for (const work of activeWorkItems) {
    await prisma.activeWork.create({
      data: work,
    });
  }
  
  console.log(`✅ Created ${activeWorkItems.length} active work items`);
  console.log('🎉 Activity seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
