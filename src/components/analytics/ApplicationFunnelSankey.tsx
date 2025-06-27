import type { FC } from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import type { OutcomeMetrics } from '../../types/analytics';

interface ApplicationFunnelSankeyProps {
  outcomeMetrics: OutcomeMetrics;
}

export const ApplicationFunnelSankey: FC<ApplicationFunnelSankeyProps> = ({ outcomeMetrics }) => {
  // Transform outcome metrics into Sankey data
  const data = {
    nodes: [
      { id: 'Applications', color: '#3b82f6' },
      { id: 'Interviews', color: '#f97316' },
      { id: 'Offers', color: '#10b981' },
      { id: 'Rejections', color: '#ef4444' },
      { id: 'No Response', color: '#6b7280' }
    ],
    links: [
      {
        source: 'Applications',
        target: 'Interviews',
        value: outcomeMetrics.totalInterviews
      },
      {
        source: 'Applications',
        target: 'No Response',
        value: Math.max(0, outcomeMetrics.totalApplications - outcomeMetrics.totalInterviews - outcomeMetrics.totalRejections)
      },
      {
        source: 'Interviews',
        target: 'Offers',
        value: outcomeMetrics.totalOffers
      },
      {
        source: 'Interviews',
        target: 'Rejections',
        value: Math.max(0, outcomeMetrics.totalInterviews - outcomeMetrics.totalOffers)
      },
      {
        source: 'Applications',
        target: 'Rejections',
        value: Math.max(0, outcomeMetrics.totalRejections - (outcomeMetrics.totalInterviews - outcomeMetrics.totalOffers))
      }
    ].filter(link => link.value > 0)
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Funnel</CardTitle>
        <CardDescription>Flow of applications through your job search process</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveSankey
            data={data}
            margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
            align="justify"
            colors={{ scheme: 'category10' }}
            nodeOpacity={1}
            nodeHoverOthersOpacity={0.35}
            nodeThickness={18}
            nodeSpacing={24}
            nodeBorderWidth={0}
            nodeBorderColor={{
              from: 'color',
              modifiers: [['darker', 0.8]]
            }}
            linkOpacity={0.5}
            linkHoverOthersOpacity={0.1}
            linkContract={3}
            enableLinkGradient={true}
            labelPosition="outside"
            labelOrientation="vertical"
            labelPadding={16}
            labelTextColor={{
              from: 'color',
              modifiers: [['darker', 1]]
            }}
            animate={true}
            motionConfig="gentle"
          />
        </div>
      </CardContent>
    </Card>
  );
};