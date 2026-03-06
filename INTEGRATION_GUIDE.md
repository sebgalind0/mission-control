# Frontend Integration Guide

## Quick Start

The backend API is **live and ready** for frontend integration.

### API Client Setup

Create a reusable API client:

```typescript
// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const taskApi = {
  // Get all tasks (with optional filters)
  getTasks: async (params?: {
    filter?: 'review' | 'overdue';
    agent?: string;
    priority?: 'high' | 'medium' | 'low';
    status?: 'backlog' | 'in-progress' | 'review' | 'done';
  }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/tasks${query ? '?' + query : ''}`);
    return res.json();
  },

  // Get single task
  getTask: async (id: string) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`);
    return res.json();
  },

  // Create task
  createTask: async (data: {
    title: string;
    description: string;
    assignee: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    tag?: string;
    deadline?: string;
    requiresApproval?: boolean;
  }) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Update task
  updateTask: async (id: string, data: Partial<{
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'BACKLOG' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    assignee: string;
    tag: string;
    deadline: string;
    requiresApproval: boolean;
  }>) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Approve task
  approveTask: async (id: string, approvedBy: string) => {
    const res = await fetch(`${API_BASE}/tasks/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy }),
    });
    return res.json();
  },

  // Reject task
  rejectTask: async (id: string, rejectedBy: string, rejectionReason: string) => {
    const res = await fetch(`${API_BASE}/tasks/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejectedBy, rejectionReason }),
    });
    return res.json();
  },

  // Add comment
  addComment: async (id: string, author: string, content: string) => {
    const res = await fetch(`${API_BASE}/tasks/${id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, content }),
    });
    return res.json();
  },

  // Delete task
  deleteTask: async (id: string) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Get analytics
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/tasks/analytics`);
    return res.json();
  },

  // Get leaderboard
  getLeaderboard: async () => {
    const res = await fetch(`${API_BASE}/tasks/leaderboard`);
    return res.json();
  },
};
```

---

## Update Existing TaskBoard Component

Replace mock data with real API calls:

```typescript
// src/components/screens/TaskBoard.tsx
'use client';

import { useEffect, useState } from 'react';
import { taskApi } from '@/lib/api';

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const data = await taskApi.getTasks();
    setTasks(data.tasks);
    setLoading(false);
  };

  // Group tasks by status
  const columns = {
    backlog: tasks.filter(t => t.status === 'BACKLOG'),
    'in-progress': tasks.filter(t => t.status === 'IN_PROGRESS'),
    review: tasks.filter(t => t.status === 'REVIEW'),
    done: tasks.filter(t => t.status === 'DONE'),
  };

  if (loading) return <div>Loading tasks...</div>;

  // ... rest of render logic
}
```

---

## Approvals Screen Integration

```typescript
// src/components/screens/Approvals.tsx
'use client';

import { useEffect, useState } from 'react';
import { taskApi } from '@/lib/api';

export default function Approvals() {
  const [reviewTasks, setReviewTasks] = useState([]);

  useEffect(() => {
    loadReviewTasks();
  }, []);

  const loadReviewTasks = async () => {
    const data = await taskApi.getTasks({ filter: 'review' });
    setReviewTasks(data.tasks);
  };

  const handleApprove = async (taskId: string) => {
    await taskApi.approveTask(taskId, 'seb');
    loadReviewTasks(); // Refresh list
  };

  const handleReject = async (taskId: string, reason: string) => {
    await taskApi.rejectTask(taskId, 'seb', reason);
    loadReviewTasks(); // Refresh list
  };

  return (
    <div>
      {reviewTasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <button onClick={() => handleApprove(task.id)}>
            ✅ Approve
          </button>
          <button onClick={() => {
            const reason = prompt('Rejection reason:');
            if (reason) handleReject(task.id, reason);
          }}>
            ❌ Reject
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Analytics Dashboard Integration

```typescript
// src/components/screens/Analytics.tsx
'use client';

import { useEffect, useState } from 'react';
import { taskApi } from '@/lib/api';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [analyticsData, leaderboardData] = await Promise.all([
      taskApi.getAnalytics(),
      taskApi.getLeaderboard(),
    ]);
    setAnalytics(analyticsData);
    setLeaderboard(leaderboardData);
  };

  if (!analytics || !leaderboard) return <div>Loading...</div>;

  return (
    <div>
      <h2>Task Analytics</h2>
      <div>
        <p>Tasks Today: {analytics.tasksToday}</p>
        <p>Tasks This Week: {analytics.tasksThisWeek}</p>
        <p>Completion Rate: {analytics.completionPercentage}%</p>
        <p>Avg Review Time: {analytics.avgReviewTimeHours}h</p>
      </div>

      <h2>Leaderboard</h2>
      {leaderboard.leaderboard.map(agent => (
        <div key={agent.assignee}>
          <p>{agent.assignee}: {agent.completionRate}% completion</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Real-Time Updates (Future)

When WebSocket support is added, wrap components with:

```typescript
// src/providers/TaskUpdatesProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const TaskUpdatesContext = createContext({
  subscribe: (callback: (event: any) => void) => {},
  unsubscribe: (callback: (event: any) => void) => {},
});

export function TaskUpdatesProvider({ children }) {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket server (when implemented)
    // const socket = new WebSocket('ws://localhost:3000/ws');
    // setWs(socket);
    
    return () => {
      ws?.close();
    };
  }, []);

  return (
    <TaskUpdatesContext.Provider value={{ subscribe: () => {}, unsubscribe: () => {} }}>
      {children}
    </TaskUpdatesContext.Provider>
  );
}

export const useTaskUpdates = () => useContext(TaskUpdatesContext);
```

---

## Type Definitions

```typescript
// src/types/task.ts
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'BACKLOG' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignee: string;
  tag?: string;
  requiresApproval: boolean;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  taskId: string;
  createdAt: string;
}

export interface Analytics {
  tasksToday: number;
  tasksThisWeek: number;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  avgReviewTimeHours: number;
  tasksInReview: Array<{
    id: string;
    title: string;
    assignee: string;
    createdAt: string;
    updatedAt: string;
  }>;
  blockedTasks: Array<{
    id: string;
    title: string;
    assignee: string;
    status: Status;
    updatedAt: string;
    blockedForHours: number;
  }>;
}

export interface LeaderboardEntry {
  assignee: string;
  totalTasks: number;
  completedTasks: number;
  tasksInReview: number;
  approvedTasks: number;
  rejectedTasks: number;
  completionRate: number;
  avgApprovalTimeHours: number;
  approvalCount: number;
}
```

---

## Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Testing Frontend Integration

1. Start backend: `npm run dev` (already running)
2. Test API client in browser console:
   ```javascript
   const { taskApi } = await import('./src/lib/api');
   const tasks = await taskApi.getTasks();
   console.log(tasks);
   ```

3. Test in component:
   ```typescript
   useEffect(() => {
     taskApi.getAnalytics().then(console.log);
   }, []);
   ```

---

## Migration Checklist

- [ ] Create `src/lib/api.ts` with API client
- [ ] Create `src/types/task.ts` with type definitions
- [ ] Update `TaskBoard.tsx` to fetch from API
- [ ] Update `Approvals.tsx` with approve/reject handlers
- [ ] Update `Analytics.tsx` to fetch real data
- [ ] Add loading states and error handling
- [ ] Test all CRUD operations
- [ ] Test auto-routing on task creation
- [ ] Test approval workflow
- [ ] Add optimistic UI updates (optional)

---

**Status:** Backend ready, frontend integration can begin immediately! 🚀
