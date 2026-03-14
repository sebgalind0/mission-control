# Agent Health Monitor — MVP Spec

**Version:** 1.0  
**Author:** Larry (CTO)  
**Date:** March 9, 2026  
**Build Time:** 3-4 hours  

---

## Purpose
Real-time monitoring of agent health to detect loops, token burn, stuck sessions, and degraded performance BEFORE they become incidents.

---

## Metrics Tracked

### 1. Token Burn Rate
**What:** Tokens consumed per hour + $ cost per hour per agent  
**Source:** `/api/analytics/models` endpoint (already exists)  
**Display:** Current hourly rate + 24h trend graph  

### 2. Loop Detection
**What:** Repeated similar actions in short timeframe  
**Source:** OpenClaw event stream (tool calls, messages)  
**Logic:** 
- Track last 50 actions per agent
- If >10 identical tool calls in 15 min → yellow
- If >20 identical tool calls in 15 min → red
**Example:** Elon posting 22 unauthorized tweets = loop

### 3. Session Duration
**What:** How long current session has been active  
**Source:** `sessions.json` → `updatedAt` timestamp  
**Thresholds:**
- <30 min → green
- 30 min - 2 hours → yellow
- >2 hours → red (hung session suspected)

### 4. Task Completion Rate
**What:** Tasks assigned vs tasks completed (last 24h)  
**Source:** Task Board API (when built) or cron completion logs  
**Thresholds:**
- >80% → green
- 50-80% → yellow
- <50% → red

### 5. Error Rate
**What:** Failed tool calls / total tool calls (last 1h)  
**Source:** OpenClaw event stream  
**Thresholds:**
- <10% → green
- 10-30% → yellow
- >30% → red

### 6. Response Time
**What:** Time from message received → first action taken  
**Source:** Event timestamps  
**Thresholds:**
- <5 min → green
- 5-30 min → yellow
- >30 min → red

---

## Alert System

### RED Alerts (Critical)
**Triggers:**
- Token burn >$5/hour
- Loop detected (>20 similar actions in 15 min)
- Session hung (>4 hours)
- Error rate >50%

**Action:**
- Real-time alert to Rick via Telegram
- Dashboard notification (red badge)
- Optional: Auto-kill session (configurable)

### YELLOW Alerts (Warning)
**Triggers:**
- Token burn $1-5/hour
- Possible loop (10-20 similar actions)
- Session long (2-4 hours)
- Error rate 20-50%
- Task completion <50%

**Action:**
- Dashboard warning badge
- Included in daily digest

### Daily Digest
**Sent to:** Rick (Telegram)  
**Time:** 7 PM (with other daily summaries)  
**Contents:**
- Agent health scorecard (green/yellow/red)
- Top token burners (24h)
- Longest sessions
- Task completion rates
- Any yellow flags

---

## Dashboard UI

### New Tab: "Agent Health"
Located between "Task Board" and "Analytics"

### Layout:

**Top Section — Fleet Overview:**
- Agent cards (same as Fleet Overview)
- Health badge: 🟢 Green / 🟡 Yellow / 🔴 Red
- Click agent → detailed health view

**Middle Section — Real-Time Alerts:**
- RED alerts at top (critical issues now)
- YELLOW warnings below (needs attention)
- Empty state: "All systems healthy ✅"

**Bottom Section — 24h Health Trends:**
- Token burn graph ($ over time, all agents)
- Error rate graph
- Session duration histogram

### Agent Detail View (Modal):
When clicking an agent card:
- Current session duration
- Tokens used (1h / 24h)
- Error rate (1h / 24h)
- Last 10 actions (with timestamps)
- Task completion rate
- "Kill Session" button (RED state only)

---

## Data Flow

```
OpenClaw Events → 
  Watcher (openclaw-watcher.js) → 
    Dashboard API (/api/events) → 
      Health Monitor Service → 
        Analysis + Thresholds → 
          UI Display + Alerts
```

**New files needed:**
1. `src/services/health-monitor.ts` — Core logic (threshold checks, loop detection)
2. `src/app/api/health/route.ts` — Health data endpoint
3. `src/components/screens/AgentHealth.tsx` — Dashboard tab
4. `src/components/AgentHealthCard.tsx` — Individual agent health widget

---

## MVP Exclusions (Phase 2)
- Auto-intervention (auto-kill, throttle)
- Machine learning anomaly detection
- Agent performance scoring/ranking
- Historical health trends (>24h)
- Email alerts (Telegram only for now)

---

## Success Metrics
1. **Detection speed:** Identify loops within 5 minutes of start
2. **False positive rate:** <10% (don't alert unless real issue)
3. **Alert coverage:** Catch 100% of RED conditions
4. **Response time:** Dashboard loads health data in <500ms

---

## Implementation Plan

### Phase 1: Data Collection (1h)
- Extend watcher to track tool call patterns
- Build `/api/health` endpoint
- Store last 50 actions per agent in memory

### Phase 2: Analysis Engine (1h)
- Implement threshold checks
- Build loop detection algorithm
- Calculate error rates + session durations

### Phase 3: Dashboard UI (1.5h)
- New "Agent Health" tab
- Fleet overview with health badges
- Alert section (RED/YELLOW)
- Agent detail modal

### Phase 4: Alert System (0.5h)
- Telegram integration for RED alerts
- Daily digest compilation (7 PM cron)

**Total:** 4 hours

---

## Open Questions for Rick
1. **Auto-kill authority:** Should RED alerts auto-kill sessions, or just alert humans?
2. **Alert routing:** Telegram to Rick only, or also Seb? (I assume Rick per chain of command)
3. **Loop detection tuning:** Start with 20 actions in 15 min, or more conservative?
4. **Token threshold:** Is $5/hour RED appropriate, or should it be higher/lower?

---

## Approval Required
- [ ] Metrics + thresholds approved
- [ ] Alert system approved (Telegram routing confirmed)
- [ ] UI design approved
- [ ] Implementation plan approved

**Status:** Awaiting Rick's review + approval to build
