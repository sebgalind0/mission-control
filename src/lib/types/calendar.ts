// Calendar API Types

export type EventType = 'task' | 'cron' | 'activity';
export type EventStatus = 'scheduled' | 'in_review' | 'completed';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface CalendarEvent {
  id: string;
  type: EventType;
  title: string;
  agent: string | null;
  department: string | null;
  project: string | null;
  start: string; // ISO 8601 datetime
  end: string | null; // ISO 8601 datetime
  status: EventStatus;
  description: string;
}

export interface AgendaItem {
  id: string;
  type: EventType;
  title: string;
  agent: string | null;
  time: string; // Formatted time (e.g., "02:30 PM")
  countdown: string; // Human-readable countdown (e.g., "in 1h 20m")
  status: EventStatus;
  description: string;
}

export interface GroupedAgenda {
  morning: AgendaItem[];
  afternoon: AgendaItem[];
  evening: AgendaItem[];
}

export interface AgentFilter {
  id: string;
  name: string;
  department: string | null;
}

export interface CalendarFilters {
  agents: AgentFilter[];
  departments: string[];
  projects: string[];
  cached: boolean;
  cacheExpiry: string;
}

// API Response types
export interface EventsResponse {
  events: CalendarEvent[];
  count: number;
  range: {
    start: string;
    end: string;
  };
}

export interface AgendaResponse {
  date: string;
  agenda: GroupedAgenda;
  summary: {
    total: number;
    morning: number;
    afternoon: number;
    evening: number;
  };
}
