import { Status } from '@prisma/client';

/**
 * Auto-routing logic: scan description for keywords that require approval
 */
export function shouldRequireApproval(description: string, requiresApproval?: boolean): boolean {
  if (requiresApproval !== undefined) return requiresApproval;
  
  const keywords = ['post', 'send', 'publish', 'email', 'tweet', 'message', 'announce'];
  const lowerDesc = description.toLowerCase();
  
  return keywords.some(keyword => lowerDesc.includes(keyword));
}

/**
 * Determine initial status based on approval requirements
 */
export function determineInitialStatus(description: string, requiresApproval?: boolean): Status {
  return shouldRequireApproval(description, requiresApproval) ? Status.REVIEW : Status.BACKLOG;
}

/**
 * Event emitter for real-time notifications
 * In production, this would integrate with WebSockets or a message queue
 */
type NotificationEvent = {
  type: 'task_review' | 'task_approved' | 'task_rejected' | 'task_commented' | 'task_updated';
  taskId: string;
  recipientId: string;
  message: string;
  data?: any;
};

const notifications: NotificationEvent[] = [];

export function emitNotification(event: NotificationEvent) {
  notifications.push(event);
  console.log('[NOTIFICATION]', event);
  
  // TODO: Integrate with real-time system (WebSockets, Pusher, Ably, etc.)
  // For now, notifications are logged and stored in memory
}

export function getRecentNotifications(limit = 50): NotificationEvent[] {
  return notifications.slice(-limit);
}
