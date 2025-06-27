import type { FC } from 'react';
import { ResponsiveParallelCoordinates } from '@nivo/parallel-coordinates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import type { SelfReportedJourney, Resume } from '../../types/analytics';

interface ParallelCoordinatesChartProps {
  journeys: SelfReportedJourney[];
  resumes: Resume[];
  toolCallsData: Array<{ resumeId: string; count: number }>;
}

export const ParallelCoordinatesChart: FC<ParallelCoordinatesChartProps> = ({
  journeys,
  resumes,
  toolCallsData
}) => {
  // Transform data for parallel coordinates
  const data = resumes.map(resume => {
    const journey = journeys.find(j => j.resumeId === resume.id);
    const toolCalls = toolCallsData.find(tc => tc.resumeId === resume.id)?.count || 0;
    
    if (!journey) {
      return {
        id: resume.title,
        toolCalls: toolCalls,
        followUps: 0,
        totalComp: 0
      };
    }

    const followUpCalls = journey.events.filter(e => e.type === 'follow_up_call').length;
    const interviews = journey.events.filter(e => e.type === 'interview_round').length;
    const offers = journey.events.filter(e => e.type === 'offer');
    
    const avgTotalComp = offers.length > 0 
      ? offers.reduce((sum, offer) => sum + (offer as any).totalCompCalculation, 0) / offers.length
      : 0;

    return {
      id: resume.title,
      toolCalls: toolCalls,
      followUps: followUpCalls + interviews,
      totalComp: Math.round(avgTotalComp / 1000) // Convert to thousands
    };
  });

  const variables = [
    {
      key: 'toolCalls',
      type: 'linear' as const,
      min: 0,
      max: Math.max(...data.map(d => d.toolCalls), 100),
      ticksPosition: 'before' as const,
      legend: 'Tool Calls',
      legendPosition: 'start' as const,
      legendOffset: 20
    },
    {
      key: 'followUps',
      type: 'linear' as const,
      min: 0,
      max: Math.max(...data.map(d => d.followUps), 10),
      ticksPosition: 'before' as const,
      legend: 'Follow-ups & Interviews',
      legendPosition: 'start' as const,
      legendOffset: 20
    },
    {
      key: 'totalComp',
      type: 'linear' as const,
      min: 0,
      max: Math.max(...data.map(d => d.totalComp), 200),
      ticksPosition: 'before' as const,
      legend: 'Total Comp (k)',
      legendPosition: 'start' as const,
      legendOffset: 20
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Performance Correlation</CardTitle>
        <CardDescription>Relationship between tool calls, engagement, and offers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveParallelCoordinates
            data={data}
            variables={variables}
            margin={{ top: 50, right: 120, bottom: 50, left: 120 }}
            lineOpacity={0.8}
            axesPlan="foreground"
            axesTicksPosition="before"
            animate={true}
            motionConfig="gentle"
            colors={{ scheme: 'category10' }}
          />
        </div>
      </CardContent>
    </Card>
  );
};