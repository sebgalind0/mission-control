import { NextResponse } from 'next/server';

const STAR_OFFICE_URL = 'http://127.0.0.1:19000';
const JOIN_KEY = 'ocj_example_team_01';

// Map Mission Control statuses to Star-Office states
const statusMap: Record<string, string> = {
  'online': 'idle',
  'working': 'writing',
  'idle': 'idle',
  'blocked': 'error',
  'offline': 'idle',
};

// Cache registered agents to avoid repeated joins
const registeredAgents = new Map<string, string>(); // agentId -> starOfficeAgentId

async function joinAgent(name: string, state: string, detail: string): Promise<string> {
  const response = await fetch(`${STAR_OFFICE_URL}/join-agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      state,
      detail,
      joinKey: JOIN_KEY,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to join agent: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.ok) {
    throw new Error(`Join failed: ${result.msg}`);
  }

  return result.agentId;
}

async function pushState(starOfficeAgentId: string, state: string, detail: string): Promise<any> {
  const response = await fetch(`${STAR_OFFICE_URL}/agent-push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId: starOfficeAgentId,
      joinKey: JOIN_KEY,
      state,
      detail,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to push state: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
}

// This endpoint syncs Mission Control agent status to Star-Office
export async function POST(request: Request) {
  try {
    const { agentId, name, status, detail } = await request.json();
    
    if (!agentId || !status) {
      return NextResponse.json(
        { error: 'Missing agentId or status' },
        { status: 400 }
      );
    }

    // Map the status
    const mappedState = statusMap[status] || 'idle';
    const agentName = name || agentId;
    const agentDetail = detail || `${agentName} - ${mappedState}`;

    let starOfficeAgentId = registeredAgents.get(agentId);

    // If agent not registered, join first
    if (!starOfficeAgentId) {
      starOfficeAgentId = await joinAgent(agentName, mappedState, agentDetail);
      registeredAgents.set(agentId, starOfficeAgentId);
    }

    // Push the state
    const result = await pushState(starOfficeAgentId, mappedState, agentDetail);

    return NextResponse.json({
      success: true,
      agentId,
      starOfficeAgentId,
      mappedState,
      starOfficeResponse: result,
    });
  } catch (error) {
    console.error('Star-Office sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync with Star-Office', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch current Star-Office state
export async function GET() {
  try {
    const response = await fetch('http://127.0.0.1:19000/agents');
    
    if (!response.ok) {
      throw new Error(`Star-Office API error: ${response.statusText}`);
    }

    const agents = await response.json();
    
    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Star-Office fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Star-Office', details: String(error) },
      { status: 500 }
    );
  }
}
