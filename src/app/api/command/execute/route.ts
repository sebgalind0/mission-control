import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Agent routing logic based on command keywords
const routeCommand = (command: string): string[] => {
  const cmd = command.toLowerCase();
  const agents: string[] = [];
  
  // Backend/API keywords
  if (cmd.includes('api') || cmd.includes('backend') || cmd.includes('database') || cmd.includes('prisma')) {
    agents.push('Bolt');
  }
  
  // Frontend/design keywords
  if (cmd.includes('ui') || cmd.includes('frontend') || cmd.includes('component') || cmd.includes('design')) {
    agents.push('Neo');
  }
  
  // Deployment keywords
  if (cmd.includes('deploy') || cmd.includes('production') || cmd.includes('vercel')) {
    agents.push('Larry');
  }
  
  // Task management keywords
  if (cmd.includes('task') || cmd.includes('ticket') || cmd.includes('backlog')) {
    agents.push('Larry');
  }

  if (cmd.includes('marketing') || cmd.includes('campaign') || cmd.includes('content')) {
    agents.push('Julius Caesar');
  }

  if (cmd.includes('ops') || cmd.includes('incident') || cmd.includes('monitor') || cmd.includes('alert')) {
    agents.push('Achilles');
  }
  
  // Default to Rick (CEO) if no specific agent matched
  if (agents.length === 0) {
    agents.push('Rick Sanchez');
  }
  
  return [...new Set(agents)];
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { command } = body;
    
    if (!command) {
      return NextResponse.json(
        { error: 'command is required' },
        { status: 400 }
      );
    }
    
    // Route the command to appropriate agent(s)
    const targetAgents = routeCommand(command);
    
    // Log the command as an activity event
    await prisma.activityEvent.create({
      data: {
        agent: 'CommandCenter',
        action: 'command_received',
        metadata: {
          command,
          targetAgents,
        },
      },
    });
    
    const response = {
      status: 'received',
      targetAgents,
      response: `Command routed to: ${targetAgents.join(', ')}`,
      command,
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Command execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute command' },
      { status: 500 }
    );
  }
}
