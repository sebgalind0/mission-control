import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { eventBus } from '@/lib/events/bus';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// SSE endpoint for real-time activity stream
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastCheck = new Date();
      let isClosed = false;

      const sendEvent = (payload: Record<string, unknown>) => {
        if (isClosed) return;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
        );
      };

      // Send initial ping
      sendEvent({ type: 'connected' });

      // Primary path: push updates from in-memory event bus
      const unsubscribe = eventBus.subscribe((event) => {
        sendEvent({
          type: 'activity',
          action: event.type,
          metadata: event.data,
          timestamp: event.timestamp ?? new Date().toISOString(),
        });
      });

      // Fallback recovery poll every 30 seconds
      const recoveryInterval = setInterval(async () => {
        try {
          const newEvents = await prisma.activityEvent.findMany({
            where: {
              timestamp: {
                gt: lastCheck,
              },
            },
            orderBy: {
              timestamp: 'asc',
            },
          });

          if (newEvents.length > 0) {
            lastCheck = newEvents[newEvents.length - 1].timestamp;

            for (const event of newEvents) {
              sendEvent({
                type: 'activity',
                id: event.id,
                agent: event.agent,
                action: event.action,
                metadata: event.metadata,
                timestamp: event.timestamp.toISOString(),
              });
            }
          }

          sendEvent({ type: 'ping' });
        } catch (error) {
          console.error('SSE recovery error:', error);
        }
      }, 30000);

      const closeStream = () => {
        if (isClosed) return;
        isClosed = true;
        unsubscribe();
        clearInterval(recoveryInterval);
        controller.close();
      };

      // Cleanup on disconnect
      request.signal.addEventListener('abort', closeStream);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
