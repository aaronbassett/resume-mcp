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
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { MetricsCard } from '../components/analytics/MetricsCard';
import { TimeRangeSelector } from '../components/analytics/TimeRangeSelector';
import { ResumeSelector } from '../components/analytics/ResumeSelector';
import { RequestsChart } from '../components/analytics/RequestsChart';
import { TopItemsList } from '../components/analytics/TopItemsList';
import { LLMBreakdownChart } from '../components/analytics/LLMBreakdownChart';
import { SecurityInsights } from '../components/analytics/SecurityInsights';
import { GeographicMap } from '../components/analytics/GeographicMap';
import { 
  mockAnalyticsMetrics, 
  mockResumes, 
  calculateAnalyticsMetrics, 
  mockToolCalls 
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

  const [isRefreshing, setIsRefreshing] = useState(false);

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
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    setFilters(prev => ({
      ...prev,
      timeRange: { start, end: now, preset: range as any }
    }));
  };

  const handleResumeChange = (resumeId?: string) => {
    setFilters(prev => ({
      ...prev,
      resumeId
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics Dashboard"
        description="Monitor your resume performance and API usage across all MCP integrations."
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
          <CardDescription>Customize your analytics view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <TimeRangeSelector
              selectedRange={filters.timeRange.preset || 'last_30d'}
              onRangeChange={handleTimeRangeChange}
            />
            <ResumeSelector
              resumes={mockResumes}
              selectedResumeId={filters.resumeId}
              onResumeChange={handleResumeChange}
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeSpam"
                checked={filters.includeSpam}
                onChange={(e) => setFilters(prev => ({ ...prev, includeSpam: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="includeSpam" className="text-sm font-medium">
                Include spam requests
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Requests"
          value={filteredMetrics.totalRequests.toLocaleString()}
          change="+12% from last period"
          changeType="positive"
          trend="up"
          icon={BarChart3}
          description="MCP tool calls received"
        />
        <MetricsCard
          title="Unique Consumers"
          value={filteredMetrics.uniqueConsumers.toLocaleString()}
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

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RequestsChart
          data={filteredMetrics.requestsByDay}
          title="Request Volume"
          description="Daily API calls and unique consumers over time"
        />
        <LLMBreakdownChart data={filteredMetrics.llmBreakdown} />
      </div>

      {/* Top Lists Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopItemsList
          title="Most Called Tools"
          description="Popular MCP endpoints"
          icon={<Code className="h-5 w-5" />}
          items={filteredMetrics.topTools.map(tool => ({
            name: tool.tool,
            count: tool.count,
            percentage: tool.percentage,
            subtitle: `API endpoint: ${tool.tool}`
          }))}
        />
        <TopItemsList
          title="Top Performing Blocks"
          description="Most accessed resume content"
          icon={<Blocks className="h-5 w-5" />}
          items={filteredMetrics.topBlocks.map(block => ({
            name: block.blockName,
            count: block.count,
            percentage: block.percentage,
            subtitle: `Block ID: ${block.blockId}`
          }))}
        />
      </div>

      {/* Security and Geographic Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SecurityInsights
          spamRequestsBlocked={filteredMetrics.spamRequestsBlocked}
          suspiciousPatterns={filteredMetrics.suspiciousPatterns}
        />
        <GeographicMap data={filteredMetrics.geographicData} />
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
    </div>
  );
};