# Live Agent Vision — Technical Specification

**Version:** 1.0  
**Author:** Larry (CTO)  
**Date:** March 9, 2026  
**Build Time:** 4-6 hours  
**Status:** Awaiting approval

---

## Executive Summary

**The Problem:**  
When agents loop, fail, or behave unexpectedly, you find out from logs 10+ minutes later. By then, damage is done (Elon's 22 tweets, wasted tokens, broken deployments).

**The Solution:**  
Live Agent Vision shows you exactly what agents are seeing and doing RIGHT NOW — browser screenshots, file changes, API calls, tool usage — in real-time on the dashboard.

**The Impact:**  
Catch loops and failures the moment they start. Debug in seconds instead of minutes. Learn from successful agents by watching them work.

---

## What Gets Captured

### 1. Browser Screenshots (Priority 1)
**When:** Every time an agent uses the `browser` tool  
**What:** Full-page screenshot at moment of interaction  
**Storage:** Last 5 screenshots per agent (rolling buffer)  
**Frequency:** Captured on these browser actions:
- `open` (new page)
- `navigate` (URL change)
- `act` (click, type, etc.)
- `screenshot` (explicit capture)

**Data captured:**
- Screenshot image (PNG, max 1920px width)
- URL at time of capture
- Timestamp
- Browser action type
- Target element (if applicable)

### 2. File Changes (Priority 2)
**When:** Agent uses `Write` or `Edit` tool  
**What:** Before/after diff of file content  
**Storage:** Last 10 file operations per agent  
**Display:** Side-by-side diff view (like GitHub)

**Data captured:**
- File path
- Lines changed
- Diff preview (first 20 lines if large)
- Timestamp
- Operation type (write/edit)

### 3. Tool Calls (Priority 3)
**When:** Any tool invoked by agent  
**What:** Tool name, parameters, result status  
**Storage:** Last 50 tool calls per agent  
**Display:** Scrollable feed with expandable details

**Data captured:**
- Tool name
- Input parameters (truncated to 500 chars)
- Success/failure status
- Execution time
- Timestamp

### 4. API Requests (Priority 4 — Future)
**When:** Agent calls external APIs via `exec` or custom tools  
**What:** Request/response preview  
**Storage:** Last 20 API calls per agent  
**Note:** Phase 2 feature, not in MVP

---

## Where It Displays

### New Dashboard Component: "Agent Vision Panel"

**Location:** Right sidebar (collapsible), 400px width  
**Visibility:** Shows when ANY agent is active  
**Default state:** Collapsed on mobile, expanded on desktop (>1280px)

### UI Layout:

```
┌─────────────────────────────────────┬──────────────────┐
│                                     │  Agent Vision    │
│         Main Dashboard              │  ───────────────  │
│                                     │  [Active Agents] │
│  (Fleet Overview / Command Center)  │  • Larry         │
│                                     │  • Neo           │
│                                     │                  │
│                                     │  [Latest View]   │
│                                     │  ┌────────────┐  │
│                                     │  │Screenshot  │  │
│                                     │  │Preview     │  │
│                                     │  └────────────┘  │
│                                     │  Click to expand │
│                                     │                  │
│                                     │  [Recent Actions]│
│                                     │  • Edit file.tsx │
│                                     │  • Browser click │
│                                     │  • API call      │
└─────────────────────────────────────┴──────────────────┘
```

### Agent Vision Panel Contents:

**Top Section — Active Agents:**
- List of agents currently working
- Click any agent → filter view to that agent only
- Shows last activity timestamp

**Middle Section — Latest Screenshot:**
- Most recent browser screenshot (if any)
- Click to open full-screen modal
- Shows URL + timestamp
- Auto-updates every 5 seconds

**Bottom Section — Recent Actions Feed:**
- Scrollable list of last 20 actions
- Color-coded by type:
  - 🟦 Browser (blue)
  - 🟩 File edit (green)
  - 🟨 Tool call (yellow)
  - 🟥 Error (red)
- Click any action → expand details

### Full-Screen Modal (Click to Expand):

When clicking a screenshot or action:
- Full-screen overlay (like image viewer)
- Left side: Screenshot or diff
- Right side: Context panel showing:
  - Agent name
  - Timestamp
  - Full URL / file path
  - Related actions (what happened before/after)
  - Raw data (expandable JSON)
- Keyboard nav: Arrow keys to move between captures
- ESC to close

---

## Data Storage & Cleanup

### In-Memory Storage (Fast Access)
**Location:** Node.js process memory  
**Structure:**
```typescript
interface AgentVisionData {
  [agentName: string]: {
    screenshots: Screenshot[];      // max 5, FIFO
    fileChanges: FileDiff[];         // max 10, FIFO
    toolCalls: ToolCall[];           // max 50, FIFO
    lastActivity: Date;
  }
}
```

**Memory limits:**
- Max 5 screenshots/agent × 18 agents × 500KB/screenshot = 45MB
- Max 10 file diffs/agent × 18 agents × 50KB/diff = 9MB
- Max 50 tool calls/agent × 18 agents × 2KB/call = 1.8MB
- **Total max memory:** ~60MB

**Cleanup policy:**
- FIFO (first in, first out) when limits hit
- Auto-cleanup on agent idle >30 min (remove all data)
- Full reset on server restart (ephemeral data)

### Persistent Storage (Optional — Phase 2)
**For:** Debugging past sessions  
**Location:** PostgreSQL database  
**Retention:** 7 days, then auto-delete  
**Size estimate:** ~5GB/week (compressed)  
**Note:** NOT in MVP, added later if needed

---

## Technical Implementation

### Architecture:

```
OpenClaw Event → Watcher → Vision Service → Dashboard API → UI
                    ↓
              Screenshot Capture
              File Diff Extraction
              Tool Call Logging
```

### New Files Created:

1. **`src/services/agent-vision.ts`** (Vision Service)
   - In-memory data store
   - FIFO cleanup logic
   - Screenshot compression
   - Diff generation

2. **`src/app/api/vision/route.ts`** (API Endpoint)
   - `GET /api/vision` → All agents' latest data
   - `GET /api/vision/[agent]` → Specific agent data
   - `GET /api/vision/[agent]/screenshot/[id]` → Full screenshot

3. **`src/components/AgentVisionPanel.tsx`** (UI Component)
   - Right sidebar panel
   - Active agent list
   - Screenshot preview
   - Action feed

4. **`src/components/AgentVisionModal.tsx`** (Full-Screen Modal)
   - Full screenshot viewer
   - Context panel
   - Keyboard navigation

5. **`src/hooks/useAgentVision.ts`** (React Hook)
   - Auto-refresh every 5s
   - WebSocket connection (stretch goal)
   - Data filtering by agent

### Modified Files:

1. **`openclaw-watcher.js`** (Event Capture)
   - Hook into browser tool events
   - Capture screenshot data
   - Hook into Write/Edit tools
   - Forward to Vision Service

2. **`src/app/layout.tsx`** (Dashboard Layout)
   - Add Agent Vision Panel to layout
   - Toggle button to show/hide

---

## Build Milestones

### Hour 2 Checkpoint: Backend + Data Flow ✅
**Goal:** Vision Service operational, data flowing from watcher to API

**Deliverables:**
- ✅ `agent-vision.ts` service complete (in-memory storage, FIFO cleanup)
- ✅ `/api/vision` endpoint live and responding with mock data
- ✅ Watcher modified to capture browser events
- ✅ Test: `curl localhost:3333/api/vision` returns recent screenshots

**Success criteria:** API returns real screenshot data from an agent's browser action

---

### Hour 4 Checkpoint: UI + Screenshot Display ✅
**Goal:** Agent Vision Panel visible, showing live screenshots

**Deliverables:**
- ✅ `AgentVisionPanel.tsx` component built
- ✅ Right sidebar integrated into dashboard layout
- ✅ Screenshot preview rendering
- ✅ Auto-refresh (5s polling) working
- ✅ Click to expand (modal opens)

**Success criteria:** Open dashboard, see agent's latest browser screenshot update in real-time

---

### Hour 6 Checkpoint: Full Feature Complete ✅
**Goal:** All capture types working, full-screen modal, polish

**Deliverables:**
- ✅ File diff capture + display
- ✅ Tool call feed
- ✅ Full-screen modal with navigation
- ✅ Mobile responsive (collapsible sidebar)
- ✅ Error handling (no crashes if no data)
- ✅ TypeScript zero errors

**Success criteria:** Watch an agent work in browser, see screenshots + file edits + tool calls update live in Agent Vision Panel

---

## User Flow Example

**Scenario:** Seb wants to debug why Elon keeps posting tweets

1. **Open Dashboard**
   - Right sidebar shows "Agent Vision Panel"
   - Sees "Elon" in active agents list (green dot)

2. **Click Elon**
   - Panel filters to show only Elon's activity
   - Latest screenshot shows X.com with reply box open
   - Recent actions feed shows:
     - 🟦 Browser: Opened x.com/elonmusk
     - 🟦 Browser: Clicked reply button
     - 🟨 Tool: message (action=send)

3. **Click Screenshot**
   - Full-screen modal opens
   - Left: Full browser screenshot showing X.com
   - Right: Context showing URL, timestamp, related actions
   - Sees Elon drafting a reply to a SpaceX tweet

4. **Identify Loop**
   - Sees 8 screenshots in last 5 minutes, all X.com
   - All showing similar reply boxes
   - Loop detected visually before hitting 22 tweets

5. **Take Action**
   - Kill Elon's session immediately
   - Prevented 14 more unauthorized tweets

**Time saved:** 15 minutes (vs reading logs after the fact)

---

## Success Metrics

1. **Time to loop detection:** <2 minutes (vs 10+ minutes via logs)
2. **Debug speed:** 5x faster than log analysis
3. **False positives:** <5% (don't alert on normal behavior)
4. **Memory overhead:** <60MB with 18 active agents
5. **UI performance:** Panel loads <200ms, updates <100ms

---

## Risks & Mitigations

### Risk 1: Memory Leak
**Risk:** Screenshots accumulate, crash Node.js  
**Mitigation:** Hard FIFO limits (5 screenshots max), auto-cleanup on idle  
**Fallback:** Monitor memory, add alerts if >100MB

### Risk 2: Screenshot Capture Slows Agents
**Risk:** Taking screenshots delays agent actions  
**Mitigation:** Capture async, don't block tool execution  
**Fallback:** Make screenshot capture optional (config flag)

### Risk 3: Sensitive Data in Screenshots
**Risk:** Agent captures password fields, API keys, PII  
**Mitigation:** Blur sensitive form fields (password, credit card inputs)  
**Fallback:** Add screenshot whitelist/blacklist per agent

### Risk 4: UI Clutter
**Risk:** Panel takes up too much space on small screens  
**Mitigation:** Collapsible by default on mobile, toggle button  
**Fallback:** Move to dedicated tab if sidebar doesn't work

---

## Future Enhancements (Phase 2)

1. **WebSocket Live Stream**
   - Replace 5s polling with real-time push
   - Sub-second updates

2. **Agent Replay**
   - Replay entire agent session like a video
   - Step through actions frame-by-frame

3. **Smart Highlights**
   - Auto-detect loops (repeated screenshots)
   - Flag suspicious patterns (rapid API calls)

4. **Performance Metrics**
   - Tool execution time graphs
   - Memory/CPU usage per agent

5. **Export Session**
   - Download agent's full session as video or PDF report

---

## Open Questions

1. **Screenshot compression:** Use PNG or WebP? (WebP saves 30% but less compatible)
2. **Auto-refresh rate:** 5s optimal or should it be configurable?
3. **Storage persistence:** Keep 7 days in DB or go fully ephemeral?
4. **Mobile UX:** Collapsible sidebar or dedicated mobile view?

**Recommendations:**
1. PNG for MVP (better compatibility)
2. 5s fixed (can make configurable in Phase 2)
3. Fully ephemeral for MVP (DB adds complexity)
4. Collapsible sidebar (simpler implementation)

---

## Approval Checklist

- [ ] What gets captured: Screenshots, file diffs, tool calls — approved?
- [ ] Where it displays: Right sidebar panel — approved?
- [ ] Storage policy: 60MB in-memory, FIFO cleanup — approved?
- [ ] Milestones: Hour 2 (backend), Hour 4 (UI), Hour 6 (complete) — approved?
- [ ] Build time: 4-6 hours — approved?

---

## Final Notes

This feature turns Mission Control from a "status dashboard" into a "live mission command center." You don't just see that agents are working — you see WHAT they're working on, in real-time.

The Elon example is the killer use case: catch loops and failures the moment they start, not 10 minutes later when damage is done.

**Build priority:** High. This directly solves the "agent went rogue and I didn't notice" problem that's happened multiple times (Elon tweets, token burns, unauthorized deploys).

**Risk level:** Low. In-memory storage is safe, UI is isolated, no database changes.

**User value:** Immediate. First time you catch a loop within 30 seconds instead of 10 minutes, this pays for itself.

---

**Status:** Spec complete. Awaiting Rick's approval to build.
