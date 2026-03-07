# Analytics API Expansion - Complete ⚡

**Built by:** Bolt  
**Date:** March 6, 2026  
**Duration:** ~5 minutes

## What Was Built

Three new analytics endpoints to track agent model usage, embeddings, and detailed performance:

### 1. GET /api/analytics/models
Tracks which agents use which models with token/cost aggregation.

**Location:** `src/app/api/analytics/models/route.ts`

**Returns:**
```json
{
  "modelUsage": [
    { "agent": "rick", "model": "anthropic/claude-sonnet-4-5", "tokensUsed": 25000, "cost": 0.125 }
  ],
  "summary": {
    "totalTokens": 43500,
    "totalCost": 0.22,
    "uniqueModels": 1,
    "uniqueAgents": 2
  }
}
```

### 2. GET /api/analytics/embeddings
Tracks Wispr Flow and OpenAI embeddings usage.

**Location:** `src/app/api/analytics/embeddings/route.ts`

**Returns:**
```json
{
  "embeddingsUsage": [
    { "service": "OpenAI", "requests": 150, "tokens": 230400, "cost": 0.0230 }
  ],
  "summary": {
    "totalRequests": 180,
    "totalTokens": 276480,
    "totalCost": 0.0276,
    "avgTokensPerRequest": 1536,
    "requestsThisWeek": 45
  }
}
```

### 3. GET /api/analytics/agents/:id
Detailed agent performance metrics.

**Location:** `src/app/api/analytics/agents/[id]/route.ts`

**Example:** `/api/analytics/agents/bolt`

**Returns:**
```json
{
  "agent": "bolt",
  "performance": {
    "completionRate": 85,
    "avgTaskTimeHours": 3.5,
    "tokensUsed": 18500,
    "cost": 0.09
  },
  "tasks": {
    "total": 40,
    "completed": 34,
    "active": 2,
    "statusBreakdown": { ... }
  },
  "recentPerformance": { ... },
  "deadlines": { ... },
  "activeWork": [ ... ]
}
```

## Technical Details

- **TypeScript:** Fully typed with Prisma schema integration
- **Graceful Degradation:** Handles missing `ActivityEvent` and `ActiveWork` tables
- **Aggregation:** Computes metrics from existing task/agent data
- **Cost Estimation:** Uses token counts and standard pricing ($0.01/1K tokens for LLM, $0.0001/1K for embeddings)

## Testing

All endpoints tested and working:

```bash
# Test models endpoint
curl http://localhost:3000/api/analytics/models | jq '.summary'

# Test embeddings endpoint
curl http://localhost:3000/api/analytics/embeddings | jq '.summary'

# Test agent endpoint
curl http://localhost:3000/api/analytics/agents/bolt | jq '.performance'
```

## Documentation

Added comprehensive API documentation to `API_DOCS.md` including:
- Request/response schemas
- Metric definitions
- Example responses

## Future Enhancements

When `ActivityEvent` and `ActiveWork` tables are populated:
1. Real-time token tracking from agent metadata
2. Live embeddings usage monitoring
3. Active work progress tracking
4. Historical performance trends

## Files Modified

- ✅ Created: `src/app/api/analytics/models/route.ts`
- ✅ Created: `src/app/api/analytics/embeddings/route.ts`
- ✅ Created: `src/app/api/analytics/agents/[id]/route.ts`
- ✅ Updated: `API_DOCS.md` (added analytics extensions section)

---

**Status:** ✅ Complete and tested  
**Ready for:** Production deployment
