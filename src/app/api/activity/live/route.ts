import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// SSE endpoint for real-time activity stream
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      let lastCheck = new Date();
      
      // Send initial ping
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      );
      
      // Poll for new events every 2 seconds
      const interval = setInterval(async () => {
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
            lastCheck = new Date();
            
            for (const event of newEvents) {
              const data = {
                type: 'activity',
                id: event.id,
                agent: event.agent,
                action: event.action,
                metadata: event.metadata,
                timestamp: event.timestamp.toISOString(),
              };
              
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
              );
            }
          }
          
          // Send keepalive ping every 30 seconds
          if (Date.now() % 30000 < 2000) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'ping' })}\n\n`)
            );
          }
        } catch (error) {
          console.error('SSE error:', error);
          controller.error(error);
        }
      }, 2000);
      
      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
