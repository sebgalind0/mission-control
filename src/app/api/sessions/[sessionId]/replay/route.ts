import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

interface TranscriptEvent {
  type: string;
  id: string;
  parentId?: string;
  timestamp: string;
  message?: any;
  customType?: string;
  data?: any;
}

interface TimelineEvent {
  id: string;
  type: 'thinking' | 'text' | 'tool_call' | 'tool_result' | 'user_message';
  timestamp: string;
  elapsedMs: number;
  content: string;
  metadata?: any;
  toolName?: string;
  toolArgs?: any;
  toolResult?: any;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    // Find the transcript file
    const homeDir = os.homedir();
    const sessionsDir = path.join(homeDir, '.openclaw/agents/larry/sessions');
    
    // Read sessions.json to find the transcript file
    const sessionsJsonPath = path.join(sessionsDir, 'sessions.json');
    const sessionsData = JSON.parse(await fs.readFile(sessionsJsonPath, 'utf-8'));
    
    // Find session by ID
    let transcriptFile: string | null = null;
    for (const [sessionKey, data] of Object.entries(sessionsData)) {
      if ((data as any).sessionId === sessionId || sessionKey === sessionId) {
        transcriptFile = (data as any).transcriptFile;
        break;
      }
    }
    
    if (!transcriptFile) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Read transcript
    const transcriptPath = path.join(sessionsDir, path.basename(transcriptFile));
    const transcriptContent = await fs.readFile(transcriptPath, 'utf-8');
    const lines = transcriptContent.trim().split('\n');
    
    // Parse events
    const events: TranscriptEvent[] = lines.map(line => JSON.parse(line));
    
    // Find session start time
    const sessionEvent = events.find(e => e.type === 'session');
    if (!sessionEvent) {
      return NextResponse.json(
        { error: 'Invalid transcript: no session event' },
        { status: 400 }
      );
    }
    
    const sessionStart = new Date(sessionEvent.timestamp).getTime();
    
    // Build timeline
    const timeline: TimelineEvent[] = [];
    
    for (const event of events) {
      const elapsedMs = new Date(event.timestamp).getTime() - sessionStart;
      
      if (event.type === 'message' && event.message) {
        const { role, content } = event.message;
        
        if (role === 'user') {
          // User message
          const textContent = content
            .filter((c: any) => c.type === 'text')
            .map((c: any) => c.text)
            .join('\n');
          
          if (textContent.trim()) {
            timeline.push({
              id: event.id,
              type: 'user_message',
              timestamp: event.timestamp,
              elapsedMs,
              content: textContent,
            });
          }
        } else if (role === 'assistant') {
          // Assistant message - extract thinking, text, and tool calls
          for (const block of content) {
            if (block.type === 'thinking') {
              timeline.push({
                id: `${event.id}-thinking`,
                type: 'thinking',
                timestamp: event.timestamp,
                elapsedMs,
                content: block.thinking,
                metadata: {
                  signature: block.thinkingSignature,
                },
              });
            } else if (block.type === 'text') {
              timeline.push({
                id: `${event.id}-text`,
                type: 'text',
                timestamp: event.timestamp,
                elapsedMs,
                content: block.text,
              });
            } else if (block.type === 'toolCall') {
              timeline.push({
                id: `${event.id}-${block.id}`,
                type: 'tool_call',
                timestamp: event.timestamp,
                elapsedMs,
                content: `${block.name}(${JSON.stringify(block.arguments || {})})`,
                toolName: block.name,
                toolArgs: block.arguments || {},
                metadata: {
                  toolCallId: block.id,
                },
              });
            }
          }
        } else if (role === 'toolResult') {
          // Tool result
          const resultText = event.message.content
            .filter((c: any) => c.type === 'text')
            .map((c: any) => c.text)
            .join('\n');
          
          timeline.push({
            id: event.id,
            type: 'tool_result',
            timestamp: event.timestamp,
            elapsedMs,
            content: resultText.slice(0, 500), // Truncate long results
            toolName: event.message.toolName,
            toolResult: event.message.details || {},
            metadata: {
              toolCallId: event.message.toolCallId,
              isError: event.message.isError || false,
            },
          });
        }
      }
    }
    
    // Calculate total duration
    const lastEvent = events[events.length - 1];
    const totalDurationMs = new Date(lastEvent.timestamp).getTime() - sessionStart;
    
    return NextResponse.json({
      sessionId,
      sessionStart: sessionEvent.timestamp,
      totalDurationMs,
      totalEvents: timeline.length,
      timeline,
    });
  } catch (error: any) {
    console.error('Session replay error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load session replay' },
      { status: 500 }
    );
  }
}
