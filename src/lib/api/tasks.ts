import type { Task, TaskAnalytics } from '@/lib/types/tasks';

// Transform Prisma response to frontend format
function transformTask(task: any): Task {
  return {
    ...task,
    status: task.status?.toLowerCase().replace('_', '-') || 'backlog',
    priority: task.priority?.toLowerCase() || 'medium',
    comments: task.comments?.map((c: any) => ({
      id: c.id,
      text: c.content,
      author: c.author,
      createdAt: c.createdAt,
    })) || [],
  };
}

// Transform frontend format to Prisma format
function toApiFormat(updates: Partial<Task>): any {
  const apiUpdates: any = { ...updates };
  if (updates.status) {
    apiUpdates.status = updates.status.toUpperCase().replace('-', '_');
  }
  if (updates.priority) {
    apiUpdates.priority = updates.priority.toUpperCase();
  }
  return apiUpdates;
}

export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await fetch('/api/tasks', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const data = await response.json();
    return (data.tasks || []).map(transformTask);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

export async function fetchTaskAnalytics(): Promise<TaskAnalytics> {
  try {
    const response = await fetch('/api/tasks/analytics', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch analytics');
    const data = await response.json();
    return {
      tasksToday: data.tasksToday || 0,
      tasksThisWeek: data.tasksThisWeek || 0,
      completionRate: data.completionPercentage || 0,
      avgTimeInReview: data.avgReviewTimeHours || 0,
      blockedTasks: Array.isArray(data.blockedTasks) ? data.blockedTasks.length : 0,
    };
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

export async function approveTask(taskId: string, approvedBy: string = 'Seb'): Promise<void> {
  const response = await fetch(`/api/tasks/${taskId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approvedBy }),
  });
  if (!response.ok) throw new Error('Failed to approve task');
}

export async function rejectTask(taskId: string, reason: string, rejectedBy: string = 'Seb'): Promise<void> {
  const response = await fetch(`/api/tasks/${taskId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rejectionReason: reason, rejectedBy }),
  });
  if (!response.ok) throw new Error('Failed to reject task');
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toApiFormat(updates)),
  });
  if (!response.ok) throw new Error('Failed to update task');
}

export async function deleteTask(taskId: string): Promise<void> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to delete task');
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toApiFormat(task)),
  });
  if (!response.ok) throw new Error('Failed to create task');
  const data = await response.json();
  return transformTask(data.task);
}

export async function addComment(taskId: string, text: string, author: string = 'Seb'): Promise<void> {
  const response = await fetch(`/api/tasks/${taskId}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: text, author }),
  });
  if (!response.ok) throw new Error('Failed to add comment');
}
