# Agent Health Monitor — Implementation Roadmap

## Build Time: 4 Hours

**Start:** Tomorrow 7 AM  
**Target completion:** 11 AM

---

## Hour 1 (7-8 AM): Backend Foundation

**Target:** Health Monitor service operational, data flowing

### Tasks:

1. **Create core types** (10 min)
   - File: `src/services/health-monitor/types.ts`
   - Copy from `DATA-STRUCTURES.md`
   - Export all interfaces

2. **Create in-memory storage** (15 min)
   - File: `src/services/health-monitor/storage.ts`
   - Implement `HealthMonitorStorage` class
   - FIFO logic for actions/alerts

3. **Create threshold config** (5 min)
   - File: `src/services/health-monitor/config.ts`
   - Hard-code thresholds from spec

4. **Create Health Monitor service** (20 min)
   - File: `src/services/health-monitor/index.ts`
   - Main service class
   - Methods:
     - `processEvent(event)` — analyze incoming events
     - `calculateMetrics(agentName)` — compute health metrics
     - `checkThresholds(metrics)` — determine status (green/yellow/red)
     - `createAlert(...)` — generate alerts
     - `getHealth(agentName)` — return health data
     - `getAllHealth()` — return all agents

5. **Create API endpoint** (10 min)
   - File: `src/app/api/health/route.ts`
   - GET endpoint returning all agents health
   - Test with curl

**Checkpoint at 8 AM:**
- ✅ `/api/health` endpoint returns mock health data
- ✅ Service skeleton complete
- ✅ First commit pushed

---

## Hour 2 (8-9 AM): Metrics Calculation

**Target:** All 5 metrics calculating correctly

### Tasks:

1. **Token burn rate calculation** (15 min)
   - Read from existing `/api/analytics/models`
   - Calculate $/hour from last hour's usage
   - Apply thresholds (red >$5/hour, yellow $1-5)

2. **Loop detection** (20 min)
   - Track last 50 actions per agent
   - Hash tool parameters for comparison
   - Count identical actions in last 15 min
   - Apply thresholds (red >20, yellow 10-20)

3. **Session duration** (10 min)
   - Read from `sessions.json`
   - Calculate time since session start
   - Apply thresholds (red >4h, yellow 2-4h)

4. **Error rate** (10 min)
   - Count failed vs successful tool calls (last 1h)
   - Calculate percentage
   - Apply thresholds (red >50%, yellow 20-50%)

5. **Response time** (5 min)
   - Track time between message received and first action
   - Apply thresholds (red >30min, yellow 5-30min)

**Checkpoint at 9 AM:**
- ✅ All 5 metrics calculating
- ✅ Status colors correct (green/yellow/red)
- ✅ `/api/health` returns real metrics
- ✅ Second commit pushed

---

## Hour 3 (9-10 AM): Alert System + Telegram

**Target:** Alerts generating and sending to Telegram

### Tasks:

1. **Alert generation** (10 min)
   - When metric crosses RED threshold → create alert
   - Store in memory (max 20 per agent)
   - Deduplicate (don't alert twice for same issue)

2. **Telegram integration** (20 min)
   - Use existing message tool
   - Format alert message:
     ```
     🚨 RED ALERT: Elon
     Loop detected: 22 identical actions in 15 min
     Last action: POST to x.com/elonmusk/status
     Time: 9:45 AM
     [Kill Session] [Acknowledge]
     ```
   - Send to Rick's Telegram

3. **Auto-kill logic** (15 min)
   - When RED alert fires:
     - Wait 60s grace period
     - Send Telegram warning
     - If still RED after 60s → kill session
     - Log to memory

4. **Alert API endpoints** (15 min)
   - GET `/api/health/alerts/active` — list active alerts
   - POST `/api/health/alerts/acknowledge` — mark as acknowledged
   - POST `/api/health/[agent]/kill` — manual session kill

**Checkpoint at 10 AM:**
- ✅ RED alerts firing
- ✅ Telegram messages sending
- ✅ Auto-kill working (with 60s grace)
- ✅ Third commit pushed

---

## Hour 4 (10-11 AM): Dashboard UI

**Target:** "Agent Health" tab complete and functional

### Tasks:

1. **Create Agent Health screen** (20 min)
   - File: `src/components/screens/AgentHealth.tsx`
   - Fleet overview section (agent cards with health badges)
   - Real-time alert section (RED/YELLOW alerts)
   - 24h health trends (token burn graph)

2. **Health badge component** (10 min)
   - File: `src/components/HealthBadge.tsx`
   - Green/Yellow/Red circle
   - Tooltip with metric details

3. **Agent detail modal** (20 min)
   - File: `src/components/AgentHealthModal.tsx`
   - Shows all metrics for selected agent
   - Last 10 actions
   - "Kill Session" button (RED only)

4. **Add to navigation** (5 min)
   - Update sidebar: Add "Agent Health" between "Task Board" and "Analytics"
   - Icon: heart/pulse icon

5. **Auto-refresh** (5 min)
   - Poll `/api/health` every 5 seconds
   - Update UI with new data

**Checkpoint at 11 AM:**
- ✅ "Agent Health" tab visible
- ✅ Fleet overview showing all agents
- ✅ Real-time alerts displaying
- ✅ Agent detail modal working
- ✅ Auto-refresh operational
- ✅ Final commit pushed

---

## Watcher Integration (Separate Task)

**File:** `openclaw-watcher.js`

**Changes needed:**
1. Parse tool call events from `.jsonl` files
2. POST events to `/api/health/events`
3. Include: agentName, toolName, parameters, success/failure, timestamp

**Estimate:** 30 min (can be done after main build)

---

## Testing Strategy

### Unit Tests (Optional — Phase 2)
- Loop detection logic
- Threshold calculations
- FIFO cleanup

### Manual Testing (Required)
1. **Token burn:** Spawn agent, verify metric updates
2. **Loop detection:** Send 20 identical commands, verify RED alert
3. **Session duration:** Check long-running sessions show yellow/red
4. **Telegram:** Trigger RED alert, verify message sent
5. **Auto-kill:** Trigger RED, wait 60s, verify session killed
6. **Dashboard:** Open UI, verify all data displaying

---

## Files Created (Summary)

### Backend
- `src/services/health-monitor/types.ts`
- `src/services/health-monitor/storage.ts`
- `src/services/health-monitor/config.ts`
- `src/services/health-monitor/index.ts`
- `src/app/api/health/route.ts`
- `src/app/api/health/[agent]/route.ts`
- `src/app/api/health/alerts/active/route.ts`
- `src/app/api/health/alerts/acknowledge/route.ts`
- `src/app/api/health/[agent]/kill/route.ts`
- `src/app/api/health/events/route.ts`

### Frontend
- `src/components/screens/AgentHealth.tsx`
- `src/components/HealthBadge.tsx`
- `src/components/AgentHealthModal.tsx`

### Modified
- Sidebar navigation (add "Agent Health" link)
- `openclaw-watcher.js` (POST events to health API)

**Total:** ~13 files created/modified

---

## Success Criteria

✅ `/api/health` returns health data for all agents  
✅ All 5 metrics calculating correctly  
✅ RED alerts trigger Telegram messages  
✅ Auto-kill working (60s grace period)  
✅ Dashboard tab displaying agent health  
✅ Real-time updates (5s polling)  
✅ Agent detail modal showing metrics + actions  
✅ Zero TypeScript errors  

---

## Commit Schedule

- **7:00 AM:** Project start
- **8:00 AM:** Backend foundation (types, storage, service skeleton)
- **9:00 AM:** Metrics calculation (all 5 metrics working)
- **10:00 AM:** Alert system + Telegram integration
- **11:00 AM:** Dashboard UI complete

**4 commits minimum across 4 hours.**

---

## Next Steps After Completion

1. Test with real agent (spawn Neo, trigger loop)
2. Verify Telegram alerts sending
3. Monitor for 1 hour, ensure no crashes
4. Update MEMORY.md with learnings
5. Start Live Agent Vision build
