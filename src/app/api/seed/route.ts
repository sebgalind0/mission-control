import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    // Clear existing data
    await prisma.task.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.activityEvent.deleteMany()
    
    console.log('Creating sample tasks...')
    
    // Create sample tasks
    const tasks = await Promise.all([
      prisma.task.create({
        data: {
          title: 'Build Task Board API',
          description: 'Create REST API endpoints for task management',
          status: 'DONE',
          priority: 'HIGH',
          assignee: 'Bolt',
          tag: 'backend',
        },
      }),
      prisma.task.create({
        data: {
          title: 'Design Pixel Office',
          description: 'Create isometric office sprites and layout',
          status: 'DONE',
          priority: 'HIGH',
          assignee: 'George',
          tag: 'design',
        },
      }),
      prisma.task.create({
        data: {
          title: 'Implement Calendar Frontend',
          description: 'Wire up calendar to backend APIs',
          status: 'DONE',
          priority: 'MEDIUM',
          assignee: 'Neo',
          tag: 'frontend',
        },
      }),
      prisma.task.create({
        data: {
          title: 'Fix Analytics Crash',
          description: 'Debug and resolve analytics page errors',
          status: 'DONE',
          priority: 'HIGH',
          assignee: 'Neo',
          tag: 'bugfix',
        },
      }),
      prisma.task.create({
        data: {
          title: 'Integrate Documents API',
          description: 'Connect documents browser to workspace files',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assignee: 'Neo',
          tag: 'frontend',
        },
      }),
      prisma.task.create({
        data: {
          title: 'Add Real-time Activity Feed',
          description: 'Implement live agent activity tracking',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assignee: 'Bolt',
          tag: 'backend',
        },
      }),
      prisma.task.create({
        data: {
          title: 'Optimize Database Queries',
          description: 'Add indexes and improve query performance',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          assignee: 'Bolt',
          tag: 'performance',
        },
      }),
      prisma.task.create({
        data: {
          title: 'Deploy to Vercel',
          description: 'Configure production deployment pipeline',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assignee: 'Roger',
          tag: 'infra',
        },
      }),
      prisma.task.create({
        data: {
          title: 'Create Agent Character Sprites',
          description: 'Design and implement proper pixel art character animations',
          status: 'REVIEW',
          priority: 'HIGH',
          assignee: 'George',
          tag: 'design',
          requiresApproval: true,
        },
      }),
      prisma.task.create({
        data: {
          title: 'Add Task Comments',
          description: 'Implement comment system for task collaboration',
          status: 'BACKLOG',
          priority: 'LOW',
          assignee: 'Neo',
          tag: 'feature',
        },
      }),
    ])
    
    console.log(`Created ${tasks.length} tasks`)
    
    // Create sample activity events
    console.log('Creating activity events...')
    
    await Promise.all([
      prisma.activityEvent.create({
        data: {
          agent: 'Neo',
          action: 'Completed "Fix Analytics Crash"',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        },
      }),
      prisma.activityEvent.create({
        data: {
          agent: 'Bolt',
          action: 'Started "Add Real-time Activity Feed"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        },
      }),
      prisma.activityEvent.create({
        data: {
          agent: 'George',
          action: 'Completed "Design Pixel Office"',
          timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
        },
      }),
      prisma.activityEvent.create({
        data: {
          agent: 'Roger',
          action: 'Updated deploy pipeline configuration',
          timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 min ago
        },
      }),
    ])
    
    return NextResponse.json({
      success: true,
      message: `Seeded ${tasks.length} tasks and 4 activity events`,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    )
  }
}
