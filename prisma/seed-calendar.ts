import { PrismaClient, TaskStatus, TaskPriority, CalendarEventType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding calendar data...');

  // Clear existing data
  await prisma.calendarEvent.deleteMany();
  await prisma.task.deleteMany();
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Create tasks with various statuses
  const tasks = await Promise.all([
    // IN_PROGRESS tasks (3)
    prisma.task.create({
      data: {
        title: 'Implement user authentication',
        description: 'Add JWT-based auth with refresh tokens',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        assignee: 'bolt@jexhq.com',
        dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      },
    }),
    prisma.task.create({
      data: {
        title: 'Optimize database queries',
        description: 'Add indexes and reduce N+1 queries',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        assignee: 'bolt@jexhq.com',
        dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Build calendar seeding script',
        description: 'Populate calendar with real events from tasks',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        assignee: 'bolt@jexhq.com',
        dueDate: today, // Today
      },
    }),

    // REVIEW tasks (2)
    prisma.task.create({
      data: {
        title: 'API documentation review',
        description: 'Review and update OpenAPI specs',
        status: TaskStatus.REVIEW,
        priority: TaskPriority.MEDIUM,
        assignee: 'fuse@jexhq.com',
        dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Security audit findings',
        description: 'Review and address security scan results',
        status: TaskStatus.REVIEW,
        priority: TaskPriority.HIGH,
        assignee: 'rick@jexhq.com',
        dueDate: today,
      },
    }),

    // DONE tasks (3)
    prisma.task.create({
      data: {
        title: 'Setup Prisma schema',
        description: 'Configure database models and migrations',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        assignee: 'bolt@jexhq.com',
        dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      },
    }),
    prisma.task.create({
      data: {
        title: 'Deploy staging environment',
        description: 'Configure CI/CD pipeline for staging',
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        assignee: 'fuse@jexhq.com',
        dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Setup monitoring',
        description: 'Configure error tracking and performance monitoring',
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        assignee: 'bolt@jexhq.com',
        dueDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    }),

    // TODO tasks (2)
    prisma.task.create({
      data: {
        title: 'Design new dashboard layout',
        description: 'Create mockups for analytics dashboard',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        assignee: 'phoenix@jexhq.com',
        dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement rate limiting',
        description: 'Add Redis-based rate limiting to API',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assignee: 'bolt@jexhq.com',
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`✅ Created ${tasks.length} tasks`);

  // Create calendar events from tasks
  const taskEvents = [];

  for (const task of tasks) {
    if (!task.dueDate) continue;

    let eventTitle = '';
    let eventType = CalendarEventType.TASK_EVENT;
    let startTime = task.dueDate;
    let endTime = new Date(task.dueDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    switch (task.status) {
      case TaskStatus.IN_PROGRESS:
        eventTitle = `🚀 ${task.title}`;
        // Schedule during work hours (10 AM - 5 PM)
        startTime = new Date(task.dueDate);
        startTime.setHours(10 + Math.floor(Math.random() * 7), 0, 0, 0);
        endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours
        break;
      
      case TaskStatus.REVIEW:
        eventTitle = `🔍 Review: ${task.title}`;
        eventType = CalendarEventType.MEETING;
        startTime = new Date(task.dueDate);
        startTime.setHours(14, 0, 0, 0); // 2 PM review meetings
        endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour
        break;
      
      case TaskStatus.DONE:
        eventTitle = `✅ Completed: ${task.title}`;
        // Keep original due date
        break;
      
      default:
        eventTitle = task.title;
    }

    taskEvents.push(
      prisma.calendarEvent.create({
        data: {
          title: eventTitle,
          description: task.description,
          type: eventType,
          startTime,
          endTime,
          taskId: task.id,
          isRecurring: false,
        },
      })
    );
  }

  await Promise.all(taskEvents);
  console.log(`✅ Created ${taskEvents.length} task-based calendar events`);

  // Create recurring events
  const recurringEvents = await Promise.all([
    // Daily standup at 9 AM
    prisma.calendarEvent.create({
      data: {
        title: '🌅 Daily Standup',
        description: 'Team sync - What did you do? What will you do? Any blockers?',
        type: CalendarEventType.MEETING,
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 15, 0),
        isRecurring: true,
        recurrenceRule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR', // Weekdays only
      },
    }),

    // Weekly sprint planning Monday 10 AM
    prisma.calendarEvent.create({
      data: {
        title: '📋 Sprint Planning',
        description: 'Plan the week ahead - review backlog and assign tasks',
        type: CalendarEventType.MEETING,
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0, 0),
        isRecurring: true,
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
      },
    }),

    // Friday engineering review 4 PM
    prisma.calendarEvent.create({
      data: {
        title: '🔧 Engineering Review',
        description: 'Weekly technical review - architecture, code quality, and tech debt',
        type: CalendarEventType.MEETING,
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0, 0),
        isRecurring: true,
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=FR',
      },
    }),

    // Bi-weekly 1-on-1s
    prisma.calendarEvent.create({
      data: {
        title: '👥 1-on-1 with Rick',
        description: 'Career development and feedback session',
        type: CalendarEventType.MEETING,
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30, 0),
        isRecurring: true,
        recurrenceRule: 'FREQ=WEEKLY;INTERVAL=2;BYDAY=TH', // Every 2 weeks on Thursday
      },
    }),
  ]);

  console.log(`✅ Created ${recurringEvents.length} recurring events`);

  // Summary
  const totalEvents = await prisma.calendarEvent.count();
  const totalTasks = await prisma.task.count();

  console.log('\n📊 Seeding Summary:');
  console.log(`   Tasks: ${totalTasks}`);
  console.log(`   Calendar Events: ${totalEvents}`);
  console.log('   ✅ Calendar is now populated with real data!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
