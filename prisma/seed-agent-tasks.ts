import 'dotenv/config';
import { PrismaClient, Status, Priority } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding agent tasks for analytics...');

  const now = new Date();
  const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);

  const agentTasks = [
    // Rick (CEO) - High-level tasks
    {
      title: 'Weekly agent performance review',
      description: 'Review performance metrics for all agents and identify optimization opportunities',
      assignee: 'main',
      status: Status.DONE,
      priority: Priority.HIGH,
      tag: 'Leadership',
      createdAt: hoursAgo(72),
      updatedAt: hoursAgo(24),
    },
    {
      title: 'Strategic planning session',
      description: 'Q2 roadmap planning and resource allocation',
      assignee: 'main',
      status: Status.IN_PROGRESS,
      priority: Priority.HIGH,
      tag: 'Strategy',
      createdAt: hoursAgo(48),
      updatedAt: hoursAgo(2),
    },

    // Larry (CTO) - Architecture tasks
    {
      title: 'Mission Control architecture review',
      description: 'Code review for Command Center real-time implementation',
      assignee: 'larry',
      status: Status.DONE,
      priority: Priority.HIGH,
      tag: 'Architecture',
      createdAt: hoursAgo(48),
      updatedAt: hoursAgo(1),
    },
    {
      title: 'Database optimization strategy',
      description: 'Review and optimize Prisma queries for better performance',
      assignee: 'larry',
      status: Status.IN_PROGRESS,
      priority: Priority.MEDIUM,
      tag: 'Performance',
      createdAt: hoursAgo(24),
      updatedAt: hoursAgo(3),
    },
    {
      title: 'SSE endpoint design',
      description: 'Design real-time activity stream with Server-Sent Events',
      assignee: 'larry',
      status: Status.DONE,
      priority: Priority.HIGH,
      tag: 'Architecture',
      createdAt: hoursAgo(12),
      updatedAt: hoursAgo(5),
    },

    // Neo (Frontend) - UI/UX tasks
    {
      title: 'Org chart layout optimization',
      description: 'Fix CSS spacing to show all 18 agents in viewport',
      assignee: 'neo',
      status: Status.DONE,
      priority: Priority.HIGH,
      tag: 'Frontend',
      createdAt: hoursAgo(8),
      updatedAt: hoursAgo(3),
    },
    {
      title: 'Task board assignee display',
      description: 'Make assignee names always visible on task cards',
      assignee: 'neo',
      status: Status.DONE,
      priority: Priority.MEDIUM,
      tag: 'UX',
      createdAt: hoursAgo(6),
      updatedAt: hoursAgo(4),
    },
    {
      title: 'Hover state polish',
      description: 'Add glow effects and active states to interactive elements',
      assignee: 'neo',
      status: Status.DONE,
      priority: Priority.LOW,
      tag: 'Polish',
      createdAt: hoursAgo(10),
      updatedAt: hoursAgo(6),
    },
    {
      title: 'Empty state improvements',
      description: 'Replace generic messages with personality-driven copy',
      assignee: 'neo',
      status: Status.DONE,
      priority: Priority.MEDIUM,
      tag: 'UX',
      createdAt: hoursAgo(9),
      updatedAt: hoursAgo(5),
    },

    // Bolt (Backend) - API/Database tasks
    {
      title: 'Database seeding implementation',
      description: 'Seed activity events, memory files, and workspace documents',
      assignee: 'bolt',
      status: Status.DONE,
      priority: Priority.HIGH,
      tag: 'Backend',
      createdAt: hoursAgo(4),
      updatedAt: hoursAgo(1),
    },
    {
      title: 'Activity feed API optimization',
      description: 'Optimize query performance for /api/activity/feed endpoint',
      assignee: 'bolt',
      status: Status.IN_PROGRESS,
      priority: Priority.MEDIUM,
      tag: 'Performance',
      createdAt: hoursAgo(12),
      updatedAt: hoursAgo(2),
    },
    {
      title: 'Calendar API bug fix',
      description: 'Fix Calendar API to query CalendarEvent table instead of Task',
      assignee: 'bolt',
      status: Status.DONE,
      priority: Priority.HIGH,
      tag: 'Bug Fix',
      createdAt: hoursAgo(20),
      updatedAt: hoursAgo(18),
    },

    // Roger (Infrastructure) - DevOps tasks
    {
      title: 'Vercel deployment audit',
      description: 'Investigate deployment issues and optimize build process',
      assignee: 'roger',
      status: Status.DONE,
      priority: Priority.HIGH,
      tag: 'Infrastructure',
      createdAt: hoursAgo(16),
      updatedAt: hoursAgo(8),
    },
    {
      title: 'Database monitoring setup',
      description: 'Configure PostgreSQL performance monitoring and alerts',
      assignee: 'roger',
      status: Status.IN_PROGRESS,
      priority: Priority.MEDIUM,
      tag: 'Monitoring',
      createdAt: hoursAgo(36),
      updatedAt: hoursAgo(4),
    },

    // Kai (Mobile) - iOS tasks
    {
      title: 'SwiftUI dashboard prototype',
      description: 'Build iOS companion app for Mission Control',
      assignee: 'kai',
      status: Status.IN_PROGRESS,
      priority: Priority.LOW,
      tag: 'Mobile',
      createdAt: hoursAgo(96),
      updatedAt: hoursAgo(12),
    },

    // Julius Caesar (CMO) - Marketing tasks
    {
      title: 'Q1 marketing analytics',
      description: 'Analyze campaign performance and ROI metrics',
      assignee: 'caesar',
      status: Status.DONE,
      priority: Priority.MEDIUM,
      tag: 'Analytics',
      createdAt: hoursAgo(48),
      updatedAt: hoursAgo(24),
    },
    {
      title: 'Content strategy planning',
      description: 'Plan Q2 content calendar and distribution strategy',
      assignee: 'caesar',
      status: Status.IN_PROGRESS,
      priority: Priority.HIGH,
      tag: 'Strategy',
      createdAt: hoursAgo(72),
      updatedAt: hoursAgo(6),
    },

    // Elon (X/Twitter) - Social media tasks
    {
      title: 'X engagement campaign',
      description: 'Launch viral thread series about AI agent coordination',
      assignee: 'elon',
      status: Status.IN_PROGRESS,
      priority: Priority.MEDIUM,
      tag: 'Social Media',
      createdAt: hoursAgo(24),
      updatedAt: hoursAgo(3),
    },
    {
      title: 'Daily X posts automation',
      description: 'Set up automated posting schedule for consistent presence',
      assignee: 'elon',
      status: Status.DONE,
      priority: Priority.LOW,
      tag: 'Automation',
      createdAt: hoursAgo(60),
      updatedAt: hoursAgo(48),
    },

    // Vegeta (LinkedIn) - Professional network tasks
    {
      title: 'LinkedIn thought leadership series',
      description: 'Publish weekly insights on AI agent architecture',
      assignee: 'vegeta',
      status: Status.IN_PROGRESS,
      priority: Priority.MEDIUM,
      tag: 'Content',
      createdAt: hoursAgo(48),
      updatedAt: hoursAgo(12),
    },

    // Thoth (Content/Blog) - Writing tasks
    {
      title: 'Technical blog: SSE architecture',
      description: 'Write deep-dive article on implementing real-time SSE streams',
      assignee: 'thoth',
      status: Status.IN_PROGRESS,
      priority: Priority.MEDIUM,
      tag: 'Writing',
      createdAt: hoursAgo(36),
      updatedAt: hoursAgo(6),
    },
    {
      title: 'SEO optimization audit',
      description: 'Analyze and optimize blog content for search engines',
      assignee: 'thoth',
      status: Status.DONE,
      priority: Priority.LOW,
      tag: 'SEO',
      createdAt: hoursAgo(72),
      updatedAt: hoursAgo(48),
    },

    // Achilles (COO) - Operations tasks
    {
      title: 'Competitive intelligence report',
      description: 'Research and document competitor agent architectures',
      assignee: 'achilles',
      status: Status.DONE,
      priority: Priority.HIGH,
      tag: 'Intel',
      createdAt: hoursAgo(96),
      updatedAt: hoursAgo(72),
    },
    {
      title: 'Operations efficiency review',
      description: 'Identify bottlenecks in current agent workflows',
      assignee: 'achilles',
      status: Status.IN_PROGRESS,
      priority: Priority.MEDIUM,
      tag: 'Operations',
      createdAt: hoursAgo(48),
      updatedAt: hoursAgo(8),
    },

    // Olivia (Exec Assistant) - Admin tasks
    {
      title: 'Weekly calendar coordination',
      description: 'Schedule and coordinate all agent meetings and check-ins',
      assignee: 'olivia',
      status: Status.DONE,
      priority: Priority.HIGH,
      tag: 'Admin',
      createdAt: hoursAgo(24),
      updatedAt: hoursAgo(12),
    },

    // George (Head of Design) - Design system tasks
    {
      title: 'Design system documentation',
      description: 'Document component library and design tokens',
      assignee: 'george',
      status: Status.IN_PROGRESS,
      priority: Priority.MEDIUM,
      tag: 'Documentation',
      createdAt: hoursAgo(120),
      updatedAt: hoursAgo(24),
    },
    {
      title: 'Color palette optimization',
      description: 'Refine dashboard color scheme for better contrast',
      assignee: 'george',
      status: Status.DONE,
      priority: Priority.LOW,
      tag: 'Design',
      createdAt: hoursAgo(48),
      updatedAt: hoursAgo(36),
    },

    // Steve Jobs (UI/UX) - Component tasks
    {
      title: 'Agent card component redesign',
      description: 'Improve visual hierarchy and information density',
      assignee: 'jobs',
      status: Status.DONE,
      priority: Priority.MEDIUM,
      tag: 'Components',
      createdAt: hoursAgo(72),
      updatedAt: hoursAgo(60),
    },
    {
      title: 'Modal interaction patterns',
      description: 'Design consistent modal behaviors across dashboard',
      assignee: 'jobs',
      status: Status.IN_PROGRESS,
      priority: Priority.LOW,
      tag: 'UX',
      createdAt: hoursAgo(96),
      updatedAt: hoursAgo(48),
    },
  ];

  for (const task of agentTasks) {
    await prisma.task.create({
      data: task,
    });
  }

  console.log(`✅ Created ${agentTasks.length} agent tasks`);
  
  // Show task distribution
  const distribution = agentTasks.reduce((acc, t) => {
    acc[t.assignee] = (acc[t.assignee] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📊 Task distribution:');
  Object.entries(distribution).forEach(([agent, count]) => {
    console.log(`  ${agent}: ${count} tasks`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
