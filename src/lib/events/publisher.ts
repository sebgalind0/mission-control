import { prisma } from '@/lib/prisma';
import type { DomainEvent } from '@/lib/events/contracts';
import { eventBus } from '@/lib/events/bus';

export async function publishDomainEvent(event: DomainEvent): Promise<void> {
  const timestamp = event.timestamp ?? new Date().toISOString();
  const normalizedEvent: DomainEvent = {
    ...event,
    timestamp,
  };

  await prisma.event.create({
    data: {
      type: normalizedEvent.type,
      sessionKey: normalizedEvent.sessionKey ?? null,
      timestamp: new Date(timestamp),
      data: JSON.parse(JSON.stringify(normalizedEvent.data)),
    },
  });

  await prisma.activityEvent.create({
    data: {
      agent: normalizedEvent.data.assignee ?? 'system',
      action: normalizedEvent.type,
      metadata: JSON.parse(JSON.stringify(normalizedEvent.data)),
      timestamp: new Date(timestamp),
    },
  });

  eventBus.emit(normalizedEvent);
}
