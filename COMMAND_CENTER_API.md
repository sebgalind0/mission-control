# Command Center API Documentation

## Overview
Backend APIs for the Mission Control Command Center, enabling real-time agent activity tracking, command routing, and active work monitoring.

## Endpoints

### 1. Activity Feed API
**GET** `/api/activity/stream?since=<timestamp>`

Returns agent activity events (deployments, tasks completed, status changes).

**Query Parameters:**
- `since` (optional): ISO timestamp to fetch events after this time

**Response:**
```json
[
  {
    "id": "clx123",
    "agent": "Bolt",
    "action": "deployment",
    "timestamp": "2026-03-06T19:45:00.000Z",
    "metadata": {
      "service": "backend-api",
      "status": "success"
    }
  }
]
```

**POST** `/api/activity/stream`

Create a new activity event.

**Request Body:**
```json
{
  "agent": "Bolt",
  "action": "deployment",
  "metadata": {
    "service": "backend-api"
  }
}
```

---

### 2. Command Processing API
**POST** `/api/command/execute`

Parse natural language command and route to appropriate agent(s).

**Request Body:**
```json
{
  "command": "Deploy the backend API to production"
}
```

**Response:**
```json
{
  "status": "received",
  "targetAgents": ["Rick", "Bolt"],
  "response": "Command routed to: Rick, Bolt",
  "command": "Deploy the backend API to production",
  "timestamp": "2026-03-06T19:45:00.000Z"
}
```

**Routing Keywords:**
- **Bolt** (Backend): api, backend, database, prisma
- **Fuse** (Frontend): ui, frontend, component, design
- **Rick** (Deployment): deploy, production, vercel
- **Larry** (Tasks): task, ticket, backlog

---

### 3. Active Work API
**GET** `/api/work/active`

Returns currently running tasks/builds with progress and status.

**Response:**
```json
{
  "tasks": [
    {
      "id": "clx456",
      "agent": "Bolt",
      "task": "Building Command Center API",
      "status": "running",
      "progress": 75,
      "metadata": {
        "endpoint": "/api/activity/stream"
      },
      "startedAt": "2026-03-06T19:30:00.000Z",
      "updatedAt": "2026-03-06T19:45:00.000Z"
    }
  ],
  "blocked": [],
  "paused": [],
  "summary": {
    "total": 1,
    "running": 1,
    "blocked": 0,
    "paused": 0
  }
}
```

**POST** `/api/work/active`

Create new active work entry.

**Request Body:**
```json
{
  "agent": "Bolt",
  "task": "Building backend API",
  "status": "running",
  "progress": 0,
  "metadata": {}
}
```

**PATCH** `/api/work/active`

Update work progress/status.

**Request Body:**
```json
{
  "id": "clx456",
  "status": "running",
  "progress": 75
}
```

**DELETE** `/api/work/active?id=<workId>`

Mark work as completed and remove from active list.

---

## Database Schema

### ActivityEvent
```prisma
model ActivityEvent {
  id        String   @id @default(cuid())
  agent     String
  action    String
  metadata  Json?
  timestamp DateTime @default(now())
}
```

### ActiveWork
```prisma
model ActiveWork {
  id        String   @id @default(cuid())
  agent     String
  task      String
  status    String   // "running", "blocked", "paused"
  progress  Int      @default(0)
  metadata  Json?
  startedAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Setup

1. **Database Migration:**
   ```bash
   cd ~/mission-control
   npx prisma migrate dev --name add_command_center_models
   ```

2. **Start Dev Server:**
   ```bash
   npm run dev
   ```

3. **Test Endpoints:**
   ```bash
   # Create activity event
   curl -X POST http://localhost:3333/api/activity/stream \
     -H "Content-Type: application/json" \
     -d '{"agent":"Bolt","action":"api_created","metadata":{"endpoint":"/api/activity/stream"}}'
   
   # Fetch activity stream
   curl http://localhost:3333/api/activity/stream
   
   # Execute command
   curl -X POST http://localhost:3333/api/command/execute \
     -H "Content-Type: application/json" \
     -d '{"command":"Deploy the backend API"}'
   
   # Get active work
   curl http://localhost:3333/api/work/active
   ```

---

## Status
✅ All three endpoints implemented
✅ TypeScript + Prisma
✅ Full CRUD operations
✅ Activity logging integrated
✅ Command routing logic
