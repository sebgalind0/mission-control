# Engineering Lessons Learned

## Database & Performance

### Index Early, Index Often
**Context:** Activity feed was slow (250ms) until Roger added indexes  
**Lesson:** Always add indexes on filter/sort fields during initial migration  
**Impact:** 3.2x performance improvement, sub-100ms queries  
**Applied:** Now part of our migration checklist

### Real Data > Mock Data
**Context:** Dashboard felt lifeless until we seeded realistic activity  
**Lesson:** Seed realistic data early in development, not just before launch  
**Impact:** Caught UX issues we'd have missed with Lorem ipsum  
**Applied:** Every new feature gets realistic seed data from day 1

### Connection Pooling Matters
**Context:** Had intermittent timeouts under load  
**Lesson:** Configure connection pools properly from the start  
**Impact:** Eliminated 95% of timeout errors  
**Applied:** Default pool config in all new projects

## API Design

### WebSocket + Polling Fallback
**Context:** Real-time activity feed needed to be reliable  
**Lesson:** Always have a fallback for WebSocket connections  
**Impact:** Works even when WebSockets blocked by proxy/firewall  
**Applied:** Standard pattern for all real-time features

### Response Time Budgets
**Context:** Some API endpoints were creeping toward 500ms  
**Lesson:** Set performance budgets early (target: <100ms, max: 200ms)  
**Impact:** Caught performance regressions before they hit production  
**Applied:** CI/CD now includes performance testing

### Versioned APIs from Day 1
**Context:** Breaking changes forced client updates  
**Lesson:** Version your APIs from the first endpoint  
**Impact:** Can evolve APIs without breaking existing clients  
**Applied:** All new APIs use /v1/ prefix

## Frontend & UX

### Empty States Are Critical
**Context:** Users confused by blank pages when no data  
**Lesson:** Design empty states alongside happy path  
**Impact:** Much better onboarding experience  
**Applied:** Empty states now part of design checklist

### Cross-Browser Testing Can't Wait
**Context:** Shipped feature that broke in Safari  
**Lesson:** Test Chrome, Firefox, Safari, Edge before calling it done  
**Impact:** Caught CSS Grid issue before wide rollout  
**Applied:** Automated cross-browser tests in CI

### Hover States Matter
**Context:** Users didn't realize elements were interactive  
**Lesson:** Clear hover/active states improve discoverability  
**Impact:** Interaction rate up 23%  
**Applied:** Hover states required for all interactive elements

## Team & Process

### 15-Minute Standups
**Context:** Standups were dragging to 30+ minutes  
**Lesson:** Hard stop at 15 minutes, move details to async/1:1s  
**Impact:** Team stays engaged, momentum maintained  
**Applied:** Timer started at beginning of every standup

### Documentation During Development
**Context:** Had to reverse-engineer decisions months later  
**Lesson:** Document architectural decisions as you make them  
**Impact:** New team members onboard 3x faster  
**Applied:** ADRs (Architecture Decision Records) for major choices

### Blockers Get Escalated Fast
**Context:** Team members stuck for hours on blockers  
**Lesson:** Stuck >10 minutes? Escalate to Larry immediately  
**Impact:** Reduced average blocker time from 2h to 15min  
**Applied:** "10-minute rule" now enforced

## Deployment & Operations

### Zero-Downtime Migrations
**Context:** Early migrations caused 2-3 minute outages  
**Lesson:** Design migrations to run alongside old code  
**Impact:** Last 15 migrations: zero downtime  
**Applied:** Migration playbook with rollback plans

### Automated Backups Are Non-Negotiable
**Context:** Database corruption scare (false alarm, but scary)  
**Lesson:** Automate daily backups from day 1, test restores monthly  
**Impact:** Peace of mind, 3-minute RPO  
**Applied:** Backup automation in project bootstrap

### Monitor Everything
**Context:** Didn't catch database growth until hitting limits  
**Lesson:** Set up monitoring/alerting before problems arise  
**Impact:** Proactive instead of reactive  
**Applied:** Monitoring stack deployed with every new service

## What's Working

- **Small, focused PRs:** <300 lines, reviewed in <1 hour
- **Realistic seed data:** Makes development feel real
- **Performance budgets:** Keeps APIs fast
- **Cross-functional teams:** Designers + engineers pairing
- **Daily deploys:** Ship small, ship often

## What We're Still Learning

- **Real-time data synchronization** at scale
- **Offline-first** architecture patterns
- **AI agent coordination** across multiple tasks
- **Cost optimization** for AI API calls
- **User privacy** in agent-driven systems

---

*Last updated: 2026-03-07*
