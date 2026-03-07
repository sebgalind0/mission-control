# Task Board Backend API Documentation

## Overview
Backend API for Mission Control Task Board with approval workflow, analytics, and real-time notifications.

**Stack:**
- Next.js 16 (App Router)
- TypeScript
- PostgreSQL (via Prisma dev)
- Prisma ORM v7

**Base URL:** `http://localhost:3000/api`

---

## Endpoints

### 1. **POST** `/tasks/:id/approve`
Move task to Done, log approval, notify agent.

**Request Body:**
```json
{
  "approvedBy": "seb"
}
```

**Response:**
```json
{
  "success": true,
  "task": { /* full task object */ },
  "message": "Task approved and moved to Done"
}
```

**Notifications:**
- Sends notification to task assignee

---

### 2. **POST** `/tasks/:id/reject`
Move task to In Progress, save rejection reason, notify agent.

**Request Body:**
```json
{
  "rejectedBy": "seb",
  "rejectionReason": "Needs more detail in the intro"
}
```

**Response:**
```json
{
  "success": true,
  "task": { /* full task object */ },
  "message": "Task rejected and moved to In Progress"
}
```

**Notifications:**
- Sends notification to task assignee with rejection reason

---

### 3. **GET** `/tasks/analytics`
Aggregate task metrics and performance data.

**Response:**
```json
{
  "tasksToday": 12,
  "tasksThisWeek": 45,
  "totalTasks": 120,
  "completedTasks": 80,
  "completionPercentage": 67,
  "avgReviewTimeHours": 2.3,
  "tasksInReview": [
    {
      "id": "...",
      "title": "Email draft",
      "assignee": "main",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "blockedTasks": [
    {
      "id": "...",
      "title": "Stuck task",
      "assignee": "main",
      "status": "IN_PROGRESS",
      "updatedAt": "...",
      "blockedForHours": 36
    }
  ]
}
```

**Metrics:**
- `tasksToday`: Tasks created since midnight
- `tasksThisWeek`: Tasks created in last 7 days
- `completionPercentage`: (completedTasks / totalTasks) * 100
- `avgReviewTimeHours`: Average time from creation to approval/rejection
- `blockedTasks`: Tasks not updated in >24 hours (excluding Done)

---

### 4. **GET** `/tasks/leaderboard`
Agent performance rankings.

**Response:**
```json
{
  "leaderboard": [
    {
      "assignee": "main",
      "totalTasks": 50,
      "completedTasks": 40,
      "tasksInReview": 2,
      "approvedTasks": 35,
      "rejectedTasks": 5,
      "completionRate": 80,
      "avgApprovalTimeHours": 1.5,
      "approvalCount": 35
    }
  ],
  "topPerformer": { /* agent with highest completion rate */ }
}
```

**Sorting:**
1. By completion rate (descending)
2. Tie-breaker: faster avg approval time

---

### 5. **POST** `/tasks/:id/comment`
Add comment to task.

**Request Body:**
```json
{
  "author": "seb",
  "content": "Great work! Just one more revision needed."
}
```

**Response:**
```json
{
  "success": true,
  "comment": { /* comment object */ },
  "task": { /* full task with all comments */ }
}
```

**Notifications:**
- Notifies task assignee (if commenter ≠ assignee)

---

### 6. **PATCH** `/tasks/:id`
Update task (edit, reassign, set deadline).

**Request Body (partial updates):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "assignee": "popeye",
  "tag": "Health",
  "deadline": "2026-03-10T12:00:00Z",
  "requiresApproval": true
}
```

**Response:**
```json
{
  "success": true,
  "task": { /* updated task object */ }
}
```

**Auto-Routing:**
- If `description` changes and contains keywords ("post", "send", "publish", "email"), automatically sets `requiresApproval: true` and `status: REVIEW`

**Notifications:**
- Notifies on reassignment or status change

---

### 7. **GET** `/tasks`
Filtered task lists.

**Query Parameters:**
- `filter`: `review` | `overdue` | (none)
- `agent`: Agent ID (e.g., `main`, `popeye`)
- `dept`: Department name (placeholder)
- `priority`: `high` | `medium` | `low`
- `status`: `backlog` | `in-progress` | `review` | `done`

**Examples:**
```bash
GET /tasks?filter=review
GET /tasks?agent=main&priority=high
GET /tasks?filter=overdue
GET /tasks?status=in-progress
```

**Response:**
```json
{
  "tasks": [ /* array of task objects */ ],
  "count": 5
}
```

---

### 8. **POST** `/tasks`
Create new task.

**Request Body:**
```json
{
  "title": "Email client about project status",
  "description": "Send update email to John regarding Q1 deliverables",
  "priority": "HIGH",
  "assignee": "main",
  "tag": "Communication",
  "deadline": "2026-03-08T17:00:00Z",
  "requiresApproval": false
}
```

**Response:**
```json
{
  "success": true,
  "task": { /* created task object */ },
  "message": "Task created and routed to Review"
}
```

**Auto-Routing Logic:**
1. Scans `description` for keywords: `["post", "send", "publish", "email", "tweet", "message", "announce"]`
2. If keyword match OR `requiresApproval: true` → sets `status: REVIEW`
3. Otherwise → sets `status: BACKLOG`

**Notifications:**
- Notifies assignee
- If auto-routed to Review, also notifies Seb (approval required)

---

### 9. **GET** `/tasks/:id`
Get single task with comments.

**Response:**
```json
{
  "task": {
    "id": "...",
    "title": "...",
    "description": "...",
    "priority": "HIGH",
    "status": "REVIEW",
    "assignee": "main",
    "tag": "Engineering",
    "requiresApproval": true,
    "approvedBy": null,
    "rejectedBy": null,
    "rejectionReason": null,
    "approvedAt": null,
    "rejectedAt": null,
    "deadline": "2026-03-08T12:00:00.000Z",
    "createdAt": "...",
    "updatedAt": "...",
    "comments": [
      {
        "id": "...",
        "content": "Looking good!",
        "author": "seb",
        "createdAt": "..."
      }
    ]
  }
}
```

---

### 10. **DELETE** `/tasks/:id`
Delete task (cascades to comments).

**Response:**
```json
{
  "success": true,
  "message": "Task deleted"
}
```

---

## Data Model

### Task
```typescript
{
  id: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "BACKLOG" | "IN_PROGRESS" | "REVIEW" | "DONE";
  assignee: string;
  tag?: string;
  
  // Approval workflow
  requiresApproval: boolean;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  
  // Task management
  deadline?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  comments: Comment[];
}
```

### Comment
```typescript
{
  id: string;
  content: string;
  author: string;
  taskId: string;
  createdAt: Date;
}
```

---

## Notification System

**Current Implementation:**
- Event-driven in-memory notification queue
- Logs to console: `[NOTIFICATION] { type, taskId, recipientId, message, data }`

**Notification Types:**
- `task_review`: Task requires approval
- `task_approved`: Task approved
- `task_rejected`: Task rejected with reason
- `task_commented`: New comment added
- `task_updated`: Task reassigned or status changed

**Production Integration:**
- WebSocket server (Socket.io, Pusher, Ably)
- Message queue (Redis, RabbitMQ)
- Real-time database listeners (Supabase Realtime, Firebase)

---

## Auto-Routing Keywords

Tasks containing these keywords are automatically routed to **Review** status:
- `post`
- `send`
- `publish`
- `email`
- `tweet`
- `message`
- `announce`

**Override:** Set `requiresApproval: false` explicitly to bypass auto-routing.

---

## Development

### Start Services
```bash
# Terminal 1: Start Prisma dev database
npx prisma dev

# Terminal 2: Start Next.js dev server
npm run dev
```

### Seed Database
```bash
npx tsx src/lib/seedTasks.ts
```

### Database Management
```bash
# Push schema changes
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

---

## Example Workflow

### 1. Agent creates task with "send email"
```bash
POST /api/tasks
{
  "title": "Send client proposal",
  "description": "Send updated proposal to client via email",
  "assignee": "main",
  "priority": "HIGH"
}
```
→ Auto-routed to **Review** (keyword: "send", "email")

### 2. Seb reviews and rejects
```bash
POST /api/tasks/:id/reject
{
  "rejectedBy": "seb",
  "rejectionReason": "Pricing section needs revision"
}
```
→ Moved to **In Progress**, agent notified

### 3. Agent updates & adds comment
```bash
PATCH /api/tasks/:id
{ "description": "Send updated proposal with new pricing" }

POST /api/tasks/:id/comment
{ "author": "main", "content": "Updated pricing, ready for review" }
```
→ Back to **Review** (auto-routing), Seb notified

### 4. Seb approves
```bash
POST /api/tasks/:id/approve
{ "approvedBy": "seb" }
```
→ Moved to **Done**, agent notified

---

## Testing

All endpoints tested and working ✅

```bash
# Get all tasks
curl http://localhost:3000/api/tasks

# Filter by review status
curl http://localhost:3000/api/tasks?filter=review

# Get analytics
curl http://localhost:3000/api/tasks/analytics

# Get leaderboard
curl http://localhost:3000/api/tasks/leaderboard

# Create task with auto-routing
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Send newsletter","description":"Publish weekly update","assignee":"main","priority":"HIGH"}'

# Approve task
curl -X POST http://localhost:3000/api/tasks/:id/approve \
  -H "Content-Type: application/json" \
  -d '{"approvedBy":"seb"}'

# Reject task
curl -X POST http://localhost:3000/api/tasks/:id/reject \
  -H "Content-Type: application/json" \
  -d '{"rejectedBy":"seb","rejectionReason":"Needs more detail"}'

# Add comment
curl -X POST http://localhost:3000/api/tasks/:id/comment \
  -H "Content-Type: application/json" \
  -d '{"author":"seb","content":"Great work!"}'

# Update task
curl -X PATCH http://localhost:3000/api/tasks/:id \
  -H "Content-Type: application/json" \
  -d '{"priority":"HIGH","deadline":"2026-03-10T12:00:00Z"}'
```

---

## Next Steps

### Phase 2 Enhancements:
1. **WebSocket Integration:** Real-time UI updates
2. **Email Notifications:** SendGrid/Resend for approval alerts
3. **Department Mapping:** Agent-to-department relationships
4. **Recurring Tasks:** Cron-style task scheduling
5. **Task Templates:** Pre-filled task blueprints
6. **File Attachments:** Upload supporting docs to tasks
7. **Task Dependencies:** Block tasks until prerequisites complete
8. **Time Tracking:** Log hours spent per task
9. **Audit Log:** Track all task state changes
10. **Search/Filters:** Full-text search across tasks

---

**Built by:** Bolt ⚡  
**Date:** 2026-03-06  
**Status:** All endpoints live and tested ✅

---

## Analytics API Extensions

### **GET** `/api/analytics/models`
Model usage analytics across agents.

**Response:**
```json
{
  "modelUsage": [
    {
      "agent": "rick",
      "model": "anthropic/claude-sonnet-4-5",
      "tokensUsed": 25000,
      "cost": 0.125
    },
    {
      "agent": "bolt",
      "model": "anthropic/claude-sonnet-4-5",
      "tokensUsed": 18500,
      "cost": 0.093
    }
  ],
  "summary": {
    "totalTokens": 43500,
    "totalCost": 0.22,
    "uniqueModels": 1,
    "uniqueAgents": 2
  }
}
```

**Metrics:**
- `tokensUsed`: Total tokens consumed by agent/model pair
- `cost`: Estimated cost in USD
- Sorted by cost (descending)

---

### **GET** `/api/analytics/embeddings`
Embeddings usage tracking (Wispr Flow, OpenAI).

**Response:**
```json
{
  "embeddingsUsage": [
    {
      "service": "OpenAI",
      "requests": 150,
      "tokens": 230400,
      "cost": 0.0230
    },
    {
      "service": "Wispr Flow",
      "requests": 30,
      "tokens": 46080,
      "cost": 0.0046
    }
  ],
  "summary": {
    "totalRequests": 180,
    "totalTokens": 276480,
    "totalCost": 0.0276,
    "avgTokensPerRequest": 1536,
    "requestsThisWeek": 45
  },
  "breakdown": {
    "byService": [ /* same as embeddingsUsage */ ],
    "period": {
      "start": "2026-02-27T19:52:00.000Z",
      "end": "2026-03-06T19:52:00.000Z"
    }
  }
}
```

**Metrics:**
- `requests`: Number of embedding calls
- `tokens`: Total tokens embedded
- `cost`: Estimated cost ($0.0001 per 1K tokens)

---

### **GET** `/api/analytics/agents/:id`
Detailed agent performance metrics.

**Example:** `/api/analytics/agents/bolt`

**Response:**
```json
{
  "agent": "bolt",
  "performance": {
    "completionRate": 85,
    "avgTaskTimeHours": 3.5,
    "tokensUsed": 18500,
    "cost": 0.09
  },
  "tasks": {
    "total": 40,
    "completed": 34,
    "active": 2,
    "statusBreakdown": {
      "backlog": 2,
      "inProgress": 2,
      "review": 2,
      "done": 34
    }
  },
  "recentPerformance": {
    "tasksThisWeek": 8,
    "completedThisWeek": 7,
    "completionRateThisWeek": 88
  },
  "deadlines": {
    "totalWithDeadlines": 15,
    "onTime": 13,
    "onTimeRate": 87
  },
  "activeWork": [
    {
      "task": "Build analytics backend",
      "progress": 75,
      "duration": 12
    }
  ]
}
```

**Metrics:**
- `completionRate`: % of tasks completed
- `avgTaskTimeHours`: Average time from creation to completion
- `tokensUsed`: Aggregate tokens from activity logs
- `cost`: Estimated model usage cost
- `onTimeRate`: % of deadlines met

---

