import type { MCPToolCall, AnalyticsMetrics, Resume, SelfReportedJourney, JourneyEvent, OutcomeMetrics } from '../types/analytics';

// Mock resumes data
export const mockResumes: Resume[] = [
  { id: '1', title: 'Full Stack Developer', mcpServerKey: 'mcp_key_fullstack_001' },
  { id: '2', title: 'Frontend Specialist', mcpServerKey: 'mcp_key_frontend_002' },
  { id: '3', title: 'Senior React Engineer', mcpServerKey: 'mcp_key_react_003' },
  { id: '4', title: 'DevOps Engineer', mcpServerKey: 'mcp_key_devops_004' },
];

// Mock tools that can be called - organized by categories
const mockToolCategories = {
  'Profile': [
    'get_resume_summary',
    'get_contact_info',
    'get_resume_metadata'
  ],
  'Experience': [
    'get_experience_blocks',
    'get_work_history',
    'get_achievements'
  ],
  'Skills': [
    'get_skills_blocks',
    'get_technical_skills',
    'get_certifications'
  ],
  'Education': [
    'get_education_blocks',
    'get_degrees',
    'get_courses'
  ],
  'Projects': [
    'get_project_blocks',
    'get_portfolio',
    'get_github_repos'
  ],
  'Search': [
    'search_blocks',
    'get_block_by_id',
    'get_full_resume'
  ]
};

const mockTools = Object.values(mockToolCategories).flat();

// Mock LLMs
const mockLLMs = [
  'GPT-4',
  'GPT-3.5-turbo',
  'Claude-3-Opus',
  'Claude-3-Sonnet',
  'Claude-3-Haiku',
  'Gemini-Pro',
  'PaLM-2',
  'Unknown'
];

// Mock countries and cities
const mockLocations = [
  { country: 'United States', city: 'San Francisco', code: 'USA' },
  { country: 'United States', city: 'New York', code: 'USA' },
  { country: 'United States', city: 'Seattle', code: 'USA' },
  { country: 'Canada', city: 'Toronto', code: 'CAN' },
  { country: 'Canada', city: 'Vancouver', code: 'CAN' },
  { country: 'United Kingdom', city: 'London', code: 'GBR' },
  { country: 'Germany', city: 'Berlin', code: 'DEU' },
  { country: 'France', city: 'Paris', code: 'FRA' },
  { country: 'Japan', city: 'Tokyo', code: 'JPN' },
  { country: 'Australia', city: 'Sydney', code: 'AUS' },
  { country: 'Netherlands', city: 'Amsterdam', code: 'NLD' },
  { country: 'Singapore', city: 'Singapore', code: 'SGP' },
];

// Mock companies for self-reported data
const mockCompanies = [
  'TechCorp', 'StartupXYZ', 'MegaTech Inc', 'InnovateLabs', 'DataDriven Co',
  'CloudFirst', 'AI Solutions', 'DevTools Inc', 'ScaleUp', 'NextGen Tech',
  'FinTech Pro', 'HealthTech', 'EduTech', 'GreenTech', 'CyberSec Corp'
];

const mockPositions = [
  'Senior Software Engineer', 'Full Stack Developer', 'Frontend Engineer',
  'Backend Developer', 'DevOps Engineer', 'Data Scientist', 'Product Manager',
  'Engineering Manager', 'Principal Engineer', 'Staff Engineer', 'Tech Lead'
];

// Generate mock tool calls
const generateMockToolCalls = (count: number, daysBack: number = 30): MCPToolCall[] => {
  const calls: MCPToolCall[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const resume = mockResumes[Math.floor(Math.random() * mockResumes.length)];
    const tool = mockTools[Math.floor(Math.random() * mockTools.length)];
    const location = mockLocations[Math.floor(Math.random() * mockLocations.length)];
    const llm = mockLLMs[Math.floor(Math.random() * mockLLMs.length)];
    
    // Generate timestamp within the last `daysBack` days
    const timestamp = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
    
    // Generate realistic response times (50ms to 2000ms, with most being fast)
    const responseTime = Math.random() < 0.8 
      ? 50 + Math.random() * 300  // 80% are fast (50-350ms)
      : 350 + Math.random() * 1650; // 20% are slower (350-2000ms)
    
    // Generate response status (95% success rate)
    const responseStatus = Math.random() < 0.95 ? 'success' : 
      (Math.random() < 0.7 ? 'error' : 'timeout') as 'success' | 'error' | 'timeout';
    
    // Generate spam probability (5% spam)
    const isSpam = Math.random() < 0.05;
    const spamScore = isSpam ? 0.7 + Math.random() * 0.3 : Math.random() * 0.3;
    
    calls.push({
      id: `call_${i}_${Date.now()}`,
      mcpServerKey: resume.mcpServerKey,
      resumeId: resume.id,
      toolCalled: tool,
      timestamp,
      responseTime: Math.round(responseTime),
      responseStatus,
      userAgent: generateUserAgent(llm),
      ipAddressHash: `hash_${Math.random().toString(36).substring(2, 15)}`,
      clientCountry: location.country,
      clientCity: location.city,
      clientTimezone: generateTimezone(location.country),
      blockIds: generateBlockIds(),
      userId: `user_${Math.floor(Math.random() * 1000)}`,
      detectedLLM: llm !== 'Unknown' ? llm : undefined,
      isSpam,
      spamScore
    });
  }
  
  return calls.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const generateUserAgent = (llm: string): string => {
  const agents = {
    'GPT-4': 'OpenAI-GPT/4.0 (ChatGPT; +https://openai.com/chatgpt)',
    'GPT-3.5-turbo': 'OpenAI-GPT/3.5 (ChatGPT; +https://openai.com/chatgpt)',
    'Claude-3-Opus': 'Anthropic-Claude/3.0 (Opus; +https://anthropic.com)',
    'Claude-3-Sonnet': 'Anthropic-Claude/3.0 (Sonnet; +https://anthropic.com)',
    'Claude-3-Haiku': 'Anthropic-Claude/3.0 (Haiku; +https://anthropic.com)',
    'Gemini-Pro': 'Google-Gemini/1.0 (Pro; +https://ai.google.dev)',
    'PaLM-2': 'Google-PaLM/2.0 (+https://ai.google.dev)',
    'Unknown': 'Mozilla/5.0 (compatible; UnknownBot/1.0)'
  };
  return agents[llm as keyof typeof agents] || agents.Unknown;
};

const generateTimezone = (country: string): string => {
  const timezones: Record<string, string> = {
    'United States': 'America/Los_Angeles',
    'Canada': 'America/Toronto',
    'United Kingdom': 'Europe/London',
    'Germany': 'Europe/Berlin',
    'France': 'Europe/Paris',
    'Japan': 'Asia/Tokyo',
    'Australia': 'Australia/Sydney',
    'Netherlands': 'Europe/Amsterdam',
    'Singapore': 'Asia/Singapore'
  };
  return timezones[country] || 'UTC';
};

const generateBlockIds = (): string[] => {
  const blockCount = Math.floor(Math.random() * 5) + 1;
  const blocks = [];
  for (let i = 0; i < blockCount; i++) {
    blocks.push(`block_${Math.random().toString(36).substring(2, 10)}`);
  }
  return blocks;
};

// Generate mock self-reported journeys
const generateMockSelfReportedJourneys = (): SelfReportedJourney[] => {
  const journeys: SelfReportedJourney[] = [];
  
  mockResumes.forEach(resume => {
    const events: JourneyEvent[] = [];
    const numApplications = Math.floor(Math.random() * 8) + 3; // 3-10 applications per resume
    
    for (let i = 0; i < numApplications; i++) {
      const company = mockCompanies[Math.floor(Math.random() * mockCompanies.length)];
      const position = mockPositions[Math.floor(Math.random() * mockPositions.length)];
      const applicationDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000); // Last 6 months
      
      // Initial outreach
      events.push({
        type: 'initial_outreach',
        id: `outreach_${i}_${resume.id}`,
        resumeId: resume.id,
        date: applicationDate,
        companyName: company,
        positionTitle: position,
        notes: Math.random() > 0.7 ? 'Applied through company website' : undefined
      });
      
      // Determine if this application progresses
      const progressProbability = Math.random();
      
      if (progressProbability > 0.4) { // 60% get some response
        // Follow-up call
        const callDate = new Date(applicationDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000);
        const callOutcome = Math.random() > 0.3 ? 'moved_forward' : (Math.random() > 0.5 ? 'rejected' : 'ghosted');
        
        events.push({
          type: 'follow_up_call',
          id: `call_${i}_${resume.id}`,
          resumeId: resume.id,
          date: callDate,
          duration: Math.floor(Math.random() * 45) + 15, // 15-60 minutes
          callType: Math.random() > 0.5 ? 'recruiter_screen' : 'technical_screen',
          outcome: callOutcome as any,
          notes: Math.random() > 0.8 ? 'Great conversation about the role' : undefined
        });
        
        if (callOutcome === 'moved_forward' && Math.random() > 0.3) { // 70% of those who move forward get interviews
          // Interview rounds
          const numRounds = Math.floor(Math.random() * 4) + 1; // 1-4 rounds
          let lastInterviewDate = callDate;
          let stillProgressing = true;
          
          for (let round = 0; round < numRounds && stillProgressing; round++) {
            const interviewDate = new Date(lastInterviewDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000);
            const interviewOutcome = round === numRounds - 1 ? 
              (Math.random() > 0.4 ? 'moved_forward' : 'rejected') : 
              (Math.random() > 0.2 ? 'moved_forward' : 'rejected');
            
            events.push({
              type: 'interview_round',
              id: `interview_${i}_${round}_${resume.id}`,
              resumeId: resume.id,
              date: interviewDate,
              location: ['phone', 'video', 'onsite', 'hybrid'][Math.floor(Math.random() * 4)] as any,
              interviewerCount: Math.floor(Math.random() * 4) + 1,
              interviewType: ['technical', 'behavioral', 'system_design', 'coding', 'cultural_fit'][Math.floor(Math.random() * 5)] as any,
              difficultyRating: Math.floor(Math.random() * 10) + 1,
              outcome: interviewOutcome as any,
              feedbackReceived: Math.random() > 0.6 ? 'Positive feedback on technical skills' : undefined,
              notes: Math.random() > 0.7 ? 'Challenging but fair questions' : undefined
            });
            
            lastInterviewDate = interviewDate;
            stillProgressing = interviewOutcome === 'moved_forward';
          }
          
          // Final outcome
          if (stillProgressing && Math.random() > 0.5) { // 50% of final rounds get offers
            const offerDate = new Date(lastInterviewDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
            const baseSalary = Math.floor(Math.random() * 100000) + 80000; // $80k-$180k
            const hasSigningBonus = Math.random() > 0.6;
            const hasEquity = Math.random() > 0.4;
            
            events.push({
              type: 'offer',
              id: `offer_${i}_${resume.id}`,
              resumeId: resume.id,
              date: offerDate,
              baseSalary,
              signingBonus: hasSigningBonus ? Math.floor(Math.random() * 30000) + 5000 : undefined,
              equity: hasEquity ? {
                type: Math.random() > 0.5 ? 'rsu' : 'options',
                amount: Math.floor(Math.random() * 50000) + 10000,
                vestingSchedule: '4 years, 25% per year'
              } : undefined,
              otherPerksValue: Math.floor(Math.random() * 10000) + 2000,
              totalCompCalculation: baseSalary + (hasSigningBonus ? Math.floor(Math.random() * 30000) + 5000 : 0) + Math.floor(Math.random() * 10000) + 2000,
              negotiationNotes: Math.random() > 0.7 ? 'Negotiated salary up by $10k' : undefined,
              initialOffer: baseSalary - (Math.random() > 0.5 ? Math.floor(Math.random() * 15000) : 0),
              finalOffer: baseSalary,
              status: Math.random() > 0.3 ? 'accepted' : (Math.random() > 0.5 ? 'declined' : 'pending'),
              declineReason: Math.random() > 0.8 ? 'Better offer elsewhere' : undefined
            });
          } else {
            // Rejection
            const rejectionDate = new Date(lastInterviewDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000);
            const stages = ['initial_screening', 'phone_screen', 'technical_interview', 'onsite', 'final_round'];
            
            events.push({
              type: 'rejection',
              id: `rejection_${i}_${resume.id}`,
              resumeId: resume.id,
              date: rejectionDate,
              stage: stages[Math.min(Math.floor(Math.random() * stages.length), stages.length - 1)] as any,
              reasonGiven: Math.random() > 0.5 ? 'Decided to go with another candidate' : undefined,
              realReason: Math.random() > 0.7 ? 'Probably overqualified' : undefined,
              notes: Math.random() > 0.8 ? 'They seemed interested but went silent' : undefined
            });
          }
        } else if (callOutcome === 'rejected') {
          // Early rejection
          const rejectionDate = new Date(callDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000);
          
          events.push({
            type: 'rejection',
            id: `rejection_${i}_${resume.id}`,
            resumeId: resume.id,
            date: rejectionDate,
            stage: 'phone_screen',
            reasonGiven: Math.random() > 0.5 ? 'Not a good fit for the role' : undefined,
            realReason: Math.random() > 0.7 ? 'Salary expectations too high' : undefined
          });
        }
      }
    }
    
    journeys.push({
      resumeId: resume.id,
      events: events.sort((a, b) => a.date.getTime() - b.date.getTime())
    });
  });
  
  return journeys;
};

// Generate mock data
export const mockToolCalls = generateMockToolCalls(5000, 90);
export const mockSelfReportedJourneys = generateMockSelfReportedJourneys();

// Calculate analytics metrics from mock data
export const calculateAnalyticsMetrics = (
  toolCalls: MCPToolCall[],
  includeSpam: boolean = false
): AnalyticsMetrics => {
  const filteredCalls = includeSpam ? toolCalls : toolCalls.filter(call => !call.isSpam);
  
  const totalRequests = filteredCalls.length;
  const uniqueConsumers = new Set(filteredCalls.map(call => call.ipAddressHash)).size;
  const averageResponseTime = Math.round(
    filteredCalls.reduce((sum, call) => sum + call.responseTime, 0) / totalRequests
  );
  const successRate = Math.round(
    (filteredCalls.filter(call => call.responseStatus === 'success').length / totalRequests) * 100
  );
  const spamRequestsBlocked = toolCalls.filter(call => call.isSpam).length;
  
  // Top tools
  const toolCounts = filteredCalls.reduce((acc, call) => {
    acc[call.toolCalled] = (acc[call.toolCalled] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topTools = Object.entries(toolCounts)
    .map(([tool, count]) => ({
      tool,
      count,
      percentage: Math.round((count / totalRequests) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Top blocks (mock block names)
  const blockNames: Record<string, string> = {
    'block_exp001': 'Senior Software Engineer at TechCorp',
    'block_exp002': 'Full Stack Developer at StartupXYZ',
    'block_edu001': 'Computer Science Degree - MIT',
    'block_skill001': 'React & TypeScript Expertise',
    'block_proj001': 'E-commerce Platform Project',
    'block_proj002': 'Open Source Contributions',
  };
  
  const blockCounts = filteredCalls.reduce((acc, call) => {
    call.blockIds.forEach(blockId => {
      acc[blockId] = (acc[blockId] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const topBlocks = Object.entries(blockCounts)
    .map(([blockId, count]) => ({
      blockId,
      blockName: blockNames[blockId] || `Block ${blockId.slice(-3)}`,
      count,
      percentage: Math.round((count / totalRequests) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // LLM breakdown
  const llmCounts = filteredCalls.reduce((acc, call) => {
    const llm = call.detectedLLM || 'Unknown';
    acc[llm] = (acc[llm] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const llmBreakdown = Object.entries(llmCounts)
    .map(([llm, count]) => ({
      llm,
      count,
      percentage: Math.round((count / totalRequests) * 100)
    }))
    .sort((a, b) => b.count - a.count);
  
  // Requests by hour (last 24 hours)
  const requestsByHour = Array.from({ length: 24 }, (_, hour) => {
    const count = filteredCalls.filter(call => {
      const callHour = call.timestamp.getHours();
      const isToday = call.timestamp.toDateString() === new Date().toDateString();
      return isToday && callHour === hour;
    }).length;
    return { hour, count };
  });
  
  // Requests by day (last 30 days)
  const requestsByDay = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const daysCalls = filteredCalls.filter(call => 
      call.timestamp.toISOString().split('T')[0] === dateString
    );
    
    return {
      date: dateString,
      count: daysCalls.length,
      uniqueConsumers: new Set(daysCalls.map(call => call.ipAddressHash)).size
    };
  }).reverse();
  
  // Geographic data
  const geoCounts = filteredCalls.reduce((acc, call) => {
    const key = `${call.clientCountry}|${call.clientCity}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const geographicData = Object.entries(geoCounts)
    .map(([key, count]) => {
      const [country, city] = key.split('|');
      return { country, city, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  
  // Suspicious patterns
  const suspiciousPatterns = [
    {
      type: 'rate_limit' as const,
      description: 'High frequency requests from single IP',
      count: Math.floor(Math.random() * 50) + 10,
      severity: 'medium' as const
    },
    {
      type: 'weird_user_agent' as const,
      description: 'Unusual or malformed user agents detected',
      count: Math.floor(Math.random() * 20) + 5,
      severity: 'low' as const
    },
    {
      type: 'suspicious_timing' as const,
      description: 'Coordinated request patterns across multiple IPs',
      count: Math.floor(Math.random() * 15) + 2,
      severity: 'high' as const
    }
  ];
  
  return {
    totalRequests,
    uniqueConsumers,
    averageResponseTime,
    successRate,
    spamRequestsBlocked,
    topTools,
    topBlocks,
    llmBreakdown,
    requestsByHour,
    requestsByDay,
    geographicData,
    suspiciousPatterns
  };
};

// Calculate outcome metrics from self-reported data
export const calculateOutcomeMetrics = (journeys: SelfReportedJourney[]): OutcomeMetrics => {
  const allEvents = journeys.flatMap(journey => journey.events);
  
  const applications = allEvents.filter(event => event.type === 'initial_outreach');
  const interviews = allEvents.filter(event => event.type === 'interview_round');
  const offers = allEvents.filter(event => event.type === 'offer');
  const rejections = allEvents.filter(event => event.type === 'rejection');
  
  // Calculate average times
  const calculateAverageTime = (startEvents: JourneyEvent[], endEvents: JourneyEvent[], resumeId?: string) => {
    const times: number[] = [];
    
    startEvents.forEach(startEvent => {
      const matchingEndEvents = endEvents.filter(endEvent => 
        endEvent.resumeId === startEvent.resumeId && 
        endEvent.date.getTime() > startEvent.date.getTime()
      );
      
      if (matchingEndEvents.length > 0) {
        const earliestEnd = matchingEndEvents.reduce((earliest, current) => 
          current.date.getTime() < earliest.date.getTime() ? current : earliest
        );
        
        const timeDiff = (earliestEnd.date.getTime() - startEvent.date.getTime()) / (1000 * 60 * 60 * 24);
        times.push(timeDiff);
      }
    });
    
    return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
  };
  
  const averageTimeToInterview = calculateAverageTime(applications, interviews);
  const averageTimeToOffer = calculateAverageTime(applications, offers);
  
  // Calculate conversion rates
  const applicationToInterview = applications.length > 0 ? (interviews.length / applications.length) * 100 : 0;
  const interviewToOffer = interviews.length > 0 ? (offers.length / interviews.length) * 100 : 0;
  const applicationToOffer = applications.length > 0 ? (offers.length / applications.length) * 100 : 0;
  
  // Calculate average offer amount
  const offerAmounts = offers.map(offer => (offer as any).totalCompCalculation).filter(amount => amount > 0);
  const averageOfferAmount = offerAmounts.length > 0 ? 
    offerAmounts.reduce((sum, amount) => sum + amount, 0) / offerAmounts.length : 0;
  
  // Calculate average difficulty rating
  const difficultyRatings = interviews.map(interview => (interview as any).difficultyRating).filter(rating => rating > 0);
  const averageDifficultyRating = difficultyRatings.length > 0 ?
    difficultyRatings.reduce((sum, rating) => sum + rating, 0) / difficultyRatings.length : 0;
  
  return {
    totalApplications: applications.length,
    totalInterviews: interviews.length,
    totalOffers: offers.length,
    totalRejections: rejections.length,
    averageTimeToOffer: Math.round(averageTimeToOffer),
    averageTimeToInterview: Math.round(averageTimeToInterview),
    conversionRates: {
      applicationToInterview: Math.round(applicationToInterview),
      interviewToOffer: Math.round(interviewToOffer),
      applicationToOffer: Math.round(applicationToOffer)
    },
    averageOfferAmount: Math.round(averageOfferAmount),
    averageDifficultyRating: Math.round(averageDifficultyRating * 10) / 10
  };
};

// Helper functions for chart data transformation
export const getToolCallsByResumeData = (toolCalls: MCPToolCall[]) => {
  return mockResumes.map(resume => ({
    resumeId: resume.id,
    count: toolCalls.filter(call => call.resumeId === resume.id).length
  }));
};

export const getRequestVolumeData = (toolCalls: MCPToolCall[]) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => {
    const daysCalls = toolCalls.filter(call => 
      call.timestamp.toISOString().split('T')[0] === date
    );

    const toolBreakdown = mockTools.reduce((acc, tool) => {
      acc[tool] = daysCalls.filter(call => call.toolCalled === tool).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...toolBreakdown
    };
  });
};

export const getToolCategoriesData = (toolCalls: MCPToolCall[]) => {
  const categoryCounts = Object.entries(mockToolCategories).map(([category, tools]) => {
    const count = toolCalls.filter(call => tools.includes(call.toolCalled)).length;
    
    const children = tools.map(tool => ({
      name: tool,
      value: toolCalls.filter(call => call.toolCalled === tool).length
    })).filter(child => child.value > 0);

    return {
      name: category,
      value: count,
      children: children.length > 0 ? children : undefined
    };
  }).filter(category => category.value > 0);

  return {
    name: 'MCP Tools',
    children: categoryCounts
  };
};

export const getBlockPerformanceData = (toolCalls: MCPToolCall[]) => {
  const blockTypes = ['Experience', 'Skills', 'Education', 'Projects', 'Profile'];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => {
    const daysCalls = toolCalls.filter(call => 
      call.timestamp.toISOString().split('T')[0] === date
    );

    const blockBreakdown = blockTypes.reduce((acc, blockType) => {
      // Mock block type assignment based on tool called
      const relevantCalls = daysCalls.filter(call => {
        if (blockType === 'Experience') return call.toolCalled.includes('experience') || call.toolCalled.includes('work');
        if (blockType === 'Skills') return call.toolCalled.includes('skill') || call.toolCalled.includes('technical');
        if (blockType === 'Education') return call.toolCalled.includes('education') || call.toolCalled.includes('degree');
        if (blockType === 'Projects') return call.toolCalled.includes('project') || call.toolCalled.includes('portfolio');
        if (blockType === 'Profile') return call.toolCalled.includes('summary') || call.toolCalled.includes('contact');
        return false;
      });
      acc[blockType] = relevantCalls.length;
      return acc;
    }, {} as Record<string, number>);

    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...blockBreakdown
    };
  });
};

export const getSecurityInsightsData = (toolCalls: MCPToolCall[]) => {
  const flagTypes = ['Rate Limit', 'Suspicious Agent', 'Coordinated Attack', 'Malformed Request'];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => {
    const daysCalls = toolCalls.filter(call => 
      call.timestamp.toISOString().split('T')[0] === date && call.isSpam
    );

    const flagBreakdown = flagTypes.reduce((acc, flagType) => {
      // Mock flag assignment
      acc[flagType] = Math.floor(daysCalls.length * Math.random() * 0.3);
      return acc;
    }, {} as Record<string, number>);

    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...flagBreakdown
    };
  });
};

export const getGeographicBarData = (toolCalls: MCPToolCall[]) => {
  const countryCounts = toolCalls.reduce((acc, call) => {
    acc[call.clientCountry] = (acc[call.clientCountry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

export const mockAnalyticsMetrics = calculateAnalyticsMetrics(mockToolCalls);
export const mockOutcomeMetrics = calculateOutcomeMetrics(mockSelfReportedJourneys);