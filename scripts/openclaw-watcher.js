#!/usr/bin/env node

/**
 * OpenClaw → Mission Control Data Pipeline
 * Watches OpenClaw sessions and pipes events to the Command Center
 */

const fs = require('fs');
const path = require('path');

const OPENCLAW_SESSIONS = path.join(
  process.env.HOME,
  '.openclaw/agents/larry/sessions/sessions.json'
);

const SESSIONS_DIR = path.join(
  process.env.HOME,
  '.openclaw/agents/larry/sessions'
);

const MISSION_CONTROL_API = 'http://localhost:3000/api/events';

let lastState = null;
let processedEvents = new Set(); // Track processed event IDs to avoid duplicates

function loadSessions() {
  try {
    const raw = fs.readFileSync(OPENCLAW_SESSIONS, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load sessions.json:', err.message);
    return null;
  }
}

function detectChanges(current) {
  if (!lastState) {
    lastState = current;
    return [];
  }

  const events = [];

  for (const [sessionKey, data] of Object.entries(current)) {
    const prev = lastState[sessionKey];

    // New session
    if (!prev) {
      events.push({
        type: 'session_created',
        sessionKey,
        timestamp: data.updatedAt,
        data: {
          sessionId: data.sessionId,
          label: data.label || sessionKey,
          model: data.model,
          provider: data.modelProvider,
          channel: data.channel || data.lastChannel,
        },
      });
      continue;
    }

    // Session updated (new message/activity)
    if (prev.updatedAt !== data.updatedAt) {
      events.push({
        type: 'session_activity',
        sessionKey,
        timestamp: data.updatedAt,
        data: {
          sessionId: data.sessionId,
          label: data.label || sessionKey,
          inputTokens: data.inputTokens || 0,
          outputTokens: data.outputTokens || 0,
          totalTokens: data.totalTokens || 0,
          cacheRead: data.cacheRead || 0,
          cacheWrite: data.cacheWrite || 0,
        },
      });
    }
  }

  lastState = current;
  return events;
}

async function sendToMissionControl(event) {
  try {
    const response = await fetch(MISSION_CONTROL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    console.log(`[${new Date().toISOString()}] Sent:`, event.type, '-', event.sessionKey);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Failed to send event:`, err.message);
  }
}

/**
 * Parse .jsonl transcript file and extract tool call events
 */
function parseTranscript(sessionFile) {
  try {
    if (!fs.existsSync(sessionFile)) return [];
    
    const lines = fs.readFileSync(sessionFile, 'utf8').split('\n').filter(Boolean);
    const events = [];
    let commitCount = 0;
    
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        
        // Detect tool_call events
        if (entry.type === 'message' && entry.message?.role === 'assistant') {
          const toolCalls = entry.message.content?.filter(c => c.type === 'toolCall') || [];
          
          for (const toolCall of toolCalls) {
            const eventId = `tool_call-${entry.id}-${toolCall.id}`;
            
            // Skip if already processed
            if (processedEvents.has(eventId)) continue;
            
            events.push({
              type: 'tool_call',
              sessionKey: null, // Will be set by caller
              timestamp: entry.timestamp || new Date(entry.message.timestamp).toISOString(),
              data: {
                toolName: toolCall.name,
                arguments: toolCall.arguments,
                id: toolCall.id,
                messageId: entry.id,
              },
              _eventId: eventId,
            });
            
            // Detect commits (exec tool with "git commit" command)
            if (toolCall.name === 'exec' && toolCall.arguments?.command) {
              const cmd = toolCall.arguments.command;
              if (cmd.includes('git commit')) {
                commitCount++;
                const commitEventId = `commit-${entry.id}-${toolCall.id}`;
                console.log(`[${new Date().toISOString()}] Found git commit, processed=${processedEvents.has(commitEventId)}`);
                
                // Extract commit message
                const messageMatch = cmd.match(/-m\s+["']([^"']+)["']/);
                const commitMessage = messageMatch ? messageMatch[1] : 'Committed changes';
                
                if (!processedEvents.has(commitEventId)) {
                  console.log(`[${new Date().toISOString()}] Detected NEW commit:`, commitMessage);
                  events.push({
                    type: 'commit',
                    sessionKey: null,
                    timestamp: entry.timestamp || new Date(entry.message.timestamp).toISOString(),
                    data: {
                      message: commitMessage,
                      command: cmd,
                      toolCallId: toolCall.id,
                    },
                    _eventId: commitEventId,
                  });
                }
              }
            }
          }
        }
      } catch (parseErr) {
        // Skip malformed lines
        continue;
      }
    }
    
    if (commitCount > 0) {
      console.log(`[${new Date().toISOString()}] Found ${commitCount} total commits in ${sessionFile}, ${events.filter(e => e.type === 'commit').length} new`);
    }
    
    return events;
  } catch (err) {
    console.error(`Failed to parse transcript ${sessionFile}:`, err.message);
    return [];
  }
}

/**
 * Scan all active sessions for new tool call events
 */
function detectToolCallEvents(sessions) {
  const events = [];
  
  for (const [sessionKey, sessionData] of Object.entries(sessions)) {
    const sessionFile = sessionData.sessionFile;
    if (!sessionFile) continue;
    
    const toolCallEvents = parseTranscript(sessionFile);
    
    for (const event of toolCallEvents) {
      event.sessionKey = sessionKey;
      events.push(event);
      processedEvents.add(event._eventId);
      delete event._eventId; // Clean up internal tracking field
    }
  }
  
  return events;
}

function poll() {
  const sessions = loadSessions();
  if (!sessions) return;

  const events = detectChanges(sessions);
  const toolCallEvents = detectToolCallEvents(sessions);
  
  for (const event of [...events, ...toolCallEvents]) {
    sendToMissionControl(event);
  }
}

// Poll every 5 seconds
console.log(`[${new Date().toISOString()}] OpenClaw Watcher started`);
console.log(`Watching: ${OPENCLAW_SESSIONS}`);
console.log(`Target: ${MISSION_CONTROL_API}`);

poll(); // Initial poll
setInterval(poll, 5000);
