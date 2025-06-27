export interface MCPToolCall {
  id: string;
  mcpServerKey: string;
  resumeId: string;
  toolCalled: string;
  timestamp: Date;
  responseTime: number;
  responseStatus: 'success' | 'error' | 'timeout';
  userAgent: string;
  ipAddressHash: string;
  clientCountry: string;
  clientCity: string;
  clientTimezone: string;
  blockIds: string[];
  userId: string;
  detectedLLM?: string;
  isSpam?: boolean;
  spamScore?: number;
}

export interface AnalyticsMetrics {
  totalRequests: number;
  uniqueConsumers: number;
  averageResponseTime: number;
  successRate: number;
  spamRequestsBlocked: number;
  topTools: Array<{ tool: string; count: number; percentage: number }>;
  topBlocks: Array<{ blockId: string; blockName: string; count: number; percentage: number }>;
  llmBreakdown: Array<{ llm: string; count: number; percentage: number }>;
  requestsByHour: Array<{ hour: number; count: number }>;
  requestsByDay: Array<{ date: string; count: number; uniqueConsumers: number }>;
  geographicData: Array<{ country: string; city: string; count: number }>;
  suspiciousPatterns: Array<{
    type: 'rate_limit' | 'weird_user_agent' | 'suspicious_timing';
    description: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface AnalyticsFilters {
  resumeId?: string;
  toolCalled?: string;
  timeRange: {
    start: Date;
    end: Date;
    preset?: 'last_24h' | 'last_7d' | 'last_30d' | 'last_90d' | 'custom';
  };
  includeSpam: boolean;
}

export interface Resume {
  id: string;
  title: string;
  mcpServerKey: string;
}