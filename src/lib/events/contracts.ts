export const TASK_EVENT_TYPES = [
  'task.created',
  'task.updated',
  'task.status_changed',
  'task.completed',
  'task.review_requested',
  'task.approved',
  'task.rejected',
] as const;

export type TaskEventType = (typeof TASK_EVENT_TYPES)[number];

export interface TaskEventPayload {
  taskId: string;
  title: string;
  assignee: string;
  status: string;
  previousStatus?: string;
  priority?: string;
  tag?: string | null;
  requiresApproval?: boolean;
  actor?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface DomainEvent {
  id?: string;
  type: TaskEventType;
  timestamp?: string;
  sessionKey?: string | null;
  data: TaskEventPayload;
}
