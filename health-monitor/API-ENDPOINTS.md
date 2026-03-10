# Agent Health Monitor — API Endpoints

## Overview

All endpoints under `/api/health/*`

## Endpoints

### 1. GET /api/health

**Purpose:** Get health status for all agents

**Response:**
```json
{
  "timestamp": "2026-03-09T22:00:00Z",
  "agents": [
    {
      "agentName": "Larry",
      "status": "green",
      "metrics": {
        "tokenBurn": {
          "currentHourlyRate": 0.50,
          "tokensLastHour": 2000,
          "costLastHour": 0.10,
          "status": "green"
        },
        "loopDetection": {
          "identicalCount": 0,
          "suspectedLoop": false,
          "status": "green"
        },
        "sessionDuration": {
          "currentDuration": 45,
          "status": "green"
        },
        "errorRate": {
          "totalCalls": 10,
          "failedCalls": 0,
          "errorRate": 0.0,
          "status": "green"
        },
        "responseTime": {
          "lastResponseTime": 2,
          "status": "green"
        }
      },
      "alerts": [],
      "lastChecked": "2026-03-09T22:00:00Z"
    }
  ]
}
```

**Implementation:**
```typescript
// src/app/api/health/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { healthMonitor } from '@/services/health-monitor';

export async function GET(req: NextRequest) {
  const agents = healthMonitor.getAllHealth();
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    agents
  });
}
```

---

### 2. GET /api/health/[agent]

**Purpose:** Get health status for specific agent

**URL:** `/api/health/larry`

**Response:**
```json
{
  "agentName": "Larry",
  "status": "yellow",
  "metrics": { ... },
  "alerts": [
    {
      "id": "alert-123",
      "severity": "yellow",
      "type": "token_burn",
      "message": "Token burn rate $3.20/hour approaching RED threshold",
      "timestamp": "2026-03-09T21:45:00Z",
      "acknowledged": false
    }
  ],
  "lastChecked": "2026-03-09T22:00:00Z"
}
```

**Implementation:**
```typescript
// src/app/api/health/[agent]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { healthMonitor } from '@/services/health-monitor';

export async function GET(
  req: NextRequest,
  { params }: { params: { agent: string } }
) {
  const agentName = params.agent;
  const health = healthMonitor.getHealth(agentName);
  
  if (!health) {
    return NextResponse.json(
      { error: 'Agent not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(health);
}
```

---

### 3. POST /api/health/alerts/acknowledge

**Purpose:** Mark alert as acknowledged

**Request Body:**
```json
{
  "alertId": "alert-123"
}
```

**Response:**
```json
{
  "success": true,
  "alertId": "alert-123"
}
```

**Implementation:**
```typescript
// src/app/api/health/alerts/acknowledge/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { healthMonitor } from '@/services/health-monitor';

export async function POST(req: NextRequest) {
  const { alertId } = await req.json();
  
  healthMonitor.acknowledgeAlert(alertId);
  
  return NextResponse.json({
    success: true,
    alertId
  });
}
```

---

### 4. POST /api/health/[agent]/kill

**Purpose:** Kill agent session (RED alert action)

**URL:** `/api/health/larry/kill`

**Request Body:**
```json
{
  "reason": "Token burn >$5/hour (RED threshold)"
}
```

**Response:**
```json
{
  "success": true,
  "agentName": "Larry",
  "sessionKilled": true,
  "timestamp": "2026-03-09T22:00:00Z"
}
```

**Implementation:**
```typescript
// src/app/api/health/[agent]/kill/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { killAgentSession } from '@/lib/openclaw';

export async function POST(
  req: NextRequest,
  { params }: { params: { agent: string } }
) {
  const { reason } = await req.json();
  const agentName = params.agent;
  
  // Kill session via OpenClaw
  await killAgentSession(agentName, reason);
  
  return NextResponse.json({
    success: true,
    agentName,
    sessionKilled: true,
    timestamp: new Date().toISOString()
  });
}
```

---

### 5. GET /api/health/alerts/active

**Purpose:** Get all active (unacknowledged) alerts

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert-123",
      "agentName": "Elon",
      "severity": "red",
      "type": "loop",
      "message": "Loop detected: 22 identical actions in 15 min",
      "timestamp": "2026-03-09T21:50:00Z",
      "acknowledged": false
    }
  ],
  "count": 1
}
```

**Implementation:**
```typescript
// src/app/api/health/alerts/active/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { healthMonitor } from '@/services/health-monitor';

export async function GET(req: NextRequest) {
  const activeAlerts = healthMonitor.getActiveAlerts();
  
  return NextResponse.json({
    alerts: activeAlerts,
    count: activeAlerts.length
  });
}
```

---

## Data Flow

```
OpenClaw Event Stream
    ↓
Watcher (openclaw-watcher.js)
    ↓
Health Monitor Service (analyzes events)
    ↓
In-Memory Storage (updates metrics)
    ↓
API Endpoints (serve to dashboard)
    ↓
Dashboard UI (displays health status)
```

## Watcher Integration

The watcher needs to:
1. Parse tool call events from `.jsonl` files
2. Send events to Health Monitor Service via HTTP POST to `/api/health/events`

**New endpoint needed:**

### POST /api/health/events

**Purpose:** Receive events from watcher for analysis

**Request Body:**
```json
{
  "agentName": "Larry",
  "eventType": "tool_call",
  "toolName": "exec",
  "parameters": { "command": "git status" },
  "success": true,
  "timestamp": "2026-03-09T22:00:00Z"
}
```

**Implementation:**
```typescript
// src/app/api/health/events/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { healthMonitor } from '@/services/health-monitor';

export async function POST(req: NextRequest) {
  const event = await req.json();
  
  // Process event (update metrics, detect loops, etc.)
  healthMonitor.processEvent(event);
  
  return NextResponse.json({ success: true });
}
```

---

## Auto-Refresh Strategy

Dashboard polls `/api/health` every 5 seconds for live updates.

Alternative (Phase 2): WebSocket connection for real-time push updates.
