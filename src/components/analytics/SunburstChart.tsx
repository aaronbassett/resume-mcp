import type { FC } from 'react';
import { ResponsiveSunburst } from '@nivo/sunburst';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

interface SunburstChartProps {
  data: any;
  title: string;
  description: string;
}

export const SunburstChart: FC<SunburstChartProps> = ({ data, title, description }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveSunburst
            data={data}
            margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
            id="name"
            value="value"
            cornerRadius={2}
            borderWidth={1}
            borderColor={{ theme: 'background' }}
            colors={{ scheme: 'category10' }}
            childColor={{
              from: 'color',
              modifiers: [['brighter', 0.1]]
            }}
            animate={true}
            motionConfig="gentle"
            isInteractive={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};