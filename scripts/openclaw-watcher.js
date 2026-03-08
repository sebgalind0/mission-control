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

const MISSION_CONTROL_API = 'http://localhost:3000/api/events';

let lastState = null;

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

function poll() {
  const sessions = loadSessions();
  if (!sessions) return;

  const events = detectChanges(sessions);
  
  for (const event of events) {
    sendToMissionControl(event);
  }
}

// Poll every 5 seconds
console.log(`[${new Date().toISOString()}] OpenClaw Watcher started`);
console.log(`Watching: ${OPENCLAW_SESSIONS}`);
console.log(`Target: ${MISSION_CONTROL_API}`);

poll(); // Initial poll
setInterval(poll, 5000);
