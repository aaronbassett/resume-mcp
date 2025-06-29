import type { FC } from 'react';
import { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle, 
  Shield, 
  Zap,
  Code,
  Blocks,
  Download,
  RefreshCw,
  Target,
  TrendingUp,
  Calendar,
  Globe
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { MetricsCard } from '../components/analytics/MetricsCard';
import { TimeRangeSelector } from '../components/analytics/TimeRangeSelector';
import { ResumeMultiSelector } from '../components/analytics/ResumeMultiSelector';
import { ToggleSwitch } from '../components/analytics/ToggleSwitch';
import { SecurityInsights } from '../components/analytics/SecurityInsights';
import { SelfReportedJourneyTracker } from '../components/analytics/SelfReportedJourneyTracker';
import { ApplicationFunnelSankey } from '../components/analytics/ApplicationFunnelSankey';
import { ParallelCoordinatesChart } from '../components/analytics/ParallelCoordinatesChart';
import { CalendarChart } from '../components/analytics/CalendarChart';
import { StackedBarChart } from '../components/analytics/StackedBarChart';
import { PieChart } from '../components/analytics/PieChart';
import { SunburstChart } from '../components/analytics/SunburstChart';
import { ChoroplethMap } from '../components/analytics/ChoroplethMap';
import { 
  mockAnalyticsMetrics, 
  mockResumes, 
  calculateAnalyticsMetrics, 
  mockToolCalls,
  mockSelfReportedJourneys,
  mockOutcomeMetrics,
  getToolCallsByResumeData,
  getRequestVolumeData,
  getToolCategoriesData,
  getBlockPerformanceData,
  getSecurityInsightsData,
  getGeographicBarData
} from '../utils/mockAnalyticsData';
import type { AnalyticsFilters } from '../types/analytics';

export const AnalyticsPage: FC = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
      preset: 'last_30d'
    },
    includeSpam: false
  });

  const [selectedResumeIds, setSelectedResumeIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'mcp_analytics' | 'self_reported'>('mcp_analytics');

  // In a real app, this would filter the actual data based on the filters
  const filteredMetrics = calculateAnalyticsMetrics(mockToolCalls, filters.includeSpam);

  const handleTimeRangeChange = (range: string) => {
    const now = new Date();
    let start: Date;
    
    switch (range) {
      case 'last_24h':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'last_7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last_30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last_90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        // Keep existing dates for custom range
        return;
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    setFilters(prev => ({
      ...prev,
      timeRange: { start, end: now, preset: range as any }
    }));
  };

  const handleCustomRangeChange = (start: Date, end: Date) => {
    setFilters(prev => ({
      ...prev,
      timeRange: { start, end, preset: 'custom' }
    }));
  };

  const handleResumeChange = (resumeId?: string) => {
    setSelectedResumeIds(resumeId ? [resumeId] : []);
    setFilters(prev => ({
      ...prev,
      resumeId
    }));
  };

  const handleSpamToggle = (includeSpam: boolean) => {
    setFilters(prev => ({
      ...prev,
      includeSpam
    }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    // In a real app, this would export the data
    console.log('Exporting analytics data...');
  };

  // Prepare chart data
  const toolCallsByResume = getToolCallsByResumeData(mockToolCalls);
  const requestVolumeData = getRequestVolumeData(mockToolCalls);
  const toolCategoriesData = getToolCategoriesData(mockToolCalls);
  const blockPerformanceData = getBlockPerformanceData(mockToolCalls);
  const securityInsightsData = getSecurityInsightsData(mockToolCalls);
  const geographicBarData = getGeographicBarData(mockToolCalls);

  // Transform LLM data for pie chart
  const llmPieData = filteredMetrics.llmBreakdown.map(item => ({
    id: item.llm,
    label: item.llm,
    value: item.count
  }));

  // Transform geographic data for choropleth
  const choroplethData = filteredMetrics.geographicData.map(item => ({
    id: item.country.substring(0, 3).toUpperCase(),
    value: item.count
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics Dashboard"
        description="Monitor your resume performance and track your job search journey."
        breadcrumbs={[
          { label: 'Analytics' }
        ]}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveTab('mcp_analytics')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'mcp_analytics' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>MCP Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('self_reported')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'self_reported' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Target className="h-4 w-4" />
              <span>Self-Reported Analytics</span>
            </button>
          </div>
        </CardHeader>
      </Card>

      {activeTab === 'mcp_analytics' && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-6">
                  <TimeRangeSelector
                    selectedRange={filters.timeRange.preset || 'last_30d'}
                    customStartDate={filters.timeRange.start}
                    customEndDate={filters.timeRange.end}
                    onRangeChange={handleTimeRangeChange}
                    onCustomRangeChange={handleCustomRangeChange}
                  />
                  
                  <ResumeMultiSelector
                    resumes={mockResumes}
                    selectedResumeId={filters.resumeId}
                    onResumeChange={handleResumeChange}
                  />
                </div>
                
                <ToggleSwitch
                  checked={filters.includeSpam}
                  onChange={handleSpamToggle}
                  label="Include spam requests"
                  description="Show flagged and suspicious requests"
                />
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricsCard
              title="Total Requests"
              value={filteredMetrics.totalRequests}
              change="+12% from last period"
              changeType="positive"
              trend="up"
              icon={BarChart3}
              description="MCP tool calls received"
            />
            <MetricsCard
              title="Unique Consumers"
              value={filteredMetrics.uniqueConsumers}
              change="+8% from last period"
              changeType="positive"
              trend="up"
              icon={Users}
              description="Distinct LLM instances"
            />
            <MetricsCard
              title="Avg Response Time"
              value={`${filteredMetrics.averageResponseTime}ms`}
              change="-15ms from last period"
              changeType="positive"
              trend="down"
              icon={Clock}
              description="API response latency"
            />
            <MetricsCard
              title="Success Rate"
              value={`${filteredMetrics.successRate}%`}
              change="+2% from last period"
              changeType="positive"
              trend="up"
              icon={CheckCircle}
              description="Successful API calls"
            />
          </div>

          {/* Calendar Chart */}
          <CalendarChart
            data={filteredMetrics.requestsByDay}
            title="Tool Calls Calendar"
            description="Daily tool call activity over the past year"
          />

          {/* Request Volume and LLM Breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            <StackedBarChart
              data={requestVolumeData}
              keys={['get_resume_summary', 'get_experience_blocks', 'get_skills_blocks', 'search_blocks', 'get_full_resume']}
              indexBy="date"
              title="Request Volume"
              description="Daily tool calls stacked by tool type"
              axisBottomLegend="Date"
              axisLeftLegend="Number of Calls"
            />
            <PieChart
              data={llmPieData}
              title="LLM Breakdown"
              description="Requests by detected language model"
            />
          </div>

          {/* Tool Categories and Block Performance */}
          <div className="grid gap-6 lg:grid-cols-2">
            <SunburstChart
              data={toolCategoriesData}
              title="Most Called Tools"
              description="Tool usage grouped by categories"
            />
            <StackedBarChart
              data={blockPerformanceData}
              keys={['Experience', 'Skills', 'Education', 'Projects', 'Profile']}
              indexBy="date"
              title="Top Performing Blocks"
              description="Block views stacked by block type"
              axisBottomLegend="Date"
              axisLeftLegend="Block Views"
            />
          </div>

          {/* Geographic Distribution */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ChoroplethMap
              data={choroplethData}
              title="Geographic Distribution"
              description="Request distribution by country"
            />
            <StackedBarChart
              data={geographicBarData.map(item => ({ country: item.country, count: item.count }))}
              keys={['count']}
              indexBy="country"
              title="Requests by Country"
              description="Tool calls per country"
              axisBottomLegend="Country"
              axisLeftLegend="Number of Calls"
            />
          </div>

          {/* Security Insights */}
          <div className="grid gap-6 lg:grid-cols-2">
            <SecurityInsights
              spamRequestsBlocked={filteredMetrics.spamRequestsBlocked}
              suspiciousPatterns={filteredMetrics.suspiciousPatterns}
            />
            <StackedBarChart
              data={securityInsightsData}
              keys={['Rate Limit', 'Suspicious Agent', 'Coordinated Attack', 'Malformed Request']}
              indexBy="date"
              title="Security Insights"
              description="Flagged requests stacked by flag type"
              axisBottomLegend="Date"
              axisLeftLegend="Flagged Requests"
            />
          </div>

          {/* Real-time Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Real-time Activity</CardTitle>
                  <CardDescription>Live MCP tool calls (last 24 hours)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockToolCalls.slice(0, 10).map((call, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        call.responseStatus === 'success' ? 'bg-green-500' :
                        call.responseStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <div className="font-medium">{call.toolCalled}</div>
                        <div className="text-sm text-muted-foreground">
                          {call.detectedLLM || 'Unknown LLM'} • {call.clientCity}, {call.clientCountry}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{call.responseTime}ms</div>
                      <div>{new Date(call.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>AI-powered recommendations to improve your resume performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    🚀 High Performing Block
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Your "Senior Software Engineer" experience block gets 40% more views than average. Consider highlighting similar experiences.
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    📈 Growing Interest
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    React skills are trending up 25% this month. Your React expertise block is well-positioned.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                    ⚡ Optimization Tip
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Consider adding more project details. LLMs spend 60% more time on detailed project blocks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'self_reported' && (
        <>
          {/* Self-Reported Analytics Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Self-Reported Analytics</span>
              </CardTitle>
              <CardDescription>
                Track your job search outcomes and measure the effectiveness of your AI-powered resumes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <ResumeMultiSelector
                  resumes={mockResumes}
                  selectedResumeId={filters.resumeId}
                  onResumeChange={handleResumeChange}
                />
              </div>
              
              <SelfReportedJourneyTracker
                journeys={mockSelfReportedJourneys}
                selectedResumeId={filters.resumeId}
                outcomeMetrics={mockOutcomeMetrics}
              />
            </CardContent>
          </Card>

          {/* Application Funnel and Parallel Coordinates */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ApplicationFunnelSankey outcomeMetrics={mockOutcomeMetrics} />
            <ParallelCoordinatesChart
              journeys={mockSelfReportedJourneys}
              resumes={mockResumes}
              toolCallsData={toolCallsByResume}
            />
          </div>

          {/* Combined Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Combined Insights</span>
              </CardTitle>
              <CardDescription>
                Correlations between MCP engagement and job search outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                    🤖 LLM Engagement Impact
                  </h4>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    Resumes with 50+ MCP calls show 35% higher interview rates. Your most-accessed resume is performing well.
                  </p>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                    📊 Block Performance Correlation
                  </h4>
                  <p className="text-sm text-indigo-800 dark:text-indigo-200">
                    Your top-performing blocks correlate with successful applications. Consider featuring them more prominently.
                  </p>
                </div>
                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                  <h4 className="font-medium text-teal-900 dark:text-teal-100 mb-2">
                    🎯 Optimization Opportunity
                  </h4>
                  <p className="text-sm text-teal-800 dark:text-teal-200">
                    Companies that spend more time with your MCP data are 2x more likely to extend offers. Focus on detailed blocks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};