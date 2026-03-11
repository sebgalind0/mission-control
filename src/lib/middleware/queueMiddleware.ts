export type QueueLogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface QueueLogEvent {
  level: QueueLogLevel;
  message: string;
  context?: Record<string, unknown>;
}

export interface QueueMiddlewareOptions<T> {
  name: string;
  concurrency?: number;
  maxRetries?: number;
  retryBaseDelayMs?: number;
  maxQueueSize?: number;
  logger?: (event: QueueLogEvent) => void;
  processor: (item: T) => Promise<void>;
}

interface QueueItem<T> {
  payload: T;
  attempt: number;
  enqueuedAt: number;
}

export interface QueueStats {
  name: string;
  queued: number;
  inFlight: number;
  processed: number;
  failed: number;
  retried: number;
}

export interface QueueMiddleware<T> {
  enqueue: (payload: T) => void;
  enqueueMany: (payloads: T[]) => void;
  getStats: () => QueueStats;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeBackoffDelay(baseDelayMs: number, attempt: number): number {
  const exponential = baseDelayMs * Math.pow(2, Math.max(0, attempt - 1));
  const jitter = Math.floor(Math.random() * 50);
  return exponential + jitter;
}

export function createQueueMiddleware<T>(options: QueueMiddlewareOptions<T>): QueueMiddleware<T> {
  const {
    name,
    processor,
    logger,
    concurrency = 2,
    maxRetries = 3,
    retryBaseDelayMs = 150,
    maxQueueSize = 1000,
  } = options;

  const queue: QueueItem<T>[] = [];
  let inFlight = 0;
  let processed = 0;
  let failed = 0;
  let retried = 0;

  const log = (event: QueueLogEvent) => {
    if (logger) {
      logger(event);
      return;
    }

    const prefix = `[QUEUE:${name}]`;
    if (event.level === 'error') {
      console.error(prefix, event.message, event.context ?? '');
    } else if (event.level === 'warn') {
      console.warn(prefix, event.message, event.context ?? '');
    } else {
      console.log(prefix, event.message, event.context ?? '');
    }
  };

  const processLoop = async (): Promise<void> => {
    if (inFlight >= concurrency) return;

    const next = queue.shift();
    if (!next) return;

    inFlight += 1;

    try {
      await processor(next.payload);
      processed += 1;
    } catch (error) {
      if (next.attempt < maxRetries) {
        retried += 1;
        const nextAttempt = next.attempt + 1;
        const delay = computeBackoffDelay(retryBaseDelayMs, nextAttempt);

        log({
          level: 'warn',
          message: 'Processor failed, scheduling retry',
          context: {
            attempt: nextAttempt,
            maxRetries,
            delay,
            error: error instanceof Error ? error.message : String(error),
          },
        });

        await sleep(delay);
        queue.push({ ...next, attempt: nextAttempt });
      } else {
        failed += 1;
        log({
          level: 'error',
          message: 'Processor failed permanently',
          context: {
            maxRetries,
            enqueuedAt: next.enqueuedAt,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    } finally {
      inFlight -= 1;

      // Keep pipeline moving with low overhead.
      while (inFlight < concurrency && queue.length > 0) {
        void processLoop();
      }
    }
  };

  const enqueue = (payload: T): void => {
    if (queue.length >= maxQueueSize) {
      failed += 1;
      log({
        level: 'error',
        message: 'Queue is full, dropping payload',
        context: { maxQueueSize },
      });
      return;
    }

    queue.push({
      payload,
      attempt: 0,
      enqueuedAt: Date.now(),
    });

    while (inFlight < concurrency && queue.length > 0) {
      void processLoop();
    }
  };

  const enqueueMany = (payloads: T[]): void => {
    for (const payload of payloads) {
      enqueue(payload);
    }
  };

  const getStats = (): QueueStats => ({
    name,
    queued: queue.length,
    inFlight,
    processed,
    failed,
    retried,
  });

  return {
    enqueue,
    enqueueMany,
    getStats,
  };
}
