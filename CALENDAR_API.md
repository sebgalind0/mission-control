# Calendar API Documentation

## Overview
The Calendar API provides unified access to scheduled events across Mission Control, aggregating tasks, cron jobs, and agent activity into a single calendar view.

## Base URL
All endpoints are prefixed with `/api/calendar`

---

## Endpoints

### 1. Get Calendar Events
**GET** `/api/calendar/events`

Retrieve events for a specified date range with optional filtering.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start` | string | ✅ | Start date (YYYY-MM-DD) |
| `end` | string | ✅ | End date (YYYY-MM-DD) |
| `agents` | string | ❌ | Comma-separated agent IDs (e.g., `bolt,larry`) |
| `projects` | string | ❌ | Comma-separated project IDs |

#### Response
```json
{
  "events": [
    {
      "id": "clx123abc",
      "type": "task",
      "title": "Build Calendar API",
      "agent": "bolt",
      "department": "Engineering",
      "project": "mission-control",
      "start": "2026-03-07T14:00:00.000Z",
      "end": "2026-03-07T14:00:00.000Z",
      "status": "scheduled",
      "description": "Implement calendar endpoints for frontend"
    }
  ],
  "count": 1,
  "range": {
    "start": "2026-03-07",
    "end": "2026-03-14"
  }
}
```

#### Event Status Mapping
| Task Status | Calendar Status |
|-------------|-----------------|
| `BACKLOG` | `scheduled` |
| `IN_PROGRESS` | `scheduled` |
| `REVIEW` | `in_review` |
| `DONE` | `completed` |

#### Example
```bash
curl "http://localhost:3000/api/calendar/events?start=2026-03-07&end=2026-03-14&agents=bolt,larry"
```

---

### 2. Get Daily Agenda
**GET** `/api/calendar/agenda`

Retrieve agenda for a specific day, grouped by time of day with countdown timers.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | ❌ | Target date (YYYY-MM-DD). Defaults to today. |

#### Response
```json
{
  "date": "2026-03-07",
  "agenda": {
    "morning": [
      {
        "id": "clx123abc",
        "type": "task",
        "title": "Team standup",
        "agent": "larry",
        "time": "09:00 AM",
        "countdown": "in 2h 15m",
        "status": "scheduled",
        "description": "Daily sync with engineering team"
      }
    ],
    "afternoon": [],
    "evening": []
  },
  "summary": {
    "total": 1,
    "morning": 1,
    "afternoon": 0,
    "evening": 0
  }
}
```

#### Time Grouping
- **Morning**: 00:00 - 11:59
- **Afternoon**: 12:00 - 17:59
- **Evening**: 18:00 - 23:59

#### Countdown Format
- `in 1h 20m` - Less than 24 hours
- `in 3d` - More than 24 hours
- `overdue` - Past deadline

#### Example
```bash
curl "http://localhost:3000/api/calendar/agenda?date=2026-03-07"
```

---

### 3. Get Available Filters
**GET** `/api/calendar/filters`

Retrieve available filter options (agents, departments, projects) with 5-minute caching.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `refresh` | boolean | ❌ | Force cache refresh (`?refresh=true`) |

#### Response
```json
{
  "agents": [
    {
      "id": "bolt",
      "name": "Bolt",
      "department": "Engineering"
    },
    {
      "id": "larry",
      "name": "Larry",
      "department": "Engineering"
    }
  ],
  "departments": [
    "Engineering",
    "Operations",
    "Analytics"
  ],
  "projects": [
    "mission-control",
    "don-ai",
    "together"
  ],
  "cached": true,
  "cacheExpiry": "2026-03-07T14:05:00.000Z"
}
```

#### Caching
- **TTL**: 5 minutes
- **Storage**: In-memory (per server instance)
- **Refresh**: Set `?refresh=true` to force update

#### Example
```bash
curl "http://localhost:3000/api/calendar/filters"
```

---

### 4. Export Calendar (ICS)
**GET** `/api/calendar/export`

Export events as an ICS file compatible with Google Calendar, Apple Calendar, Outlook, etc.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | ❌ | Target date (YYYY-MM-DD). Defaults to today. |
| `format` | string | ❌ | Export format. Only `ics` supported. |

#### Response
Returns a downloadable `.ics` file with proper headers:
- `Content-Type: text/calendar; charset=utf-8`
- `Content-Disposition: attachment; filename="mission-control-2026-03-07.ics"`

#### ICS Features
- Event UID for updates
- Priority mapping (HIGH=1, MEDIUM=5, LOW=9)
- Status mapping (DONE=COMPLETED, REVIEW=TENTATIVE, other=CONFIRMED)
- Categories (project tags)
- Proper escaping of special characters

#### Example
```bash
curl "http://localhost:3000/api/calendar/export?date=2026-03-07&format=ics" -o calendar.ics
```

---

## Data Integration

### Current Sources
✅ **Task Board** - Tasks with deadlines from Prisma database

### Planned Sources
⏳ **Cron Jobs** - Scheduled recurring tasks  
⏳ **Agent Activity** - Live agent sessions and heartbeats

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Invalid date format. Use YYYY-MM-DD"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `500` - Internal Server Error

---

## TypeScript Types

See `src/lib/types/calendar.ts` for full type definitions:

```typescript
import type { 
  CalendarEvent, 
  AgendaItem, 
  CalendarFilters 
} from '@/lib/types/calendar';
```

---

## Performance

- **Events endpoint**: Indexed queries on `deadline`, `assignee`, `status`
- **Filters endpoint**: 5-minute in-memory cache (reduces DB load)
- **Agenda endpoint**: Single-day query (efficient for mobile)
- **Export endpoint**: Streaming ICS generation (handles large datasets)

---

## Future Enhancements

1. **Recurring Events**: Cron job integration
2. **Agent Activity**: Live session tracking
3. **Calendar Subscriptions**: Persistent ICS URLs
4. **Webhook Notifications**: Real-time event updates
5. **Department Filtering**: Enhanced agent-to-dept mapping

---

Built by **Bolt** ⚡ | Engineering Department
