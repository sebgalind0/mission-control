import { Status } from '@prisma/client';
import { createQueueMiddleware } from '@/lib/middleware/queueMiddleware';

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
  data?: unknown;
};

const notifications: NotificationEvent[] = [];

const notificationQueue = createQueueMiddleware<NotificationEvent>({
  name: 'notifications',
  concurrency: 4,
  maxRetries: 3,
  retryBaseDelayMs: 100,
  maxQueueSize: 5000,
  processor: async (event) => {
    notifications.push(event);

    // Keep memory bounded while preserving latest events.
    if (notifications.length > 1000) {
      notifications.splice(0, notifications.length - 1000);
    }

    console.log('[NOTIFICATION]', {
      type: event.type,
      taskId: event.taskId,
      recipientId: event.recipientId,
      timestamp: new Date().toISOString(),
    });
  },
});

export function emitNotification(event: NotificationEvent) {
  notificationQueue.enqueue(event);
}

export function getRecentNotifications(limit = 50): NotificationEvent[] {
  return notifications.slice(-Math.max(1, limit));
}

export function getNotificationQueueStats() {
  return notificationQueue.getStats();
}
