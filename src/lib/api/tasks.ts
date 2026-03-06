import type { Task, TaskAnalytics } from '@/lib/types/tasks';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await fetch(`${API_BASE}/api/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

export async function fetchTaskAnalytics(): Promise<TaskAnalytics> {
  try {
    const response = await fetch(`${API_BASE}/api/tasks/analytics`);
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      tasksToday: 0,
      tasksThisWeek: 0,
      completionRate: 0,
      avgTimeInReview: 0,
      blockedTasks: 0,
    };
  }
}

export async function approveTask(taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to approve task');
}

export async function rejectTask(taskId: string, reason: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) throw new Error('Failed to reject task');
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update task');
}

export async function addComment(taskId: string, text: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error('Failed to add comment');
}
