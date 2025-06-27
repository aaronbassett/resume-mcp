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

// Self-Reported Analytics Types
export interface InitialOutreach {
  type: 'initial_outreach';
  id: string;
  resumeId: string;
  date: Date;
  companyName: string;
  positionTitle: string;
  notes?: string;
}

export interface FollowUpCall {
  type: 'follow_up_call';
  id: string;
  resumeId: string;
  date: Date;
  duration: number; // in minutes
  callType: 'recruiter_screen' | 'technical_screen' | 'hiring_manager' | 'other';
  outcome: 'moved_forward' | 'rejected' | 'ghosted' | 'pending';
  notes?: string;
}

export interface InterviewRound {
  type: 'interview_round';
  id: string;
  resumeId: string;
  date: Date;
  location: 'phone' | 'video' | 'onsite' | 'hybrid';
  interviewerCount: number;
  interviewType: 'technical' | 'behavioral' | 'system_design' | 'coding' | 'cultural_fit' | 'other';
  difficultyRating: number; // 1-10
  outcome: 'moved_forward' | 'rejected' | 'pending';
  feedbackReceived?: string;
  notes?: string;
}

export interface Rejection {
  type: 'rejection';
  id: string;
  resumeId: string;
  date: Date;
  stage: 'initial_screening' | 'phone_screen' | 'technical_interview' | 'onsite' | 'final_round' | 'offer_stage';
  reasonGiven?: string;
  realReason?: string; // User's perspective
  notes?: string;
}

export interface Offer {
  type: 'offer';
  id: string;
  resumeId: string;
  date: Date;
  baseSalary: number;
  signingBonus?: number;
  equity?: {
    type: 'rsu' | 'options';
    amount: number;
    vestingSchedule: string;
  };
  otherPerksValue?: number;
  totalCompCalculation: number;
  negotiationNotes?: string;
  initialOffer?: number;
  finalOffer?: number;
  status: 'accepted' | 'declined' | 'pending';
  declineReason?: string;
}

export type JourneyEvent = InitialOutreach | FollowUpCall | InterviewRound | Rejection | Offer;

export interface SelfReportedJourney {
  resumeId: string;
  events: JourneyEvent[];
}

export interface ApplicationFunnelData {
  stage: string;
  count: number;
  conversionRate?: number;
}

export interface OutcomeMetrics {
  totalApplications: number;
  totalInterviews: number;
  totalOffers: number;
  totalRejections: number;
  averageTimeToOffer: number; // in days
  averageTimeToInterview: number; // in days
  conversionRates: {
    applicationToInterview: number;
    interviewToOffer: number;
    applicationToOffer: number;
  };
  averageOfferAmount: number;
  averageDifficultyRating: number;
}