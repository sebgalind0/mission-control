# Mission Control - AI Agent Coordination Platform

**Status:** Active Development (Week 10 Sprint)  
**Launch Target:** March 2026  
**Tech Stack:** Next.js 14, TypeScript, Prisma, PostgreSQL

## Overview

Mission Control is the central nervous system for Jex's AI agent fleet. It provides real-time visibility into agent activity, task management, calendar coordination, and memory browsing.

Think of it as the "air traffic control" for our AI workforce.

## Key Features

### 1. Command Center (Activity Feed)
- Real-time activity stream from all agents
- Filter by agent, action type, time range
- Live updates via WebSocket + polling fallback
- 28+ event types tracked

### 2. Fleet Overview
- Visual status of all active agents
- Current tasks, progress, blockers
- Quick health checks
- Performance metrics

### 3. Task Management
- Create, assign, track tasks across agents
- Priority levels (High, Medium, Low)
- Status tracking (Backlog → In Progress → Review → Done)
- Approval workflows for sensitive tasks
- Comments & collaboration

### 4. Calendar
- Unified calendar view across all agents
- Task deadlines, meetings, recurring events
- RRULE support for complex recurrence
- Integration with external calendars (planned)

### 5. Memory Browser
- Browse agent memory files (daily logs, lessons learned)
- Full-text search across all memories
- Timeline view of agent learning
- Export capabilities

## Architecture

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **UI:** Custom component library + Tailwind CSS
- **State:** TanStack Query for server state
- **Real-time:** WebSocket connection with polling fallback

### Backend
- **API:** tRPC (type-safe, no code generation)
- **Database:** PostgreSQL 16 (Prisma ORM)
- **Auth:** NextAuth.js (planned)
- **Hosting:** Vercel (frontend), Railway (database)

### Database Schema

#### Core Models
- `Task` - Task tracking with approval workflow
- `ActivityEvent` - Agent activity stream
- `ActiveWork` - Current agent work status
- `CalendarEvent` - Calendar events with recurrence
- `Comment` - Task comments & collaboration

#### Indexes
- All timestamp fields (for time-range queries)
- Foreign keys (for joins)
- Filter fields (status, assignee, agent)

## Current Sprint (Week 10)

### Focus: Dashboard Polish

**Completed:**
- ✅ Hover states for all interactive elements
- ✅ Empty states for all data views
- ✅ Port conflict fix (3001 → 3002)
- ✅ Database seeding with realistic data
- ✅ Memory file structure
- ✅ Workspace documentation

**In Progress:**
- 🔄 Real-time activity feed (WebSocket)
- 🔄 Final UI polish
- 🔄 Performance optimization

**Next:**
- 📋 Production deployment
- 📋 Monitoring & alerting
- 📋 User authentication
- 📋 Multi-user support

## Performance Targets

- **API Response:** <100ms (p95)
- **Page Load (FCP):** <1.5s
- **Time to Interactive:** <3.5s
- **Database Queries:** <50ms (indexed)

## API Endpoints

### Activity
- `GET /api/activity` - Fetch activity events
- `GET /api/activity/live` - Real-time activity stream
- `POST /api/activity` - Create activity event

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment

### Calendar
- `GET /api/calendar/events` - Fetch events by date range
- `POST /api/calendar/events` - Create event
- `PATCH /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event

### Fleet
- `GET /api/fleet/status` - Get all agent statuses
- `GET /api/fleet/:agent` - Get specific agent status

## Development

### Setup
```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Seed database
npm run seed

# Start dev server
npm run dev
```

### Environment Variables
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3002
```

### Running Locally
```bash
npm run dev  # http://localhost:3002
```

### Seeding Data
```bash
# Activity events (28 events over 24h)
npm run seed:activity

# Calendar events
npm run seed:calendar

# Full seed (all tables)
npm run seed
```

## Deployment

### Production
- **URL:** missioncontrol.jexhq.com
- **Hosting:** Vercel (auto-deploy from main)
- **Database:** Railway (PostgreSQL 16)
- **Monitoring:** Sentry (errors), LogTail (logs)

### Deployment Process
1. PR merged to `main`
2. GitHub Actions runs tests
3. Vercel auto-deploys
4. Database migrations run automatically
5. Monitor logs for 15 minutes post-deploy

## Team

- **Larry** (CTO): Architecture, code review, leadership
- **Neo** (Frontend): UI components, interactions, animations
- **Bolt** (Backend): APIs, database, performance
- **Roger** (DevOps): Infrastructure, monitoring, deployments
- **George** (Designer): UX/UI, wireframes, prototypes
- **Achilles** (Research): Docs, competitive analysis

## Roadmap

### Q2 2026
- ✅ Core dashboard
- ✅ Activity feed
- ✅ Task management
- 🔄 Real-time updates
- 📋 Multi-user auth
- 📋 Memory browser
- 📋 Agent performance analytics

### Q3 2026
- 📋 Advanced filtering & search
- 📋 Custom dashboards
- 📋 API webhooks
- 📋 Integration with external tools
- 📋 Mobile app (React Native)

## Lessons Learned

See `memory/lessons-learned.md` for detailed engineering lessons.

**Key Takeaways:**
- Real data > mock data (always)
- Index early, index often
- Performance budgets prevent regressions
- Empty states are critical UX
- Cross-browser testing can't wait

---

*Last updated: 2026-03-07*  
*Maintained by: Larry (CTO)*
