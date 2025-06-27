import type { MCPToolCall, AnalyticsMetrics, Resume } from '../types/analytics';

// Mock resumes data
export const mockResumes: Resume[] = [
  { id: '1', title: 'Full Stack Developer', mcpServerKey: 'mcp_key_fullstack_001' },
  { id: '2', title: 'Frontend Specialist', mcpServerKey: 'mcp_key_frontend_002' },
  { id: '3', title: 'Senior React Engineer', mcpServerKey: 'mcp_key_react_003' },
  { id: '4', title: 'DevOps Engineer', mcpServerKey: 'mcp_key_devops_004' },
];

// Mock tools that can be called
const mockTools = [
  'get_resume_summary',
  'get_experience_blocks',
  'get_skills_blocks',
  'get_education_blocks',
  'get_project_blocks',
  'get_contact_info',
  'search_blocks',
  'get_full_resume',
  'get_block_by_id',
  'get_resume_metadata'
];

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
  { country: 'United States', city: 'San Francisco' },
  { country: 'United States', city: 'New York' },
  { country: 'United States', city: 'Seattle' },
  { country: 'Canada', city: 'Toronto' },
  { country: 'Canada', city: 'Vancouver' },
  { country: 'United Kingdom', city: 'London' },
  { country: 'Germany', city: 'Berlin' },
  { country: 'France', city: 'Paris' },
  { country: 'Japan', city: 'Tokyo' },
  { country: 'Australia', city: 'Sydney' },
  { country: 'Netherlands', city: 'Amsterdam' },
  { country: 'Singapore', city: 'Singapore' },
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

// Generate mock data
export const mockToolCalls = generateMockToolCalls(5000, 90);

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

export const mockAnalyticsMetrics = calculateAnalyticsMetrics(mockToolCalls);