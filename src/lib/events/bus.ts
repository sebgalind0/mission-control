import type { DomainEvent } from '@/lib/events/contracts';

type EventHandler = (event: DomainEvent) => void;

interface DomainEventBus {
  subscribe: (handler: EventHandler) => () => void;
  emit: (event: DomainEvent) => void;
}

const globalForEventBus = globalThis as unknown as {
  domainEventBus?: {
    handlers: Set<EventHandler>;
  };
};

if (!globalForEventBus.domainEventBus) {
  globalForEventBus.domainEventBus = {
    handlers: new Set<EventHandler>(),
  };
}

const busState = globalForEventBus.domainEventBus;

export const eventBus: DomainEventBus = {
  subscribe(handler: EventHandler) {
    busState.handlers.add(handler);
    return () => {
      busState.handlers.delete(handler);
    };
  },
  emit(event: DomainEvent) {
    for (const handler of busState.handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('[EVENT_BUS_HANDLER_ERROR]', error);
      }
    }
  },
};
