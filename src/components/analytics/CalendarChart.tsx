import type { FC } from 'react';
import { ResponsiveCalendar } from '@nivo/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

interface CalendarChartProps {
  data: Array<{ date: string; count: number }>;
  title: string;
  description: string;
}

export const CalendarChart: FC<CalendarChartProps> = ({ data, title, description }) => {
  // Transform data for calendar format (YYYY-MM-DD)
  const calendarData = data.map(item => ({
    day: item.date,
    value: item.count
  }));

  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear - 1}-01-01`;
  const endDate = `${currentYear}-12-31`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-40">
          <ResponsiveCalendar
            data={calendarData}
            from={startDate}
            to={endDate}
            emptyColor="#eeeeee"
            colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
            margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
            yearSpacing={40}
            monthBorderColor="#ffffff"
            dayBorderWidth={2}
            dayBorderColor="#ffffff"
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'row',
                translateY: 36,
                itemCount: 4,
                itemWidth: 42,
                itemHeight: 36,
                itemsSpacing: 14,
                itemDirection: 'right-to-left'
              }
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
};