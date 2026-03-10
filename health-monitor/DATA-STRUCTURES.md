# Agent Health Monitor — Data Structures

## Core Types

```typescript
// health-monitor/types.ts

export type HealthStatus = 'green' | 'yellow' | 'red';

export interface AgentHealth {
  agentName: string;
  status: HealthStatus;
  metrics: HealthMetrics;
  alerts: Alert[];
  lastChecked: Date;
}

export interface HealthMetrics {
  tokenBurn: TokenBurnMetric;
  loopDetection: LoopMetric;
  sessionDuration: SessionDurationMetric;
  errorRate: ErrorRateMetric;
  responseTime: ResponseTimeMetric;
}

export interface TokenBurnMetric {
  currentHourlyRate: number;        // $/hour
  tokensLastHour: number;
  costLastHour: number;             // $
  trend24h: number[];               // Array of hourly costs
  status: HealthStatus;
}

export interface LoopMetric {
  recentActions: Action[];          // Last 50 actions
  identicalCount: number;           // Count of repeated actions in 15min
  suspectedLoop: boolean;
  status: HealthStatus;
}

export interface Action {
  toolName: string;
  timestamp: Date;
  parametersHash: string;           // Hash of parameters for comparison
}

export interface SessionDurationMetric {
  startTime: Date;
  currentDuration: number;          // minutes
  status: HealthStatus;
}

export interface ErrorRateMetric {
  totalCalls: number;               // Last 1 hour
  failedCalls: number;
  errorRate: number;                // 0-1 (percentage)
  status: HealthStatus;
}

export interface ResponseTimeMetric {
  lastResponseTime: number;         // minutes
  avgResponseTime24h: number;
  status: HealthStatus;
}

export interface Alert {
  id: string;
  agentName: string;
  severity: 'red' | 'yellow';
  type: 'token_burn' | 'loop' | 'hung_session' | 'error_rate' | 'slow_response';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}
```

## In-Memory Storage

```typescript
// health-monitor/storage.ts

export class HealthMonitorStorage {
  private data: Map<string, AgentHealthData>;
  private maxActionsPerAgent = 50;    // FIFO
  private maxAlertsPerAgent = 20;     // FIFO
  
  constructor() {
    this.data = new Map();
  }

  // Store agent's recent actions (FIFO, max 50)
  addAction(agentName: string, action: Action): void {
    const agentData = this.getOrCreate(agentName);
    agentData.actions.push(action);
    if (agentData.actions.length > this.maxActionsPerAgent) {
      agentData.actions.shift(); // Remove oldest
    }
  }

  // Store alert
  addAlert(alert: Alert): void {
    const agentData = this.getOrCreate(alert.agentName);
    agentData.alerts.push(alert);
    if (agentData.alerts.length > this.maxAlertsPerAgent) {
      agentData.alerts.shift();
    }
  }

  // Get agent health data
  getHealth(agentName: string): AgentHealth | null {
    return this.data.get(agentName) || null;
  }

  // Get all agents health
  getAllHealth(): AgentHealth[] {
    return Array.from(this.data.values());
  }

  // Cleanup idle agents (>30 min)
  cleanupIdleAgents(): void {
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;
    
    for (const [agentName, data] of this.data.entries()) {
      if (now - data.lastActivity.getTime() > thirtyMinutes) {
        this.data.delete(agentName);
      }
    }
  }

  private getOrCreate(agentName: string): AgentHealthData {
    if (!this.data.has(agentName)) {
      this.data.set(agentName, {
        agentName,
        actions: [],
        alerts: [],
        lastActivity: new Date()
      });
    }
    return this.data.get(agentName)!;
  }
}

interface AgentHealthData {
  agentName: string;
  actions: Action[];
  alerts: Alert[];
  lastActivity: Date;
}
```

## Threshold Config

```typescript
// health-monitor/config.ts

export const HEALTH_THRESHOLDS = {
  tokenBurn: {
    red: 5.0,      // $/hour
    yellow: 1.0,   // $/hour
  },
  
  loopDetection: {
    red: 20,       // identical actions in 15 min
    yellow: 10,
  },
  
  sessionDuration: {
    red: 240,      // minutes (4 hours)
    yellow: 120,   // minutes (2 hours)
  },
  
  errorRate: {
    red: 0.5,      // 50%
    yellow: 0.2,   // 20%
  },
  
  responseTime: {
    red: 30,       // minutes
    yellow: 5,     // minutes
  }
};

export const ALERT_CONFIG = {
  telegram: {
    enabled: true,
    recipient: 'rick', // agent ID
  },
  
  autoKill: {
    enabled: true,
    gracePeriodsSeconds: 60,
  },
  
  dailyDigest: {
    enabled: true,
    time: '19:00', // 7 PM
  }
};
```

## Memory Limits

```typescript
// Estimated memory usage per agent:
// - 50 actions × 200 bytes = 10 KB
// - 20 alerts × 500 bytes = 10 KB
// - Health metrics = 2 KB
// Total per agent: ~22 KB
// 
// For 18 agents: 18 × 22 KB = 396 KB
// Well under 60 MB limit from spec
```
