# Infrastructure Runbook

**Owner:** Roger (DevOps Engineer)  
**Last Updated:** 2026-03-07

## Emergency Contacts

- **Seb (CEO):** Telegram @seb
- **Larry (CTO):** Internal system
- **Roger (DevOps):** Primary on-call

## Production Systems

### Mission Control
- **URL:** https://missioncontrol.jexhq.com
- **Hosting:** Vercel (serverless)
- **Database:** Railway PostgreSQL
- **Status Page:** (planned)

### Don AI
- **URL:** https://don-ai.com
- **Hosting:** Vercel
- **Database:** Railway PostgreSQL
- **Users:** ~2,400 active

### Baba
- **URL:** https://baba.app
- **Hosting:** Vercel
- **Database:** MongoDB Atlas
- **Users:** ~380 active

### Together
- **URL:** https://together.app
- **Hosting:** Vercel + Expo
- **Database:** Railway PostgreSQL
- **Users:** ~1,100 couples

## Common Issues & Fixes

### 1. Production Down

**Symptoms:**
- 5xx errors
- Timeout errors
- "Application Error" page

**Diagnosis:**
```bash
# Check Vercel deployment status
vercel logs --prod

# Check database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Check external APIs
curl -I https://api.openai.com/v1/models
```

**Fix:**
1. Roll back to previous deployment if recent deploy
2. Check database connection pool (may be exhausted)
3. Restart services if needed
4. Escalate to Larry if not resolved in 10 minutes

### 2. Slow Performance

**Symptoms:**
- Response times >500ms
- Timeout errors
- User complaints

**Diagnosis:**
```bash
# Check database performance
SELECT * FROM pg_stat_activity 
WHERE state = 'active' 
ORDER BY query_start;

# Check for slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

**Fix:**
1. Identify slow queries (missing indexes?)
2. Add indexes if needed
3. Optimize queries
4. Scale database if necessary

### 3. Database Connection Pool Exhausted

**Symptoms:**
- "Too many connections" errors
- Intermittent timeouts

**Fix:**
```typescript
// Update Prisma client config
const pool = new Pool({ 
  connectionString,
  max: 20, // Increase pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 4. Out of Memory

**Symptoms:**
- 137 exit code (OOM killed)
- Application crashes
- Memory usage >95%

**Fix:**
1. Check for memory leaks
2. Optimize queries (reduce data loaded)
3. Scale up instance size
4. Add pagination

### 5. API Rate Limiting

**Symptoms:**
- 429 errors from external APIs
- OpenAI/Anthropic quota exceeded

**Fix:**
1. Implement exponential backoff
2. Add request queuing
3. Cache responses when possible
4. Contact provider to increase limits

## Scheduled Maintenance

### Daily
- **03:00 EST:** Automated database backups
- **04:00 EST:** Log aggregation & archival
- **06:00 EST:** Health checks & monitoring

### Weekly
- **Sunday 02:00 EST:** Database optimization (VACUUM, ANALYZE)
- **Sunday 03:00 EST:** Backup verification (test restore)

### Monthly
- **First Saturday:** Dependency updates & security patches
- **Last Saturday:** Performance review & optimization

## Monitoring

### Metrics to Watch
- **Response Time:** p50, p95, p99
- **Error Rate:** <0.1% target
- **Database:** Query time, connection count, disk usage
- **Memory:** Usage %, swap usage
- **CPU:** Usage %, load average

### Alerts
- **Critical:** Production down, database unreachable
- **High:** Error rate >1%, response time >1s
- **Medium:** Disk usage >80%, memory >90%
- **Low:** Slow queries, increasing error rate

### Dashboards
- **Vercel:** Analytics & deployment status
- **Railway:** Database metrics
- **Sentry:** Error tracking & performance
- **LogTail:** Log aggregation

## Backup & Recovery

### Backup Schedule
- **Frequency:** Daily at 03:00 EST
- **Retention:** 30 days
- **Storage:** S3 (encrypted)
- **Databases:** Mission Control, Don AI, Baba, Together

### Backup Verification
```bash
# Test restore monthly
pg_restore --dbname=test_restore backup.dump

# Verify data integrity
SELECT COUNT(*) FROM tasks;
SELECT MAX(created_at) FROM activity_events;
```

### Disaster Recovery
1. **RTO (Recovery Time Objective):** <1 hour
2. **RPO (Recovery Point Objective):** <24 hours (daily backups)

**Recovery Steps:**
1. Provision new database instance
2. Restore from latest backup
3. Update DATABASE_URL in Vercel
4. Redeploy application
5. Verify data integrity
6. Monitor for issues

## Deployment

### Standard Deployment
```bash
# 1. Merge PR to main
git checkout main
git pull origin main

# 2. Vercel auto-deploys
# (Monitor in Vercel dashboard)

# 3. Run migrations if needed
npx prisma migrate deploy

# 4. Monitor logs
vercel logs --prod --follow
```

### Rollback Procedure
```bash
# 1. Identify working deployment
vercel ls

# 2. Promote previous deployment
vercel promote <deployment-url> --prod

# 3. Verify rollback successful
curl -I https://missioncontrol.jexhq.com
```

### Database Migrations
```bash
# 1. Test migration locally
npx prisma migrate dev

# 2. Deploy to production
npx prisma migrate deploy

# 3. Verify migration
psql $DATABASE_URL -c "\d+ tasks"
```

## Security

### Secrets Management
- Store in Vercel environment variables (encrypted)
- Never commit secrets to git
- Rotate API keys quarterly

### Access Control
- **Vercel:** Larry, Roger, Seb
- **Railway:** Larry, Roger
- **Database:** Read-only access for analytics

### Security Checklist
- [ ] All API endpoints require authentication
- [ ] Input validation on all user input
- [ ] Rate limiting on public endpoints
- [ ] CORS properly configured
- [ ] HTTPS everywhere (no mixed content)
- [ ] Environment variables secured
- [ ] Dependencies updated monthly

## Performance Optimization

### Database
- Add indexes on frequently queried fields
- Use connection pooling
- Implement query caching
- Regular VACUUM & ANALYZE

### API
- Implement response caching
- Use CDN for static assets
- Enable compression (gzip/brotli)
- Optimize payload size

### Frontend
- Code splitting
- Image optimization (Next.js Image)
- Lazy loading components
- Service workers (caching)

## On-Call Procedures

### Escalation Path
1. **Roger** (DevOps) - Primary
2. **Larry** (CTO) - If Roger unavailable or >15min
3. **Seb** (CEO) - Production down >30min or security issue

### Response Times
- **Critical:** <15 minutes
- **High:** <1 hour
- **Medium:** <4 hours
- **Low:** Next business day

### Incident Response
1. Acknowledge alert
2. Assess severity
3. Begin troubleshooting
4. Update status page (when available)
5. Implement fix
6. Verify resolution
7. Post-mortem (for critical incidents)

---

*This runbook is a living document. Update it when you learn something new.*
