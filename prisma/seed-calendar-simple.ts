import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding calendar...');
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Clear existing
  await prisma.calendarEvent.deleteMany();
  
  // Get tasks to link
  const tasks = await prisma.task.findMany({ take: 10 });
  
  const events = [];
  
  // Task-based events
  for (const task of tasks) {
    const startTime = task.deadline || new Date(today.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
    events.push({
      title: `🚀 ${task.title}`,
      description: task.description,
      type: 'TASK_EVENT' as any,
      startTime,
      endTime: new Date(startTime.getTime() + 2 * 60 * 60 * 1000),
      taskId: task.id,
    });
  }
  
  // Recurring events
  events.push(
    {
      title: '🌅 Daily Standup',
      description: 'Morning sync',
      type: 'RECURRING' as any,
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 15),
      isRecurring: true,
      recurrenceRule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR',
    },
    {
      title: '📋 Sprint Planning',
      description: 'Plan the week',
      type: 'MEETING' as any,
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
      isRecurring: true,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
    }
  );
  
  await prisma.calendarEvent.createMany({ data: events });
  
  console.log(`✅ Created ${events.length} events`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
