import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding activity events...');

  // Get timestamps for the last few hours
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

  const activities = [
    // Recent activity (last 5 minutes)
    {
      agent: 'Larry',
      action: 'code_review_completed',
      metadata: {
        file: 'src/app/api/activity/live/route.ts',
        result: 'approved',
      },
      timestamp: twoMinutesAgo,
    },
    {
      agent: 'Neo',
      action: 'task_started',
      metadata: {
        task: 'Add hover states to Fleet Overview',
        priority: 'high',
      },
      timestamp: fiveMinutesAgo,
    },
    
    // Last hour
    {
      agent: 'Bolt',
      action: 'deployment_completed',
      metadata: {
        project: 'mission-control',
        environment: 'production',
        commit: '5319b57',
      },
      timestamp: oneHourAgo,
    },
    {
      agent: 'Roger',
      action: 'infrastructure_check',
      metadata: {
        service: 'OpenClaw Gateway',
        status: 'healthy',
        uptime: '99.8%',
      },
      timestamp: new Date(oneHourAgo.getTime() + 15 * 60 * 1000),
    },
    {
      agent: 'Neo',
      action: 'commit_pushed',
      metadata: {
        repo: 'mission-control',
        branch: 'main',
        message: 'Fix: Update Calendar API routing',
      },
      timestamp: new Date(oneHourAgo.getTime() + 30 * 60 * 1000),
    },
    
    // Last 2 hours
    {
      agent: 'Bolt',
      action: 'api_created',
      metadata: {
        endpoint: '/api/calendar/events',
        method: 'GET',
      },
      timestamp: twoHoursAgo,
    },
    {
      agent: 'Julius Caesar',
      action: 'analytics_report_generated',
      metadata: {
        type: 'weekly',
        metrics: ['engagement', 'reach', 'conversions'],
      },
      timestamp: new Date(twoHoursAgo.getTime() + 20 * 60 * 1000),
    },
    {
      agent: 'Achilles',
      action: 'research_completed',
      metadata: {
        topic: 'Competitor Analysis',
        sources: 12,
      },
      timestamp: new Date(twoHoursAgo.getTime() + 45 * 60 * 1000),
    },
    
    // Last 3 hours
    {
      agent: 'George',
      action: 'design_review',
      metadata: {
        component: 'Agent Card',
        feedback: 'Approved with minor spacing adjustments',
      },
      timestamp: threeHoursAgo,
    },
    {
      agent: 'Steve Jobs',
      action: 'ui_component_updated',
      metadata: {
        component: 'Button',
        changes: ['hover state', 'active state', 'disabled state'],
      },
      timestamp: new Date(threeHoursAgo.getTime() + 30 * 60 * 1000),
    },
    {
      agent: 'Elon',
      action: 'social_post_scheduled',
      metadata: {
        platform: 'X',
        content: 'Building the future of AI agent coordination',
        scheduledFor: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      },
      timestamp: new Date(threeHoursAgo.getTime() + 40 * 60 * 1000),
    },
    {
      agent: 'Cleopatra',
      action: 'health_report_generated',
      metadata: {
        user: 'Seb',
        metrics: ['sleep', 'recovery', 'strain'],
        score: 85,
      },
      timestamp: new Date(threeHoursAgo.getTime() + 50 * 60 * 1000),
    },
  ];

  for (const activity of activities) {
    await prisma.activityEvent.create({
      data: activity,
    });
  }

  console.log(`✅ Created ${activities.length} activity events`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
