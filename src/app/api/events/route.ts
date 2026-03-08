import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();

    // Validate event structure
    if (!event.type || !event.timestamp) {
      return NextResponse.json(
        { error: 'Invalid event: missing type or timestamp' },
        { status: 400 }
      );
    }

    // Store the event in the database
    const stored = await prisma.event.create({
      data: {
        type: event.type,
        sessionKey: event.sessionKey || null,
        timestamp: new Date(event.timestamp),
        data: event.data || {},
      },
    });

    return NextResponse.json({ success: true, id: stored.id });
  } catch (error) {
    console.error('Failed to store event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return recent events (for testing)
    const events = await prisma.event.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
