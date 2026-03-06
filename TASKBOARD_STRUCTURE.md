# TaskBoard Component Structure

```
TaskBoard (Main Component)
├── Analytics Header
│   ├── MetricCard (Tasks Today)
│   ├── MetricCard (Tasks This Week)
│   ├── MetricCard (Completion Rate)
│   └── MetricCard (Avg Time in Review)
│
├── Blocked Tasks Alert (conditional)
│   └── Shows when analytics.blockedTasks > 0
│
├── Filters Bar
│   ├── Agent Select Dropdown
│   ├── Department Select Dropdown
│   ├── Priority Select Dropdown
│   └── View Toggle Buttons (All | My Review Queue | Overdue)
│
├── Kanban Board (4 columns)
│   ├── Backlog Column
│   │   └── TaskCard[] (filtered)
│   ├── In Progress Column
│   │   └── TaskCard[] (filtered)
│   ├── Review Column
│   │   └── TaskCard[] (with Approve/Reject buttons)
│   └── Done Column
│       └── TaskCard[] (filtered)
│
├── Rejection Modal (Dialog)
│   ├── DialogHeader (title + description)
│   ├── Textarea (reason input)
│   └── DialogFooter (Cancel + Submit buttons)
│
└── Task Details Modal (Dialog)
    ├── DialogHeader (task title + created date)
    ├── Description Section
    ├── Details Grid (assignee, priority, status, deadline)
    ├── History Timeline
    ├── Files List (with download links)
    ├── Comments Section
    │   ├── Comment List
    │   └── Add Comment Form (textarea + button)
    ├── Quick Actions Bar (Edit, Reassign, Set Deadline)
    └── DialogFooter (Close button)
```

## Component Props Flow

```typescript
TaskBoard
  ↓
  TaskCard (props: task, agents, onApprove?, onReject?, onClick)
    ↓
    MetricCard (props: icon, label, value, bgColor)
  
  RejectionModal (state: rejectModalOpen, taskToReject, rejectionReason)
  
  TaskDetailsModal (props: task, agents, onClose, onUpdate)
```

## State Management

```typescript
// Local State
- tasks: Task[]
- analytics: TaskAnalytics | null
- selectedTask: Task | null
- rejectModalOpen: boolean
- rejectionReason: string
- taskToReject: Task | null
- filterAgent: string
- filterDept: string
- filterPriority: string
- viewMode: 'all' | 'myReview' | 'overdue'
- notificationsEnabled: boolean
```

## Data Flow

```
1. Component Mounts
   ↓
2. loadData() fetches tasks + analytics from API
   ↓
3. requestNotificationPermission()
   ↓
4. Poll every 30s with setInterval
   ↓
5. Check for new Review tasks → trigger notifications
   ↓
6. User interactions update backend via API
   ↓
7. loadData() refreshes UI
```

## Key Features

### Filtering Logic
```typescript
getFilteredTasks()
  → Apply agent filter
  → Apply department filter  
  → Apply priority filter
  → Apply view mode (all/myReview/overdue)
  → Return filtered array

groupTasksByStatus()
  → Get filtered tasks
  → Group by status (backlog, in-progress, review, done)
  → Return grouped object
```

### Notification System
```typescript
// On load
requestNotificationPermission()
  → Check if browser supports Notification API
  → Request permission if not granted
  → Set notificationsEnabled state

// Every 30s
loadData()
  → Fetch new tasks
  → Compare with previous tasks
  → Find new tasks in Review status
  → Call showNotification() for each
```

### Approval/Rejection Flow
```
User clicks "Approve"
  ↓
handleApprove(task)
  ↓
POST /api/tasks/:id/approve
  ↓
loadData() (refresh)
  ↓
Show success notification

User clicks "Reject"
  ↓
handleRejectClick(task)
  ↓
Open RejectionModal
  ↓
User enters reason + submits
  ↓
handleRejectSubmit()
  ↓
POST /api/tasks/:id/reject { reason }
  ↓
Close modal + loadData()
  ↓
Show rejection notification
```

## Styling Architecture

```css
/* Design System Constants */
--page-bg: #09090b
--card-bg: #18181b
--card-border: #27272a
--card-hover-border: #3f3f46
--card-hover-bg: #1f1f23

/* Component Spacing */
rounded-xl (12px)
p-5 (20px padding)
gap-6 (24px between columns)
gap-3 (12px between cards)
```

## File Organization

```
src/
├── components/
│   ├── screens/
│   │   └── TaskBoard.tsx          # Main component + subcomponents
│   └── ui/
│       ├── dialog.tsx              # Modal system
│       ├── select.tsx              # Dropdown component
│       ├── textarea.tsx            # Text input
│       ├── label.tsx               # Form labels
│       └── button.tsx              # Buttons (already existed)
│
└── lib/
    ├── api/
    │   └── tasks.ts                # API client functions
    └── types/
        └── tasks.ts                # TypeScript interfaces
```

---

**Architecture:** Monolithic component with inline subcomponents (MetricCard, TaskCard, TaskDetailsModal)
**Reason:** Small app, related features, simpler than separate files
**Future:** If TaskBoard grows, extract to separate components/TaskBoard/ folder
