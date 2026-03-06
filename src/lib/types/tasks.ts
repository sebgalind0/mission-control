export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assignee: string;
  tag?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  files?: TaskFile[];
  comments?: TaskComment[];
  history?: TaskHistoryEntry[];
  department?: string;
  deadline?: string;
}

export interface TaskFile {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TaskComment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface TaskHistoryEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

export interface TaskAnalytics {
  tasksToday: number;
  tasksThisWeek: number;
  completionRate: number;
  avgTimeInReview: number;
  blockedTasks: number;
}

export interface Agent {
  id: string;
  name: string;
  color: string;
  initial: string;
  department?: string;
}
