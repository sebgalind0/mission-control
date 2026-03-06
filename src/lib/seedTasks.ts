import { prisma } from './prisma';
import { Priority, Status } from '@prisma/client';

const mockTasks = [
  // Backlog
  { id: 't1', title: 'Dubai trip logistics', description: 'Research flights and hotels for potential April trip', priority: Priority.MEDIUM, status: Status.BACKLOG, assignee: 'main', tag: 'Travel' },
  { id: 't2', title: 'LinkedIn content calendar', description: 'Plan next 2 weeks of posts and engagement strategy', priority: Priority.LOW, status: Status.BACKLOG, assignee: 'main', tag: 'Marketing' },
  { id: 't3', title: 'WHOOP API v2 migration', description: 'Migrate to new API endpoints for better data access', priority: Priority.MEDIUM, status: Status.BACKLOG, assignee: 'popeye', tag: 'Health' },
  
  // In Progress
  { id: 't4', title: 'Mission Control UI', description: 'Build fleet management dashboard with all 18 screens', priority: Priority.HIGH, status: Status.IN_PROGRESS, assignee: 'main', tag: 'Engineering' },
  { id: 't5', title: 'Robotics curriculum', description: 'Inverse kinematics module for Nico — ahead by 2 days', priority: Priority.HIGH, status: Status.IN_PROGRESS, assignee: 'tesla', tag: 'Education' },
  { id: 't6', title: 'Weekly health report', description: 'Compile sleep, recovery, strain data from WHOOP', priority: Priority.MEDIUM, status: Status.IN_PROGRESS, assignee: 'popeye', tag: 'Health' },
  
  // Review
  { id: 't7', title: 'Email draft to Yitzhak', description: 'Follow-up on Fethr dev environment setup - needs to send email', priority: Priority.HIGH, status: Status.REVIEW, assignee: 'main', tag: 'Communication', requiresApproval: true },
  { id: 't8', title: 'Research paper summary', description: 'Literature review on multi-agent LLM orchestration', priority: Priority.MEDIUM, status: Status.REVIEW, assignee: 'nico', tag: 'Research' },
  
  // Done
  { id: 't9', title: 'Team check-in voices', description: 'Morning voice notes sent to all team members', priority: Priority.MEDIUM, status: Status.DONE, assignee: 'main', tag: 'Ops' },
  { id: 't10', title: 'Servo calibration module', description: 'Completed by Nico with Tesla guidance', priority: Priority.HIGH, status: Status.DONE, assignee: 'tesla', tag: 'Education' },
  { id: 't11', title: 'Couples session notes', description: 'Last therapy session summarized and filed', priority: Priority.LOW, status: Status.DONE, assignee: 'together', tag: 'Therapy' },
];

export async function seedTasks() {
  console.log('🌱 Seeding tasks...');
  
  // Clear existing tasks
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  
  // Insert mock tasks
  for (const task of mockTasks) {
    await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignee: task.assignee,
        tag: task.tag,
        requiresApproval: task.requiresApproval || false,
      },
    });
  }
  
  console.log(`✅ Seeded ${mockTasks.length} tasks`);
}

// Run if called directly
if (require.main === module) {
  seedTasks()
    .then(() => prisma.$disconnect())
    .catch((error) => {
      console.error(error);
      prisma.$disconnect();
      process.exit(1);
    });
}
