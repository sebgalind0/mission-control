# Monitoring & Observability

**Owner:** Roger (DevOps)  
**Last Updated:** 2026-03-07

## Philosophy

> "You can't improve what you don't measure."

We monitor everything:
- Application performance
- Database health
- Infrastructure metrics
- User experience
- Business metrics

## Monitoring Stack

### Error Tracking: Sentry
- **Purpose:** Track application errors & exceptions
- **Coverage:** All production apps
- **Alerts:** Slack #alerts channel
- **Dashboard:** sentry.io/jex

**Key Metrics:**
- Error rate (target: <0.1%)
- Error frequency (spike detection)
- Affected users
- Error grouping & trends

### Logs: LogTail
- **Purpose:** Centralized log aggregation
- **Coverage:** All services
- **Retention:** 30 days
- **Dashboard:** logtail.com/jex

**Log Levels:**
- `ERROR`: Production issues, immediate attention
- `WARN`: Potential issues, investigate
- `INFO`: Normal operations, audit trail
- `DEBUG`: Detailed troubleshooting (dev only)

### Application Performance: Vercel Analytics
- **Purpose:** Frontend performance monitoring
- **Coverage:** All Next.js apps
- **Metrics:** Core Web Vitals, response times

**Key Metrics:**
- **FCP** (First Contentful Paint): <1.5s
- **LCP** (Largest Contentful Paint): <2.5s
- **CLS** (Cumulative Layout Shift): <0.1
- **FID** (First Input Delay): <100ms
- **TTFB** (Time to First Byte): <600ms

### Database: Vercel Postgres Metrics
- **Purpose:** PostgreSQL monitoring
- **Coverage:** All databases
- **Metrics:** CPU, memory, disk, connections

**Key Metrics:**
- Active connections (max: 100)
- Query duration (p95: <50ms)
- Disk usage (alert at 80%)
- Replication lag (if applicable)

## Alerts

### Critical (Page Immediately)
- ❗ **Production Down**: 5+ consecutive 5xx errors
- ❗ **Database Unreachable**: Connection failures
- ❗ **Security Breach**: Unauthorized access detected
- ❗ **Data Loss**: Backup failures

**Response:** <15 minutes

### High (Alert Soon)
- ⚠️ **Error Rate Spike**: >1% error rate
- ⚠️ **Slow Performance**: p95 response time >1s
- ⚠️ **High Memory**: >90% memory usage
- ⚠️ **Disk Full Warning**: >80% disk usage

**Response:** <1 hour

### Medium (Investigate)
- ⚡ **Slow Queries**: Query time >200ms
- ⚡ **Connection Pool**: >80% connections used
- ⚡ **API Rate Limits**: Approaching limits
- ⚡ **Deployment Failures**: Build/deploy errors

**Response:** <4 hours

### Low (FYI)
- 📊 **Trend Changes**: Gradual performance degradation
- 📊 **Dependency Updates**: Security advisories
- 📊 **Resource Growth**: Increasing usage patterns

**Response:** Next business day

## Dashboards

### Executive Dashboard (Seb)
**Metrics:**
- Revenue (daily, weekly, monthly)
- Active users (DAU, MAU)
- Conversion rates
- Churn rate
- System uptime

### Engineering Dashboard (Larry)
**Metrics:**
- Deployment frequency
- Lead time (commit → deploy)
- MTTR (Mean Time to Recovery)
- Error rates by service
- API performance (p50, p95, p99)

### Operations Dashboard (Roger)
**Metrics:**
- System health (CPU, memory, disk)
- Database performance
- API response times
- Error logs (real-time)
- Active alerts

### Product Dashboard (Product Team)
**Metrics:**
- Feature adoption
- User engagement
- Funnel conversion
- Session duration
- Retention cohorts

## Custom Metrics

### Application-Level
```typescript
// Track custom events
analytics.track('task_created', {
  assignee: 'Neo',
  priority: 'high',
  source: 'api',
});

// Track performance
performance.mark('api-start');
// ... API call ...
performance.mark('api-end');
performance.measure('api-duration', 'api-start', 'api-end');
```

### Database-Level
```sql
-- Slow query log
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Track query performance
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Monitor table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Health Checks

### Application Health
```typescript
// /api/health endpoint
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    openai: await checkOpenAI(),
    stripe: await checkStripe(),
  };
  
  const healthy = Object.values(checks).every(c => c.healthy);
  const status = healthy ? 200 : 503;
  
  return NextResponse.json({ checks }, { status });
}
```

### Database Health
```bash
# Connection check
pg_isready -h $DB_HOST -p $DB_PORT

# Replication lag (if applicable)
SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()));

# Table bloat
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public';
```

### External API Health
```bash
# OpenAI
curl -I https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Stripe
curl -I https://api.stripe.com/v1/charges \
  -u $STRIPE_SECRET_KEY:

# Twilio
curl -I https://api.twilio.com/2010-04-01/Accounts.json \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
```

## Incident Response

### 1. Detection
- Alert triggered (Sentry, monitoring)
- User report (support, social media)
- Internal discovery (team member)

### 2. Triage
- Assess severity (Critical, High, Medium, Low)
- Identify affected systems/users
- Assign incident commander (usually Roger)

### 3. Investigation
- Check recent deploys
- Review error logs
- Query monitoring dashboards
- Reproduce issue if possible

### 4. Mitigation
- Implement fix or workaround
- Roll back if needed
- Communicate status updates

### 5. Resolution
- Verify fix deployed
- Confirm issue resolved
- Monitor for recurrence

### 6. Post-Mortem
- Document timeline
- Root cause analysis
- Action items (prevent recurrence)
- Share learnings with team

## Performance Budgets

### API Endpoints
| Endpoint | p50 | p95 | p99 |
|----------|-----|-----|-----|
| /api/tasks | <30ms | <80ms | <150ms |
| /api/activity | <40ms | <100ms | <200ms |
| /api/calendar | <35ms | <90ms | <180ms |
| /api/fleet | <25ms | <60ms | <120ms |

### Frontend Pages
| Page | FCP | LCP | TTI |
|------|-----|-----|-----|
| Dashboard | <1.0s | <2.0s | <3.0s |
| Tasks | <1.2s | <2.2s | <3.5s |
| Calendar | <1.5s | <2.5s | <4.0s |

### Database Queries
| Query Type | Target | Max |
|------------|--------|-----|
| Indexed reads | <20ms | <50ms |
| Complex joins | <100ms | <200ms |
| Aggregations | <150ms | <300ms |

## Tools & Access

### Required Access
- **Vercel:** Larry, Roger, Seb
- **Sentry:** All engineers
- **LogTail:** All engineers
- **Database:** Read-only for engineers, write for Larry/Roger

### CLI Tools
```bash
# Vercel
vercel logs --prod --follow

# Database
psql $DATABASE_URL

# Prisma
npx prisma studio
```

---

*"In God we trust. All others must bring data."*  
— W. Edwards Deming
